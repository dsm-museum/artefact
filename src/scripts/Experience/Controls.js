import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Experience from './Experience'
import { Vector3 } from 'three'

export default class Controls {
  constructor() {
    this.experience = new Experience()
    this.camera = this.experience.camera.instance
    this.canvas = this.experience.canvas
    this.setInstance()
  }

  setInstance() {
    this.instance = new OrbitControls(this.camera, this.canvas)
    this.instance.target = new Vector3(0, 0.0, 0)
    this.instance.enableDamping = true
    this.instance.dampingFactor = 0.02
    this.instance.maxDistance = 10
    this.instance.minDistance = 0.1
    this.instance.autoRotate = true
    this.instance.autoRotateSpeed = 0.3
  }

  update() {
    this.instance.update()
  }
}
