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

camera.position.set(200, 150, 200)
camera.lookAt(0, 0, 0)

scene.add(camera)

/**
 * Objects
 */
// Plane
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.MeshPhongMaterial({ color: 0xffffff }),
)
plane.rotation.x = -Math.PI / 2
// scene.add(plane)

// Laptop
const laptopGroup = new THREE.Group()
scene.add(laptopGroup)

const drawRoundedRect = (
    target,
    width,
    height,
    radius,
    offsetX = 0,
    offsetY = 0,
) => {
    const x = offsetX
    const y = offsetY
    const r = Math.min(radius, width / 2, height / 2)

    target.moveTo(x + r, y)
    target.lineTo(x + width - r, y)
    target.quadraticCurveTo(x + width, y, x + width, y + r)
    target.lineTo(x + width, y + height - r)
    target.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
    target.lineTo(x + r, y + height)
    target.quadraticCurveTo(x, y + height, x, y + height - r)
    target.lineTo(x, y + r)
    target.quadraticCurveTo(x, y, x + r, y)

    return target
}

const createRoundedBox = (
    width,
    height,
    depth,
    radius,
    smoothness,
    holes = [],
) => {
    const shape = new THREE.Shape()
    drawRoundedRect(shape, width, depth, radius, -width / 2, -depth / 2)

    const holeArray = Array.isArray(holes) ? holes : holes ? [holes] : []

    for (const hole of holeArray) {
        const holePath = new THREE.Path()
        drawRoundedRect(
            holePath,
            hole.width,
            hole.depth,
            hole.radius,
            hole.offsetX - hole.width / 2,
            hole.offsetY - hole.depth / 2,
        )
        shape.holes.push(holePath)
    }

    const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: height,
        bevelEnabled: true,
        bevelSegments: smoothness * 2,
        steps: 1,
        bevelSize: radius,
        bevelThickness: radius,
        curveSegments: smoothness,
    })

    return geometry
}

const baseWidth = 200
const baseDepth = 250
const baseHeight = 4
const baseRadius = 2

const trackpadFloorWidth = 60
const trackpadFloorDepth = 80
const trackpadFloorOffsetX = 70

// const keyboardWidth = 240
// const keyboardDepth = 80
// const keyboardOffsetZ = -40

const laptopBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })

const bottomFrameGeometry = createRoundedBox(
    baseWidth,
    baseHeight,
    baseDepth,
    baseRadius,
    3,
    [
        {
            width: trackpadFloorWidth,
            depth: trackpadFloorDepth,
            radius: 5,
            offsetX: trackpadFloorOffsetX,
            offsetY: 0,
        },
        // {
        //     width: keyboardWidth,
        //     height: keyboardDepth,
        //     radius: 5,
        //     offsetX: 0,
        //     offsetY: keyboardOffsetZ,
        // },
    ],
)
const bottomFrame = new THREE.Mesh(bottomFrameGeometry, laptopBaseMaterial)
bottomFrame.rotation.x = Math.PI / 2
laptopGroup.add(bottomFrame)

// Trackpad
const trackpadFloor = new THREE.Mesh(
    createRoundedBox(trackpadFloorWidth - 4, 0.1, trackpadFloorDepth - 4, 3, 3),
    new THREE.MeshStandardMaterial({ color: 0x424242 }),
)
trackpadFloor.position.set(trackpadFloorOffsetX, -1.5, 0)
trackpadFloor.rotation.x = Math.PI / 2
laptopGroup.add(trackpadFloor)

const trackpadBottomSide = new THREE.Mesh(
    createRoundedBox(trackpadFloorWidth - 4, 1.1, trackpadFloorDepth - 4, 3, 3),
    new THREE.MeshStandardMaterial({ color: bottomFrame.material.color }),
)
trackpadBottomSide.position.set(trackpadFloorOffsetX, -2, 0)
trackpadBottomSide.rotation.x = Math.PI / 2
laptopGroup.add(trackpadBottomSide)

// const keyboardBaseGeometry =
// const keyboardBase = new THREE.Mesh(keyboardBaseGeometry, laptopBaseMaterial);
// keyboardBase.position.set(0, -1, -keyboardOffsetZ);
// laptopBase.add(keyboardBase);

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

directionalLightFolder.close()

directionalLightFolder.addColor(directionalLight, 'color')
directionalLightFolder
    .add(directionalLight.position, 'x')
    .min(-25)
    .max(25)
    .step(0.001)
directionalLightFolder
    .add(directionalLight.position, 'z')
    .min(-25)
    .max(25)
    .step(0.001)

directionalLightFolder
    .add(directionalLight.position, 'y')
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
