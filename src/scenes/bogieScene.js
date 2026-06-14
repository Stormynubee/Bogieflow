import * as THREE from 'three'

export function createBogieScene(container) {
  const width = container.clientWidth
  const height = container.clientHeight

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const group = new THREE.Group()
  const axleGeom = new THREE.CylinderGeometry(0.2, 0.2, 4, 32)
  const axleMat = new THREE.MeshPhongMaterial({ color: 0x444444 })
  const axle = new THREE.Mesh(axleGeom, axleMat)
  axle.rotation.z = Math.PI / 2
  group.add(axle)

  const wheelGeom = new THREE.TorusGeometry(1, 0.2, 16, 100)
  const wheelMat = new THREE.MeshPhongMaterial({ color: 0xff3b30 })
  const wheel1 = new THREE.Mesh(wheelGeom, wheelMat)
  wheel1.position.x = -1.5
  const wheel2 = new THREE.Mesh(wheelGeom, wheelMat)
  wheel2.position.x = 1.5
  group.add(wheel1, wheel2)

  scene.add(group)

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(0, 10, 10)
  scene.add(light)
  scene.add(new THREE.AmbientLight(0x222222))

  let targetZoom = 5
  camera.position.z = targetZoom

  let frameId = 0
  let disposed = false

  const animate = () => {
    if (disposed) return
    frameId = requestAnimationFrame(animate)

    group.rotation.y += 0.004
    group.rotation.x += 0.002

    camera.position.z += (targetZoom - camera.position.z) * 0.05
    camera.lookAt(0, 0, 0)

    renderer.render(scene, camera)
  }
  animate()

  const onResize = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', onResize)

  const dispose = () => {
    disposed = true
    cancelAnimationFrame(frameId)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement)
    }
  }

  const setZoom = (delta) => {
    targetZoom = Math.min(10, Math.max(3, targetZoom + delta))
  }

  const resetView = () => {
    targetZoom = 5
    group.rotation.set(0, 0, 0)
  }

  return { dispose, setZoom, resetView }
}
