import Experience from '../Experience'
import EventEmitter from './EventEmitter'

export default class Resizer extends EventEmitter {
  constructor() {
    super()
    this.experience = new Experience()
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = Math.min(window.devicePixelRatio, 2)

    window.addEventListener('resize', () => {
      this.width = window.innerWidth
      this.height = window.innerHeight
      this.pixelRatio = Math.min(window.devicePixelRatio, 2)
      this.trigger('resize')
    })
  }
}
