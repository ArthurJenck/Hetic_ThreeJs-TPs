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
const headTexture = textureLoader.load('/head-texture.jpg')
headTexture.colorSpace = THREE.SRGBColorSpace

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

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshPhongMaterial({ color: 0xff0000 }),
)

cube.position.y += cube.geometry.parameters.height / 2

const navigationKeys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
}

window.addEventListener('keydown', (e) => {
    if (e.key in navigationKeys) {
        navigationKeys[e.key] = true
    }
})

window.addEventListener('keyup', (e) => {
    if (e.key in navigationKeys) {
        navigationKeys[e.key] = false
    }
})

// scene.add(cube)

const bodyGroup = new THREE.Group()
const bodyFolder = gui.addFolder('Body')

const head = new THREE.Mesh(
    new THREE.SphereGeometry(5),
    // new THREE.MeshPhongMaterial({ color: 0xff0000 }),
    new THREE.MeshBasicMaterial({ map: headTexture }),
)

head.position.y += 39.5
head.rotation.y = -Math.PI / 2
bodyGroup.add(head)

const headFolder = bodyFolder.addFolder('Head')

headFolder.add(head.position, 'x').min(-20).max(20).step(0.1)
headFolder.add(head.position, 'y').min(-50).max(50).step(0.1)

const torso = new THREE.Mesh(
    new THREE.BoxGeometry(10, 15, 2.5),
    new THREE.MeshPhongMaterial({ color: 0xff0000 }),
)

torso.position.y += 27
bodyGroup.add(torso)

const torsoFolder = bodyFolder.addFolder('Torso')

torsoFolder.add(torso.position, 'x').min(-20).max(20).step(0.1)
torsoFolder.add(torso.position, 'y').min(-50).max(50).step(0.1)

const arm1 = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 10, 2.5),
    new THREE.MeshPhongMaterial({ color: 0xff0000 }),
)

arm1.position.y += 30.2
arm1.position.x -= 5.9

arm1.rotation.z += -Math.PI * 0.2

const arm1Folder = bodyFolder.addFolder('Arm 1')

arm1Folder.add(arm1.position, 'x').min(-20).max(20).step(0.1)
arm1Folder.add(arm1.position, 'y').min(-50).max(50).step(0.1)

arm1Folder
    .add(arm1.rotation, 'z')
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.1)
    .name('rotation')

const arm2 = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 10, 2.5),
    new THREE.MeshPhongMaterial({ color: 0xff0000 }),
)

arm2.position.y += 30.2
arm2.position.x += 5.9

arm2.rotation.z += Math.PI * 0.2

const arm2Folder = bodyFolder.addFolder('Arm 2')

arm2Folder.add(arm2.position, 'x').min(-20).max(20).step(0.1)
arm2Folder.add(arm2.position, 'y').min(-50).max(50).step(0.1)

arm2Folder
    .add(arm2.rotation, 'z')
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.1)
    .name('rotation')

bodyGroup.add(arm1, arm2)

const leg1 = new THREE.Mesh(
    new THREE.BoxGeometry(4, 10, 2.5),
    new THREE.MeshPhongMaterial({ color: 0xff0000 }),
)

leg1.position.y += 15
leg1.position.x -= 3

const leg1Folder = bodyFolder.addFolder('Leg 1')

leg1Folder.add(leg1.position, 'x').min(-20).max(20).step(0.1)
leg1Folder.add(leg1.position, 'y').min(-50).max(50).step(0.1)

const leg2 = new THREE.Mesh(
    new THREE.BoxGeometry(4, 10, 2.5),
    new THREE.MeshPhongMaterial({ color: 0xff0000 }),
)

leg2.position.y += 15
leg2.position.x += 3

const leg2Folder = bodyFolder.addFolder('Leg 2')

leg2Folder.add(leg2.position, 'x').min(-20).max(20).step(0.1)
leg2Folder.add(leg2.position, 'y').min(-50).max(50).step(0.1)

bodyGroup.add(leg1, leg2)

scene.add(bodyGroup)

const bodyGroupFolder = bodyFolder.addFolder('Whole body')

bodyGroupFolder.add(bodyGroup.position, 'x').min(-20).max(20).step(0.1)
bodyGroupFolder.add(bodyGroup.position, 'z').min(-20).max(20).step(0.1)

bodyGroupFolder.add(bodyGroup.position, 'y').min(-20).max(20).step(0.1)

bodyGroup.position.y -= 10

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
renderer.outputColorSpace = THREE.SRGBColorSpace

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

    const speed = 4

    const boundary =
        plane.geometry.parameters.width / 2 - cube.geometry.parameters.width / 2

    if (navigationKeys.ArrowUp) {
        // cube.position.z -= speed
        bodyGroup.position.z -= speed
        bodyGroup.rotation.y -= speed
    }
    if (navigationKeys.ArrowDown) {
        // cube.position.z += speed
        bodyGroup.position.z += speed
        bodyGroup.rotation.y += speed
    }
    if (navigationKeys.ArrowLeft) {
        // bodyGroup.position.x -= speed
        bodyGroup.position.x -= speed
        bodyGroup.rotation.y -= speed
    }
    if (navigationKeys.ArrowRight) {
        // cube.position.x += speed
        bodyGroup.position.x += speed
        bodyGroup.rotation.y += speed
    }

    if (
        boundary < bodyGroup.position.x ||
        -boundary > bodyGroup.position.x ||
        boundary < bodyGroup.position.z ||
        -boundary > bodyGroup.position.z ||
        bodyGroup.position.y < -10
    ) {
        bodyGroup.position.y -= 5
    }
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
