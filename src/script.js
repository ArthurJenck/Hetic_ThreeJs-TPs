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
 * Loaders
 */
const glbLoader = new GLTFLoader()
glbLoader.load('/models/cup/mug.glb', (glb) => {
    glb.scene.children.forEach((child) => {
        child.castShadow = true
    })

    gui.addColor(glb.scene.children[0].material, 'color').onChange(
        (newColor) => {
            glb.scene.traverse((child) => {
                if (child.isMesh) {
                    child.material.color = newColor
                }
            })
        },
    )

    gui.add(glb.scene.scale, 'x')
        .name('scale')
        .min(0.5)
        .max(10)
        .step(0.001)
        .onChange((newScale) => {
            glb.scene.scale.setScalar(newScale)
        })

    scene.add(glb.scene)
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

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 3)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(-10, 10, -10)
directionalLight.castShadow = true

directionalLight.shadow.mapSize.width = 1048
directionalLight.shadow.mapSize.height = 1048
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 25

scene.add(directionalLight)

const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
)

scene.add(directionalLightHelper)

const directionalLightCameraHelper = new THREE.CameraHelper(
    directionalLight.shadow.camera,
)

scene.add(directionalLightCameraHelper)

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
// const clock = new THREE.Clock()

const tick = () => {
    // const elapsedTime = clock.getElapsedTime()
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
