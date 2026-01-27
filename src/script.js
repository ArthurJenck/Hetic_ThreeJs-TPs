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
        bevelSize: Math.min(
            radius,
            width / 2 - 0.01,
            depth / 2 - 0.01,
            height / 2 - 0.01,
        ),
        bevelThickness: Math.min(
            radius,
            width / 2 - 0.01,
            depth / 2 - 0.01,
            height / 2 - 0.01,
        ),
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
const trackpadFloorOffsetX = 60

const keyboardWidth = 90
const keyboardDepth = 240

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
        {
            width: keyboardWidth,
            depth: keyboardDepth,
            radius: 1.5,
            offsetX: -20,
            offsetY: 0,
        },
    ],
)

const bottomFrameGroup = new THREE.Group()
laptopGroup.add(bottomFrameGroup)

const bottomFrame = new THREE.Mesh(bottomFrameGeometry, laptopBaseMaterial)
bottomFrame.rotation.x = Math.PI / 2

bottomFrameGroup.add(bottomFrame)

// Trackpad
const trackpadFloor = new THREE.Mesh(
    createRoundedBox(trackpadFloorWidth - 4, 1, trackpadFloorDepth - 4, 3, 3),
    new THREE.MeshStandardMaterial({ color: 0x424242 }),
)
trackpadFloor.position.set(trackpadFloorOffsetX, 0.5, 0)
trackpadFloor.rotation.x = Math.PI / 2
bottomFrameGroup.add(trackpadFloor)

const trackpadBottomSide = new THREE.Mesh(
    createRoundedBox(trackpadFloorWidth - 4, 1.5, trackpadFloorDepth - 4, 3, 3),
    new THREE.MeshStandardMaterial({ color: bottomFrame.material.color }),
)
trackpadBottomSide.position.set(trackpadFloorOffsetX, -3.5, 0)
trackpadBottomSide.rotation.x = Math.PI / 2
bottomFrameGroup.add(trackpadBottomSide)

const keyboardGroup = new THREE.Group()
bottomFrameGroup.add(keyboardGroup)

const keyboardBaseGeometry = createRoundedBox(
    keyboardWidth - 4,
    baseHeight - 1.5,
    keyboardDepth - 4,
    2,
    3,
)

const keyboardBase = new THREE.Mesh(keyboardBaseGeometry, bottomFrame.material)
keyboardBase.position.set(-10, -1.5, 0)
keyboardBase.rotation.x = Math.PI / 2
keyboardGroup.add(keyboardBase)

const keysGroup = new THREE.Group()
keyboardGroup.add(keysGroup)

for (let row = 0; row < 6; row++) {
    for (let i = 0; i < 14; i++) {
        const key = new THREE.Mesh(
            createRoundedBox(9, 1, 9, 0.5, 1),
            new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 0 }),
        )

        const offsetX = (i * 5) / 2 - 5 / 2
        key.position.x = i * 5 * 3.75 - offsetX

        key.position.z = row * 5 * 1.25 * 2
        key.position.y += 1

        key.rotation.x = Math.PI / 2

        keysGroup.add(key)
    }
}

keysGroup.rotation.y = Math.PI / 2
keysGroup.position.x = -41.5
keysGroup.position.z = 107.5

keyboardGroup.position.x -= 10

// Top frame
const topFrameGroup = new THREE.Group()
laptopGroup.add(topFrameGroup)

const screenWidth = 180
const screenHeight = 250

const topFrame = new THREE.Mesh(
    createRoundedBox(baseWidth, baseHeight, baseDepth, baseRadius, 3, [
        {
            width: screenWidth,
            depth: screenHeight,
            radius: 5,
            offsetX: 9,
            offsetY: 0,
        },
    ]),
    new THREE.MeshPhongMaterial({ color: 0x333333 }),
)

topFrame.rotation.x += Math.PI / 2
topFrame.rotation.y += Math.PI / 2 + 0.1

topFrame.position.y += 93
topFrame.position.x -= 116
topFrameGroup.add(topFrame)

// Top frame wall
const topFrameWall = new THREE.Mesh(
    createRoundedBox(screenWidth, 1.5, screenHeight, 3, 3),
    new THREE.MeshPhongMaterial({
        color: 0x333333,
        specular: 0xffffff,
        shininess: 25,
    }),
)

topFrameWall.rotation.x += Math.PI / 2
topFrameWall.rotation.y += Math.PI / 2 + 0.1

topFrameWall.position.y += 102
topFrameWall.position.x -= 116

topFrameGroup.add(topFrameWall)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 5)
directionalLight.position.set(0, 2, 0)
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
