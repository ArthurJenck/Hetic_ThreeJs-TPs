import { GUI } from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

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
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({ color: 0xadadad }),
)

plane.rotation.x += -Math.PI / 2
plane.position.y -= 50

plane.receiveShadow = true

scene.add(plane)

const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x4287f5 })
const cylinderGroup = new THREE.Group()

for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
        const cylinderMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(20, 20, (j + i) * 20 + 20),
            cylinderMaterial,
        )

        cylinderMesh.position.y += cylinderMesh.geometry.parameters.height / 2
        cylinderMesh.position.x = i * 60
        cylinderMesh.position.z = j * 60

        cylinderMesh.castShadow = true
        cylinderMesh.receiveShadow = true

        cylinderGroup.add(cylinderMesh)
    }
}

cylinderGroup.position.y -= 50
cylinderGroup.position.x -= 120
cylinderGroup.position.z -= 120

scene.add(cylinderGroup)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 3)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(-220, 200, -220)
directionalLight.castShadow = true

directionalLight.shadow.mapSize.width = 2048
directionalLight.shadow.mapSize.height = 2048
directionalLight.shadow.camera.top = 250
directionalLight.shadow.camera.right = 200
directionalLight.shadow.camera.bottom = -200
directionalLight.shadow.camera.left = -200
directionalLight.shadow.camera.near = 10
directionalLight.shadow.camera.far = 1000

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

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    directionalLight.position.x = Math.sin(elapsedTime * 0.4) * 200
    directionalLight.position.z = -Math.cos(elapsedTime * 0.4) * 200

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
