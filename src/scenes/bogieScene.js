import * as THREE from 'three'
import { attachOrbitZoom } from './sceneControls.js'

function hexToColor(hex) {
  if (!hex) return 0xff3b30
  return parseInt(hex.replace('#', ''), 16)
}

export function createBogieScene(container, { focusSegmentRef }) {
  const width = container.clientWidth
  const height = container.clientHeight

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x08090b)
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const group = new THREE.Group()

  // Axle (textured heavy metal cylinder)
  const axleGeom = new THREE.CylinderGeometry(0.18, 0.18, 3.8, 32)
  const axleMat = new THREE.MeshPhongMaterial({
    color: 0x50525a,
    specular: 0x222222,
    shininess: 30,
  })
  const axle = new THREE.Mesh(axleGeom, axleMat)
  axle.rotation.z = Math.PI / 2
  group.add(axle)

  // Wheel setup (composed wheels with detailed tire + hub cap + bolts)
  const wheelGroup1 = new THREE.Group()
  const wheelGroup2 = new THREE.Group()

  // Tire (thick torus geometry, dark iron color — no emissive glow)
  const tireGeom = new THREE.TorusGeometry(0.9, 0.22, 16, 64)
  const tireMat = new THREE.MeshPhongMaterial({
    color: 0xff3b30,
    specular: 0x666666,
    shininess: 70,
  })
  const tire1 = new THREE.Mesh(tireGeom, tireMat)
  const tire2 = new THREE.Mesh(tireGeom, tireMat)
  
  // Hub caps (flat cylinders inside the tires)
  const hubGeom = new THREE.CylinderGeometry(0.6, 0.6, 0.15, 32)
  const hubMat = new THREE.MeshPhongMaterial({
    color: 0x3a3c42,
    specular: 0x888888,
    shininess: 60,
  })
  const hub1 = new THREE.Mesh(hubGeom, hubMat)
  hub1.rotation.x = Math.PI / 2
  const hub2 = new THREE.Mesh(hubGeom, hubMat)
  hub2.rotation.x = Math.PI / 2

  wheelGroup1.add(tire1, hub1)
  wheelGroup2.add(tire2, hub2)

  // Position wheels at axle ends
  wheelGroup1.position.x = -1.6
  wheelGroup2.position.x = 1.6
  
  group.add(wheelGroup1, wheelGroup2)

  // Brake discs (thin cylinders between wheels and hubs)
  const brakeGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.08, 32)
  const brakeMat = new THREE.MeshPhongMaterial({
    color: 0x2a2c30,
    specular: 0x444444,
    shininess: 40,
  })
  const brake1 = new THREE.Mesh(brakeGeom, brakeMat)
  brake1.rotation.z = Math.PI / 2
  brake1.position.set(-1.3, 0, 0)
  const brake2 = new THREE.Mesh(brakeGeom, brakeMat)
  brake2.rotation.z = Math.PI / 2
  brake2.position.set(1.3, 0, 0)
  group.add(brake1, brake2)

  // Suspension springs / dampers on top of axle (visual depth)
  const springGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16)
  const springMat = new THREE.MeshPhongMaterial({ color: 0x2b2d32, shininess: 15 })
  const spring1 = new THREE.Mesh(springGeom, springMat)
  spring1.position.set(-1.0, 0.4, 0)
  const spring2 = new THREE.Mesh(springGeom, springMat)
  spring2.position.set(1.0, 0.4, 0)
  group.add(spring1, spring2)

  scene.add(group)

  // Balanced lighting setup
  scene.add(new THREE.HemisphereLight(0xffffff, 0x111122, 0.9))
  
  const rim = new THREE.DirectionalLight(0xffb4aa, 0.8)
  rim.position.set(-4, 6, -2)
  scene.add(rim)
  
  const key = new THREE.DirectionalLight(0xffffff, 1.2)
  key.position.set(2, 8, 8)
  scene.add(key)
  
  scene.add(new THREE.AmbientLight(0x303040, 0.4))

  camera.position.set(0, 2, 6.5)
  camera.lookAt(0, 0, 0)

  // Attach OrbitControls wrapper
  const controls = attachOrbitZoom(container, camera, new THREE.Vector3(0, 0.1, 0), {
    minZoom: 3,
    maxZoom: 10,
    initialZoom: 6.5,
  })

  let frameId = 0
  let disposed = false

  const animate = () => {
    if (disposed) return
    frameId = requestAnimationFrame(animate)

    // Update OrbitControls
    controls.update()

    // Sync wheel color & spin speed dynamically to active segment risk/telemetry
    const focus = focusSegmentRef?.current
    let risk = 0.1
    let speed = 0.02

    if (focus) {
      risk = focus.risk_index ?? 0
      const color = hexToColor(focus.color)
      tireMat.color.setHex(color)
      
      // Speed increases with vibration z-score
      const z = focus.vib_z ?? 0
      speed = 0.01 + Math.min(0.2, (z + 1) * 0.015)
    }

    // Rotate wheels around x-axis (the axle runs along x)
    wheelGroup1.rotation.x += speed
    wheelGroup2.rotation.x += speed

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
    controls.dispose()
    window.removeEventListener('resize', onResize)
    renderer.dispose()
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement)
    }
  }

  const setZoom = (delta) => {
    controls.setZoom(delta)
  }

  const resetView = () => {
    controls.resetView()
    group.rotation.set(0, 0, 0)
  }

  return { dispose, setZoom, resetView }
}
