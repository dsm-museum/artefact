import { Vector3 } from 'three'
import { PerspectiveCamera } from 'three'
import Experience from './Experience'

export default class Camera {
  constructor(_initialPosition = new Vector3(1, 1.5, 2)) {
    this.experience = new Experience()
    this.resizer = this.experience.resizer
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas
    this.initialPosition = _initialPosition
    this.setInstance(_initialPosition)
  }

  setInstance(_initialPosition) {
    this.instance = new PerspectiveCamera(
      60,
      this.resizer.width / this.resizer.height,
      0.01,
      100
    )

    this.instance.name = 'Main Camera'

    // TODO: Calculate the distance the camera needs to be in, to get the first object in frame
    //console.log(this.instance.fov)

    this.instance.position.set(
      _initialPosition.x,
      _initialPosition.y,
      _initialPosition.z
    )
    this.scene.add(this.instance)
  }

  reset() {
    this.instance.position.set(
      this.initialPosition.x,
      this.initialPosition.y,
      this.initialPosition.z
    )
  }

  resize() {
    this.instance.aspect = this.resizer.width / this.resizer.height
    this.instance.updateProjectionMatrix()
  }
}
