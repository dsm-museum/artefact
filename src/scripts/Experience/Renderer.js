import {
  WebGLRenderer,
  sRGBEncoding,
  CineonToneMapping,
  ACESFilmicToneMapping,
} from 'three'
import EventEmitter from './utils/EventEmitter'
import Experience from './Experience'

export default class Renderer extends EventEmitter {
  constructor() {
    super()
    this.experience = new Experience()

    this.canvas = this.experience.canvas
    this.resizer = this.experience.resizer
    this.scene = this.experience.scene
    this.camera = this.experience.camera

    this.setInstance()
  }

  setInstance() {
    this.instance = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    })
    this.instance.physicallyCorrectLights = true
    this.instance.outputEncoding = sRGBEncoding
    this.instance.toneMapping = ACESFilmicToneMapping
    this.instance.toneMappingExposure = 1.0
    this.instance.xr.enabled = true
    //this.instance.shadowMap.enabled = true;
    //this.instance.shadowMap.type = PCFSoftShadowMap;
    //this.instance.setClearColor(0x87ceeb, 0.0)
    this.instance.setClearAlpha(0.0)
    this.instance.setSize(this.resizer.width, this.resizer.height)
    this.instance.setPixelRatio(this.resizer.pixelRatio)
  }

  resize() {
    this.instance.setSize(this.resizer.width, this.resizer.height)
    this.instance.setPixelRatio(this.resizer.pixelRatio)
  }

  update() {
    this.instance.render(this.scene, this.camera.instance)
  }
}
