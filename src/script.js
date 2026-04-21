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
const diffuseTexture = textureLoader.load('/ground/brown_mud_dry_1k/diff.jpg')
const armTexture = textureLoader.load('/ground/brown_mud_dry_1k/arm.jpg')
const normalTexture = textureLoader.load('/ground/brown_mud_dry_1k/nor_gl.jpg')

diffuseTexture.colorSpace = THREE.SRGBColorSpace

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
const planeMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        iTime: { value: 0.0 },
    },
    vertexShader: `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,

    fragmentShader: `
    varying vec2 vUv;
    uniform float iTime;
    float alpha = 1.0;

    const float PERIOD = 1.0;

    void main() {
        float alpha = mod(iTime, PERIOD) < PERIOD * 0.5 ? 1.0 : 0.0;

        gl_FragColor = vec4(1.0, 0.0, 0.0, alpha);
    }
    `,
})

const plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), planeMaterial)

plane.rotation.x += -Math.PI / 2
plane.position.y = 0.2

plane.receiveShadow = true

scene.add(plane)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(5, 10, 5)
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

/**
 * Controls
 */
const controls = new OrbitControls(camera, renderer.domElement)

/**
 * Tick
 */
const clock = new THREE.Clock()
let elapsed = 0

const tick = () => {
    const delta = clock.getDelta()

    planeMaterial.uniforms.iTime.value += delta

    stats.update()
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
