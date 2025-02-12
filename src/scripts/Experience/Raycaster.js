import { Raycaster as _Raycaster, Vector2, EventDispatcher } from 'three'
import Experience from './Experience'

export default class Raycaster extends EventDispatcher {
  constructor() {
    super()
    this.experience = new Experience()
    this.instance = new _Raycaster()
    this.pointer = new Vector2()
    this.lastPointerContact = new Vector2()
    this.currentSelected = null
    this.intersects = null
    this.object3Ds = []
    this.targets = {}
    this.wasClicked = false
    this.lastRaycast = 0
    this.raycastInterval = 100 // in ms
    this.maxClickDistance = 20.0

    this.experience.canvas.addEventListener('pointermove', (event) => {
      this.onPointerMove(event)
    })

    this.experience.canvas.addEventListener('pointerdown', (event) => {
      this.lastPointerContact.x = event.clientX
      this.lastPointerContact.y = event.clientY
    })

    this.experience.canvas.addEventListener('pointerup', (event) => {
      // Calculates the distance between touch start and end, accounting for finger movement.
      let distance = Math.sqrt(
        this.lastPointerContact.distanceToSquared(new Vector2(event.clientX, event.clientY)),
      )

      // Triggers click if distance is about 20 units.
      if (distance <= this.maxClickDistance) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
        this.wasClicked = true
      }
    })

    this.debugger = document.createElement('div')
    this.debugger.style.position = 'absolute'
    this.debugger.style.top = 0
    this.debugger.style.left = 0
    this.debugger.style.pointerEvents = 'none'
    this.debugger.style.transition = 'all 0.2s'
    this.debugger.width = '200px'
    this.debugger.style.backgroundColor = '#ffffff'
    this.debugger.style.padding = '5px 7px'
    this.debugger.style.borderRadius = '10px'
    this.debugger.style.fontWeight = 'bold'
    this.debugger.style.boxShadow = '0px 0px 5px rgba(0,0,0,0.8)'
    this.debugger.innerText = 'hello'
    //document.body.appendChild(this.debugger)
  }

  onPointerMove(event) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
    this.pointer.rawX = event.clientX
    this.pointer.rawY = event.clientY
  }

  makeRaycastable(obj) {
    this.targets[obj.object.uuid] = {
      object: obj.object,
      callback: obj.callback,
    }

    this.updateObjectList()
  }

  // Updates the list of raycastable object3Ds to use in update()
  updateObjectList() {
    this.object3Ds = []

    let keys = Object.keys(this.targets)

    keys.forEach((key) => {
      this.object3Ds.push(this.targets[key].object)
    })
  }

  triggerCallback(intersectionInfo) {
    // Try to find the intersected object in the targets
    let obj = this.targets[intersectionInfo.object.uuid]

    if (obj) {
      try {
        obj.callback(intersectionInfo)
      } catch (error) {
        console.error(error)
      }
    }
  }

  update() {
    if (Date.now() - this.lastRaycast > this.raycastInterval) {
      this.instance.setFromCamera(this.pointer, this.experience.camera.instance)

      this.intersects = this.instance.intersectObjects(this.object3Ds)

      if (this.intersects.length !== 0) {
        // Pointer
        this.experience.renderer.instance.domElement.style.cursor = 'pointer'

        // Debugger
        /*this.debugger.style.visibility = 'initial'
        this.debugger.innerText =
          'touched ' +
          this.intersects[0].object.name +
          this.intersects[0].object.type

        this.debugger.style.top = `${this.pointer.rawY}px`
        this.debugger.style.left = `${this.pointer.rawX}px`*/

        if (this.wasClicked) {
          this.currentSelected = this.intersects[0].object
          this.triggerCallback(this.intersects[0]) // You usually click on a part of the targetGroup, but we need to trigger the callback wiht the group itself, as that is the annotation.target
        }
      } else {
        this.experience.renderer.instance.domElement.style.cursor = 'initial'
        //this.debugger.style.visibility = 'hidden'
      }
      this.wasClicked = false
      this.lastRaycast = Date.now()
    }
  }
}
