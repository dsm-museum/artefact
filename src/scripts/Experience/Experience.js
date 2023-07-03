import { Scene, AmbientLight, DirectionalLight } from 'three'
import Resizer from '../Experience/utils/Resizer'
import Timer from '../Experience/utils/Timer'
import Camera from '../Experience/Camera'
import Controls from '../Experience/Controls'
import Renderer from '../Experience/Renderer'
import AnnotationSystem from './AnnotationSystem'
import AnimationSystem from './AnimationSystem'
import Resources from './utils/Resources'
import WebXRManager from '../Experience/WebXRManager'
import Raycaster from './Raycaster'
import { disposeThree } from './utils/threeCleanup'

let instance = null

export default class Experience {
  constructor(_config) {
    if (instance) {
      return instance
    }

    instance = this
    window.experience = this

    // Components
    this.canvas = document.querySelector('#arCanvas')
    this.resizer = new Resizer()
    this.timer = new Timer()
    this.scene = new Scene()
    this.webXR = new WebXRManager(_config.arSessionFeatures)
    this.resources = new Resources(_config.sources)
    this.camera = new Camera()
    this.controls = new Controls()
    this.renderer = new Renderer()
    this.annotationSystem = new AnnotationSystem(
      document.querySelector('#annotations')
    )
    this.animationSystem = new AnimationSystem()
    this.raycaster = new Raycaster()

    this.setDefaultLighting()
  }

  dispose() {
    disposeThree(this.renderer.instance, this.scene, false)
    this.webXR.dispose()
    this.annotationSystem.dispose()
    instance = null
  }

  setDefaultLighting() {
    let ambientLight = new AmbientLight(0xffffff, 1)
    let directionalLight = new DirectionalLight(0xffffff, 0.7)
    let directionalLight2 = new DirectionalLight(0xffffff, 0.7)

    directionalLight2.position.set(-1, 0.7, -1)
    directionalLight.position.set(1, 0.5, 1.5)

    this.scene.add(directionalLight)
    this.scene.add(directionalLight2)
    this.scene.add(ambientLight)
  }

  click(obj, callback) {
    this.raycaster.makeRaycastable({ object: obj, callback: callback })
  }
}
