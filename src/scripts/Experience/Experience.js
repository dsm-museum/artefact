import { Scene, AmbientLight, DirectionalLight } from 'three'
import Resizer from '../Experience/utils/Resizer'
import Timer from '../Experience/utils/Timer'
import Camera from '../Experience/Camera'
import Controls from '../Experience/Controls'
import Renderer from '../Experience/Renderer'
import AnnotationSystem from './AnnotationSystem'
import AnimationSystem from './AnimationSystem'
import Resources from './utils/Resources'
import Raycaster from './Raycaster'
import { disposeThree } from './utils/threeCleanup'
import { WebXRSystem } from './WebXRSystem'

let instance = null

export default class Experience {
  constructor(_config) {
    if (instance) {
      return instance
    }

    instance = this
    window.experience = this
    window.APP = this

    // Components
    this.canvas = document.querySelector('#three-canvas')
    this.resizer = new Resizer()
    this.timer = new Timer()
    this.scene = new Scene()
    //this.webXR = new WebXRManager(_config.arSessionFeatures)
    this.webXRSystem = new WebXRSystem()
    this.resources = new Resources()
    this.camera = new Camera(_config.cameraPosition)
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
    this.webXRSystem.dispose()
    this.annotationSystem.dispose()
    instance = null
  }

  setDefaultLighting() {
    let ambientLight = new AmbientLight(0xffffff, 1)
    ambientLight.name = 'Ambient Light'
    let directionalLight = new DirectionalLight(0xffffff, 0.7)
    directionalLight.name = 'Directional Light 1'
    let directionalLight2 = new DirectionalLight(0xffffff, 0.7)
    directionalLight2.name = 'Directional Light 2'

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
