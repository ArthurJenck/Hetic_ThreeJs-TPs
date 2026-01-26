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
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
    60,
    sizes.width / sizes.height,
    0.1,
    1550,
)

camera.position.set(50, 40, 40)
camera.lookAt(0, 0, 0)

scene.add(camera)

/**
 * Objects
 */
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({ color: 0xffffff }),
)
plane.rotation.x = -Math.PI / 2
scene.add(plane)

const CUBE_SIZE = 10
const MAX_CUBE_COUNT = 5

const cubesGroup = new THREE.Group()

const renderRow = (row) => {
    const rowGroup = new THREE.Group()
    const offset = MAX_CUBE_COUNT - row

    for (let i = 0; i < row; i++) {
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE),
            new THREE.MeshPhongMaterial({ color: '#19ef76' }),
        )

        cube.position.x += CUBE_SIZE * i * 2
        rowGroup.add(cube)
    }

    rowGroup.position.y = (5 - row) * CUBE_SIZE
    rowGroup.position.x += offset * CUBE_SIZE
    return rowGroup
}

for (let i = MAX_CUBE_COUNT; i > 0; i--) {
    const row = renderRow(i)
    cubesGroup.add(row)
}

scene.add(cubesGroup)
cubesGroup.position.y = CUBE_SIZE / 2
cubesGroup.position.x = -CUBE_SIZE * 4

const cubesFolder = gui.addFolder('Cubes')
cubesFolder.open()

let cubeCount = 1
cubesGroup.children.forEach((row, i) => {
    row.children.forEach((cube, j) => {
        const singleCubeFolder = cubesFolder.addFolder(`Cube ${cubeCount}`)

        singleCubeFolder.addColor(cube.material, 'color')
        singleCubeFolder.add(cube.position, 'x').min(-45).max(45)
        singleCubeFolder.add(cube.position, 'z').min(-45).max(45)

        cubeCount++
    })
})

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

    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
