import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'lil-gui'

/**
 * GUI
 */
const gui = new GUI({
    closeFolders: true,
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

camera.position.set(60, 60, 70)
camera.lookAt(0, 0, 0)

scene.add(camera)

/**
 * Objects
 */
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.MeshPhongMaterial({ color: 0xffffff }),
)
plane.rotation.x = -Math.PI / 2
scene.add(plane)

const GRID_SIDE = 10

const gridGroup = new THREE.Group()

for (let i = 0; i < GRID_SIDE; i++) {
    const rowGroup = new THREE.Group()

    for (let j = 0; j < GRID_SIDE; j++) {
        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(1),
            new THREE.MeshPhongMaterial({ color: 'yellow' }),
        )
        sphere.position.x += GRID_SIDE * j
        rowGroup.add(sphere)
    }

    rowGroup.position.z = GRID_SIDE * i
    gridGroup.add(rowGroup)
}

gridGroup.translateX(-45)
gridGroup.translateZ(-45)
scene.add(gridGroup)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 10)
directionalLight.position.set(0, 25, 0)
scene.add(directionalLight)

const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
)
scene.add(directionalLightHelper)

directionalLightHelper.visible = false

const directionalLightFolder = gui.addFolder('Directional light')
directionalLightFolder.addColor(directionalLight, 'color')
directionalLightFolder
    .add(directionalLight.position, 'x')
    .min(-25)
    .max(25)
    .step(0.001)
directionalLightFolder
    .add(directionalLight.position, 'y')
    .min(-25)
    .max(25)
    .step(0.001)
directionalLightFolder
    .add(directionalLight.position, 'z')
    .min(-25)
    .max(25)
    .step(0.001)

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
    const elapsedTime = clock.getElapsedTime()
    controls.update()

    for (const [rowIndex, row] of gridGroup.children.entries()) {
        for (const [sphereIndex, sphere] of row.children.entries()) {
            const waveSpacingFactor = 0.4
            const waveSpeedFactor = 3
            const amplitudeFactor = 2
            const lowestY = sphere.geometry.parameters.radius + 2

            sphere.position.y =
                Math.sin(
                    elapsedTime * waveSpeedFactor +
                        sphereIndex * waveSpacingFactor +
                        rowIndex * waveSpacingFactor,
                ) *
                    amplitudeFactor +
                lowestY
        }
    }

    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
