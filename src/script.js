import { GUI } from 'lil-gui'
import Stats from 'stats.js'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

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
 * Models
 */
let frameMesh = null

const gltfLoader = new GLTFLoader()
gltfLoader.load('/tp6/model.glb', (glb) => {
    const buttonColors = {
        button1: '#FFA0FF',
        button2: '#75FFFD',
        button3: '#FFFFFF',
        button4: '#30FD3B',
        button5: '#FF5555',
    }

    glb.scene.traverse((child) => {
        if (!child.isMesh) return

        if (child.name === 'frame') {
            child.material.emissive.set(0xffffff)
            frameMesh = child
            console.log(child.geometry.getSize())

            const rectAreaLight = new THREE.RectAreaLight(
                0xffffff,
                3,
                child.geometry,
            )
        }

        if (child.name in buttonColors) {
            child.material.emissive.set(buttonColors[child.name])
            child.material.emissiveIntensity = 2
        }
    })

    scene.add(glb.scene)
})

/**
 * Textures
 */

const textureLoader = new THREE.TextureLoader()

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

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
    155,
)

camera.position.set(10.2, 5.8, 9.2)
camera.lookAt(2.5, 4.5, 0)

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

// scene.add(plane)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
scene.add(ambientLight)

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
 * Post-processing
 */
const composer = new EffectComposer(renderer)
composer.setSize(sizes.width, sizes.height)
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    0.15,
    0,
    0.9,
)

gui.add(bloomPass, 'strength').min(0).max(2).step(0.001)
gui.add(bloomPass, 'radius').min(0).max(2).step(0.001)
gui.add(bloomPass, 'threshold').min(0).max(2).step(0.0001)

composer.addPass(bloomPass)

const outputPass = new OutputPass()
composer.addPass(outputPass)

/**
 * Controls
 */
// const controls = new OrbitControls(camera, renderer.domElement)

/**
 * Tick
 */
const clock = new THREE.Clock()

const tick = () => {
    const delta = clock.getDelta()

    stats.update()
    // controls.update()
    composer.render()
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
