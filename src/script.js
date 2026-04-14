import { GUI } from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

/**
 * GUI
 */
const gui = new GUI({
    // closeFolders: true,
})

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

const cubeGeometry = new THREE.BoxGeometry(2, 2, 2)
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff })
let currentIntersect = null
const objectsToTest = []

for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
        const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
        cubeMesh.position.set(j * 3, 1.2, i * 3)

        objectsToTest.push(cubeMesh)

        scene.add(cubeMesh)
    }
}

const mouse = new THREE.Vector2(-1, 1)

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / sizes.width) * 2 - 1
    mouse.y = -((e.clientY / sizes.height) * 2 - 1)
})

window.addEventListener('click', () => {
    scene.remove(currentIntersect.object)
})

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

// const directionalLightHelper = new THREE.DirectionalLightHelper(
//     directionalLight,
// )

// scene.add(directionalLightHelper)

// const directionalLightCameraHelper = new THREE.CameraHelper(
//     directionalLight.shadow.camera,
// )

// scene.add(directionalLightCameraHelper)

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
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

/**
 * Tick
 */
const clock = new THREE.Clock()

const tick = () => {
    const delta = clock.getDelta()

    raycaster.setFromCamera(mouse, camera)

    const intersects = raycaster.intersectObjects(objectsToTest)
    currentIntersect = intersects[0]

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
