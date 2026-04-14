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
let soldier = null
let currentAction = null
let controlMode = 'none'
const animations = {}

const WALK_SPEED = 8
const RUN_SPEED = 20

const keysPressed = {}
window.addEventListener('keydown', (e) => {
    keysPressed[e.code] = true
})
window.addEventListener('keyup', (e) => {
    keysPressed[e.code] = false
})

function switchAnimation(name) {
    const target = animations[name]
    if (!target || (currentAction && currentAction.getClip().name === name))
        return
    if (currentAction) currentAction.fadeOut(0.2)
    currentAction = target
    currentAction.reset().fadeIn(0.2).play()
}

function getMovementSpeed(animName) {
    if (animName === 'Run') return RUN_SPEED
    if (animName === 'Walk') return WALK_SPEED
    return 0
}

glbLoader.load('/models/soldier/soldier.glb', (glb) => {
    glb.scene.traverse((child) => (child.castShadow = true))
    glb.scene.scale.setScalar(4)
    glb.scene.position.y += 0.2

    mixer = new THREE.AnimationMixer(glb.scene)

    const guiActions = {}
    glb.animations.forEach((clip) => {
        animations[clip.name] = mixer.clipAction(clip)
        guiActions[clip.name] = () => {
            controlMode = 'gui'
            switchAnimation(clip.name)
        }
        gui.add(guiActions, clip.name)
    })

    currentAction = animations['Idle'] || animations[glb.animations[0].name]
    currentAction.play()

    soldier = glb.scene
    scene.add(soldier)
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
const clock = new THREE.Clock()
let mixer = null

const tick = () => {
    const delta = clock.getDelta()
    if (mixer) {
        mixer.update(delta)
    }

    if (soldier) {
        const forward = keysPressed['KeyS'] || keysPressed['ArrowDown']
        const backward = keysPressed['KeyW'] || keysPressed['ArrowUp']
        const left = keysPressed['KeyA'] || keysPressed['ArrowLeft']
        const right = keysPressed['KeyD'] || keysPressed['ArrowRight']
        const shift = keysPressed['ShiftLeft'] || keysPressed['ShiftRight']
        const keyT = keysPressed['KeyT']
        const isMoving = forward || backward || left || right

        if (isMoving) {
            controlMode = 'keyboard'
            const animName = shift ? 'Run' : 'Walk'
            switchAnimation(animName)

            const targetAngle =
                Math.atan2(
                    (right ? 1 : 0) - (left ? 1 : 0),
                    (forward ? 1 : 0) - (backward ? 1 : 0),
                ) + Math.PI

            let diff = targetAngle - soldier.rotation.y
            while (diff > Math.PI) diff -= Math.PI * 2
            while (diff < -Math.PI) diff += Math.PI * 2
            soldier.rotation.y += diff * Math.min(1, 10 * delta)

            const speed = getMovementSpeed(animName) * delta
            const moveAngle = soldier.rotation.y - Math.PI
            soldier.position.x += Math.sin(moveAngle) * speed
            soldier.position.z += Math.cos(moveAngle) * speed
        } else if (controlMode !== 'gui') {
            controlMode = 'none'
            switchAnimation(keyT ? 'TPose' : 'Idle')
        }

        if (controlMode === 'gui' && currentAction) {
            const speed = getMovementSpeed(currentAction.getClip().name) * delta
            if (speed > 0) {
                soldier.position.x +=
                    Math.sin(soldier.rotation.y - Math.PI) * speed
                soldier.position.z +=
                    Math.cos(soldier.rotation.y - Math.PI) * speed
            }
        }
    }

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
