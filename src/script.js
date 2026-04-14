import { GUI } from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'stats.js'

/**
 * GUI
 */
const gui = new GUI({
    // closeFolders: true,
})

/**
 * Stats
 */
const stats = Stats()
document.body.appendChild(stats.dom)

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

/**
 * Axes helper
 */
const axesHelper = new THREE.AxesHelper(sizes.width, sizes.height)
scene.add(axesHelper)

axesHelper.visible = false

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
    60,
    sizes.width / sizes.height,
    0.1,
    1550,
)

camera.position.set(10, 10, 10)
camera.lookAt(0, 0, 0)

scene.add(camera)

/**
 * Objects
 */
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0xadadad }),
)

plane.rotation.x += -Math.PI / 2
plane.position.y = 0.2

plane.receiveShadow = true

scene.add(plane)

const count = 50000
const meshMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)

// for (let i = 0; i < count; i++) {
//     const mesh = new THREE.Mesh(cubeGeometry, meshMaterial)
//     mesh.position.set(
//         (Math.random() - 0.5) * 500,
//         Math.random() * 100,
//         (Math.random() - 0.5) * 500,
//     )
//     scene.add(mesh)
// }

const instancedMesh = new THREE.InstancedMesh(cubeGeometry, meshMaterial, count)
const dummy = new THREE.Object3D()

for (let i = 0; i < count; i++) {
    dummy.position.set(
        (Math.random() - 0.5) * 500,
        Math.random() * 100,
        (Math.random() - 0.5) * 500,
    )
    dummy.updateMatrix()
    instancedMesh.setMatrixAt(i, dummy.matrix)
}

scene.add(instancedMesh)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 3)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(-20, 20, -20)
directionalLight.castShadow = true

directionalLight.shadow.mapSize.width = 2056
directionalLight.shadow.mapSize.height = 2056
directionalLight.shadow.camera.top = 15
directionalLight.shadow.camera.right = 15
directionalLight.shadow.camera.bottom = -15
directionalLight.shadow.camera.left = -15
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 200

scene.add(directionalLight)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

renderer.render(scene, camera)

/**
 * Controls
 */
const controls = new OrbitControls(camera, renderer.domElement)

/**
 * Tick
 */
const clock = new THREE.Clock()

const tick = () => {
    const delta = clock.getDelta()

    stats.update()
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
