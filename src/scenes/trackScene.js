import * as THREE from 'three'
import { highestRiskSegment } from '../lib/segmentUtils.js'

const SEGMENT_IDS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6']

function segmentToX(id) {
  const idx = SEGMENT_IDS.indexOf(id)
  if (idx < 0) return 0
  return (idx - 2.5) * 1.6
}

export function createTrackScene(container, { segmentsRef }) {
  const width = container.clientWidth
  const height = container.clientHeight

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const trackGroup = new THREE.Group()

  const railGeom = new THREE.BoxGeometry(20, 0.5, 0.2)
  const railMat = new THREE.MeshPhongMaterial({ color: 0x333333 })
  const rail1 = new THREE.Mesh(railGeom, railMat)
  rail1.position.z = -0.5
  const rail2 = new THREE.Mesh(railGeom, railMat)
  rail2.position.z = 0.5
  trackGroup.add(rail1, rail2)

  for (let i = -10; i <= 10; i += 2) {
    const sleeperGeom = new THREE.BoxGeometry(0.5, 0.3, 2)
    const sleeper = new THREE.Mesh(sleeperGeom, railMat)
    sleeper.position.x = i
    sleeper.position.y = -0.3
    trackGroup.add(sleeper)
  }

  const sphereGeom = new THREE.SphereGeometry(0.3, 32, 32)
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 })
  const anomaly = new THREE.Mesh(sphereGeom, sphereMat)
  anomaly.position.set(2, 0.5, 0)
  trackGroup.add(anomaly)

  scene.add(trackGroup)

  const light = new THREE.PointLight(0xffffff, 1, 100)
  light.position.set(5, 5, 5)
  scene.add(light)
  scene.add(new THREE.AmbientLight(0x404040))

  camera.position.z = 8
  camera.position.y = 3
  camera.lookAt(0, 0, 0)

  let targetRotY = 0
  let targetRotX = 0
  let targetZoom = 8

  const onMove = (e) => {
    const rect = container.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const my = ((e.clientY - rect.top) / rect.height) * 2 - 1
    targetRotY = mx * 0.2
    targetRotX = my * 0.1
  }
  container.addEventListener('mousemove', onMove)

  let frameId = 0
  let disposed = false

  const animate = () => {
    if (disposed) return
    frameId = requestAnimationFrame(animate)

    trackGroup.rotation.y += 0.002
    trackGroup.rotation.y += (targetRotY - trackGroup.rotation.y) * 0.04
    trackGroup.rotation.x += (targetRotX - trackGroup.rotation.x) * 0.04

    const segs = segmentsRef.current || []
    const worst = highestRiskSegment(segs)
    const targetX = worst ? segmentToX(worst.id) : 2
    anomaly.position.x += (targetX - anomaly.position.x) * 0.05
    anomaly.scale.setScalar(1 + Math.sin(Date.now() * 0.01) * 0.2)

    camera.position.z += (targetZoom - camera.position.z) * 0.05
    camera.position.y = 3
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
    container.removeEventListener('mousemove', onMove)
    window.removeEventListener('resize', onResize)
    renderer.dispose()
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement)
    }
  }

  const setZoom = (delta) => {
    targetZoom = Math.min(14, Math.max(5, targetZoom + delta))
  }

  const resetView = () => {
    targetRotY = 0
    targetRotX = 0
    targetZoom = 8
  }

  return { dispose, setZoom, resetView }
}
