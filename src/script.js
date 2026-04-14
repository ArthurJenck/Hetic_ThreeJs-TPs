import { GUI } from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js'

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
 * Loaders
 */
const textureLoader = new THREE.TextureLoader()
const stainDiffuse = textureLoader.load('/decal/diff.png')
const stainNormal = textureLoader.load('/decal/normal.png')

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

const wall = new THREE.Mesh(
    new THREE.BoxGeometry(15, 7, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xff0000 }),
)
wall.position.y += wall.geometry.parameters.height / 2 + 0.2
wall.rotation.y += 0.7

scene.add(wall)

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

/**
 * Mouse
 */
const mouse = new THREE.Vector2(-1, 1)

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / sizes.width) * 2 - 1
    mouse.y = -((e.clientY / sizes.height) * 2 - 1)
})

let decalCount = 0

window.addEventListener('click', () => {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(wall)
    if (intersects.length === 0) return

    const hit = intersects[0]
    const position = hit.point.clone()
    const orientation = new THREE.Euler()
    orientation.copy(wall.rotation)

    const rand = Math.random() + 0.1
    const size = new THREE.Vector3(rand, rand, 2)

    const randomColor =
        '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6)

    const stain = new THREE.Mesh(
        new DecalGeometry(wall, position, orientation, size),
        new THREE.MeshStandardMaterial({
            color: randomColor,
            normalMap: stainNormal,
            map: stainDiffuse,
            transparent: true,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1,
            depthWrite: false,
        }),
    )

    stain.renderOrder = decalCount++
    scene.add(stain)
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
 * Tick
 */
const clock = new THREE.Clock()

const tick = () => {
    const delta = clock.getDelta()

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
