import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'lil-gui'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'

RectAreaLightUniformsLib.init()

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
const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    metalness: 0.2,
    roughness: 0,
})

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({
        color: 0x808080,
        metalness: 0,
        roughness: 0,
    }),
)

plane.rotation.x += -Math.PI / 2
plane.position.y -= 50

scene.add(plane)

const sphere = new THREE.Mesh(new THREE.SphereGeometry(7), material)

sphere.position.x -= 15
sphere.position.z += 15

scene.add(sphere)

const sphereFolder = gui.addFolder('Sphere')

sphereFolder.addColor(sphere.material, 'color')
sphereFolder.add(sphere.material, 'metalness').min(0).max(1).step(0.001)
sphereFolder.add(sphere.material, 'roughness').min(0).max(1).step(0.001)

const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(7, 2.5), material)

torusKnot.position.x += 15

scene.add(torusKnot)

const torusKnotFolder = gui.addFolder('Torus knot')

torusKnotFolder.addColor(sphere.material, 'color')
torusKnotFolder.add(sphere.material, 'metalness').min(0).max(1).step(0.001)
torusKnotFolder.add(sphere.material, 'roughness').min(0).max(1).step(0.001)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const ambientLightFolder = gui.addFolder('Ambient light')

ambientLightFolder.add(ambientLight, 'intensity').min(0).max(10).step(0.0001)

const rectLight = new THREE.RectAreaLight(0xffffff, 3, 50, 50)

rectLight.lookAt(0, -40, 0)

scene.add(rectLight)

const rectLightMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(rectLight.width, rectLight.height),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        color: rectLight.color,
    }),
)

rectLight.add(rectLightMesh)

const rectLightFolder = gui.addFolder('Rect light')

const params = {
    rotationEnabled: true,
}

const updateRectLightMesh = () => {
    rectLightMesh.geometry.dispose()
    rectLightMesh.geometry = new THREE.PlaneGeometry(
        rectLight.width,
        rectLight.height,
    )

    rectLightMesh.material.color.copy(rectLight.color)
}

rectLightFolder.add(params, 'rotationEnabled')
rectLightFolder.addColor(rectLight, 'color').onChange(updateRectLightMesh)
rectLightFolder
    .add(rectLight, 'width')
    .min(50)
    .max(1000)
    .step(0.0001)
    .onChange(updateRectLightMesh)
rectLightFolder
    .add(rectLight, 'height')
    .min(50)
    .max(1000)
    .step(0.0001)
    .onChange(updateRectLightMesh)
rectLightFolder.add(rectLight, 'intensity').min(0).max(10).step(0.0001)

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
const elapsedTime = clock.getElapsedTime()
let delta = elapsedTime

const tick = () => {
    if (params.rotationEnabled) {
        rectLight.position.x = Math.cos(delta * 1) * 100
        rectLight.position.z = Math.sin(delta * 1) * 100

        rectLight.lookAt(0, -40, 0)
        delta += 0.02
    }

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
