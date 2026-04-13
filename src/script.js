import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'lil-gui'

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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

// const groundArmTexture = textureLoader.load('/ground/brown_mud_dry_1k/arm.jpg')
// const groundColorTexture = textureLoader.load(
//     '/ground/brown_mud_dry_1k/diff.jpg',
// )
// const groundNormalTexture = textureLoader.load(
//     '/ground/brown_mud_dry_1k/nor_gl.jpg',
// )
const groundArmTexture = textureLoader.load(
    '/ground/rock_embedded_floor_1k/arm.jpg',
)
const groundColorTexture = textureLoader.load(
    '/ground/rock_embedded_floor_1k/diff.jpg',
)
const groundNormalTexture = textureLoader.load(
    '/ground/rock_embedded_floor_1k/nor_gl.jpg',
)

groundColorTexture.colorSpace = THREE.SRGBColorSpace

groundColorTexture.repeat.set(8, 8)
groundArmTexture.repeat.set(8, 8)
groundNormalTexture.repeat.set(8, 8)

groundColorTexture.wrapS = THREE.RepeatWrapping
groundArmTexture.wrapS = THREE.RepeatWrapping
groundNormalTexture.wrapS = THREE.RepeatWrapping

groundColorTexture.wrapT = THREE.RepeatWrapping
groundArmTexture.wrapT = THREE.RepeatWrapping
groundNormalTexture.wrapT = THREE.RepeatWrapping

// const wallArmTexture = textureLoader.load(
//     '/wall/castle_brick_02_white_1k/arm.jpg',
// )
// const wallColorTexture = textureLoader.load(
//     '/wall/castle_brick_02_white_1k/diff.jpg',
// )
// const wallNormalTexture = textureLoader.load(
//     '/wall/castle_brick_02_white_1k/nor_gl.jpg',
// )

const wallArmTexture = textureLoader.load('/wall/rusty_metal_grid_1k/arm.jpg')
const wallColorTexture = textureLoader.load(
    '/wall/rusty_metal_grid_1k/diff.jpg',
)
const wallNormalTexture = textureLoader.load(
    '/wall/rusty_metal_grid_1k/nor_gl.jpg',
)

wallArmTexture.colorSpace = THREE.SRGBColorSpace

wallArmTexture.repeat.set(4, 4)
wallColorTexture.repeat.set(4, 4)
wallNormalTexture.repeat.set(4, 4)

wallArmTexture.wrapS = THREE.RepeatWrapping
wallColorTexture.wrapS = THREE.RepeatWrapping
wallNormalTexture.wrapS = THREE.RepeatWrapping

wallArmTexture.wrapT = THREE.RepeatWrapping
wallColorTexture.wrapT = THREE.RepeatWrapping
wallNormalTexture.wrapT = THREE.RepeatWrapping

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

camera.position.set(125, 100, 125)
camera.lookAt(0, 0, 0)

scene.add(camera)

/**
 * Objects
 */
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({
        map: groundColorTexture,
        aoMap: groundArmTexture,
        metalnessMap: groundArmTexture,
        roughnessMap: groundArmTexture,
        normalMap: groundNormalTexture,
    }),
)

plane.rotation.x += -Math.PI / 2
plane.position.y -= 50

scene.add(plane)

const wall = new THREE.Mesh(
    new THREE.BoxGeometry(600, 400, 10),
    new THREE.MeshPhysicalMaterial({
        map: wallColorTexture,
        aoMap: wallArmTexture,
        metalnessMap: wallArmTexture,
        roughnessMap: wallArmTexture,
        normalMap: wallNormalTexture,
        transmission: 1,
        roughness: 0.5,
    }),
)

scene.add(wall)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 3)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(5, 5, 10)
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
    // const elapsedTime = clock.getElapsedTime()
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
