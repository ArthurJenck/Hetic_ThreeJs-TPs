import { GUI } from 'lil-gui'
import Stats from 'stats.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

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
 * Textures
 */

const textureLoader = new THREE.TextureLoader()
const snowflakeTexture = textureLoader.load('/snowflake/snowflake.jpg')

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
    155,
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

// scene.add(plane)

const obj = {
    count: 1000,
}

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.2,
    sizeAttenuation: true,
    map: snowflakeTexture,
    transparent: true,
    alphaMap: snowflakeTexture,
    alphaTest: 0.01,
    depthWrite: false,
})

let particlesGeometry = null
let particlesMesh = null
let velocities = null
let phases = null
let amplitudes = null

const createParticles = (count) => {
    if (particlesMesh) scene.remove(particlesMesh)
    if (particlesGeometry) particlesGeometry.dispose()

    particlesGeometry = new THREE.BufferGeometry()

    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20
    }

    particlesGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3),
    )

    velocities = new Float32Array(count)
    phases = new Float32Array(count)
    amplitudes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
        velocities[i] = 0.5 + Math.random()
        phases[i] = Math.random() * Math.PI * 2
        amplitudes[i] = 0.5 + Math.random()
    }

    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)
}

createParticles(obj.count)

gui.add(obj, 'count').min(1).max(10000).step(1).onChange(createParticles)

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
let elapsedTime = 0

const tick = () => {
    const delta = clock.getDelta()
    elapsedTime += delta

    const posArray = particlesGeometry.attributes.position.array

    for (let i = 0; i < obj.count; i++) {
        const i3 = i * 3

        posArray[i3 + 1] -= velocities[i] * delta
        posArray[i3] +=
            Math.sin(elapsedTime * 0.5 + phases[i]) * amplitudes[i] * delta

        if (posArray[i3 + 1] < -10) {
            posArray[i3] = (Math.random() - 0.5) * 20
            posArray[i3 + 1] = 10
            posArray[i3 + 2] = (Math.random() - 0.5) * 20
        }
    }

    particlesGeometry.attributes.position.needsUpdate = true

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
