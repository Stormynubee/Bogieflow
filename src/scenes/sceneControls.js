import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Shared Three.js camera controls using standard OrbitControls.
 */
export function attachOrbitZoom(container, camera, target, opts = {}) {
  const {
    minZoom = 3,
    maxZoom = 14,
    onPick,
    pickables = [],
    initialZoom = 8,
  } = opts

  // Initialize OrbitControls on the container element
  const controls = new OrbitControls(camera, container)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = minZoom
  controls.maxDistance = maxZoom
  controls.target.copy(target)
  controls.enablePan = true
  controls.enableZoom = true

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let pointerDownTime = 0
  let pointerDownPos = { x: 0, y: 0 }

  const onPointerDown = (e) => {
    pointerDownTime = Date.now()
    pointerDownPos = { x: e.clientX, y: e.clientY }
  }

  const onClick = (e) => {
    const clickDuration = Date.now() - pointerDownTime
    const dx = e.clientX - pointerDownPos.x
    const dy = e.clientY - pointerDownPos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Only register a pick click if the pointer didn't drag/move significantly
    if (clickDuration > 250 || distance > 5 || !onPick || !pickables.length) return

    const rect = container.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(pickables, false)
    if (hits.length > 0) {
      const id = hits[0].object.userData?.segmentId
      if (id) onPick(id)
    }
  }

  container.addEventListener('pointerdown', onPointerDown)
  container.addEventListener('click', onClick)

  const update = () => {
    controls.update()
  }

  const setZoom = (delta) => {
    // Zoom in/out factor
    const zoomFactor = delta > 0 ? 1.1 : 0.9
    const offset = camera.position.clone().sub(controls.target)
    offset.multiplyScalar(zoomFactor)
    
    const newDist = offset.length()
    if (newDist >= minZoom && newDist <= maxZoom) {
      camera.position.copy(controls.target).add(offset)
    }
  }

  const resetView = () => {
    controls.reset()
    camera.position.set(0, 3, initialZoom)
    controls.target.copy(target)
    controls.update()
  }

  const dispose = () => {
    container.removeEventListener('pointerdown', onPointerDown)
    container.removeEventListener('click', onClick)
    controls.dispose()
  }

  return { update, setZoom, resetView, dispose }
}
