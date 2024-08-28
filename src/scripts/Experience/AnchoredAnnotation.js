import Experience from './Experience'
import {
  Vector3,
  TextureLoader,
  SpriteMaterial,
  Sprite,
  SphereGeometry,
  MeshBasicMaterial,
  Color,
  Mesh,
  BoxHelper,
} from 'three'

import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineSegments2 } from 'three/addons/lines/LineSegments2'
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry'
import anime from 'animejs'
import { LineBasicMaterial } from 'three'
import { BufferGeometry } from 'three'
import { Line } from 'three'
import { Matrix4 } from 'three'

let textureLoader = new TextureLoader()

export default class AnchoredAnnotation {
  constructor(annotationData, urlPath = './', model) {
    this.experience = new Experience()
    this.size = 26
    this.offsetX = this.size / 2
    this.offsetY = this.size / 2
    this.annotationData = annotationData
    this.urlPath = urlPath
    this.model = model
    this.annotationBackgroundColor = new Color(0xffffff)
    this.debug = false

    this.mesh = this.getMesh(annotationData.meshName)

    this.line = this.createDashedLine()
    this.domElement = this.createDomElement(annotationData.id)
    this.target = this.createTargetMesh(
      annotationData.position,
      annotationData.indicatorPosition
    ) // .position are the three vertex indices here!!!

    this.annotationVector = new Vector3(0, 0, 0)
    this.fovHeight = this.getFovHeight()
  }

  createDomElement(id) {
    let elem = document.createElement('div')
    elem.id = id
    elem.classList.add('annotation')
    elem.style.width = `${this.size}px`
    elem.style.height = `${this.size}px`
    elem.style.transformOrigin = '0% 0%'
    elem.style.opacity = '1'
    elem.style.position = 'absolute'
    elem.style.boxSizing = 'border-box'
    elem.style.touchAction = 'none'
    elem.style.pointerEvents = 'none'
    elem.style.overflow = 'hidden'

    // Debug styles
    if (this.debug) {
      elem.style.border = '2px dotted red'
    }

    return elem
  }

  /* The target mesh is an invisible sphere, slightly bigger than the icon. It is the object that is raycast against */
  createTargetMesh(position, indicatorPosition) {
    let targetGeometry = new SphereGeometry(0.026, 16, 16) // TODO: Don't scale it here, but rather later?
    let targetMaterial = new MeshBasicMaterial({
      color: this.annotationBackgroundColor,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
    })

    // We need a parent mesh to raycast against
    let targetMesh = new Mesh(targetGeometry, targetMaterial)

    // position the target mesh icon at the specified location
    targetMesh.position.set(
      indicatorPosition[0],
      indicatorPosition[1],
      indicatorPosition[2]
    )

    // Create the icon
    let icon = this.createIcon()

    // Add it to the target mesh
    targetMesh.add(icon)

    return targetMesh
  }

  createIcon() {
    let map = textureLoader.load(
      './models/' + this.urlPath + '/' + this.annotationData.icon
    )

    let spriteMaterial = new SpriteMaterial({
      map: map,
      transparent: true,
      opacity: 1.0,
      depthWrite: true,
    })

    this.icon = spriteMaterial

    let sprite = new Sprite(spriteMaterial)
    sprite.renderOrder = 1
    sprite.scale.set(0.02, 0.02, 1.0)
    return sprite
  }

  createDashedLine() {
    let line = null
    let material = new LineBasicMaterial({ color: 0xffffff })

    // Just initialize the line here, it gets updated anyway
    let start = new Vector3(0, 0, 0)
    let end = new Vector3(0, 0, 0)
    let points = []
    points.push(start)
    points.push(end)

    let geometry = new BufferGeometry().setFromPoints(points)
    line = new Line(geometry, material)

    // red
    let startMesh = new Mesh(new SphereGeometry(0.01, 16, 16), new MeshBasicMaterial({color: 0xff0000}))
    
    // blue
    let endMesh = new Mesh(new SphereGeometry(0.01, 16, 16), new MeshBasicMaterial({color: 0x0000ff}))
    
    line.add(startMesh)
    line.add(endMesh)
    
    return line
  }

  getVertexPosition(vertexIndex) {
    let position = new Vector3(0, 0, 0)

    let positionAttribute = this.mesh.geometry.getAttribute('position')

    position.fromBufferAttribute(positionAttribute, vertexIndex)
    
    this.mesh.localToWorld(position)

    return position
  }

  getMesh(name) {
    let mesh = null
    this.model.scene.traverse((elem) => {
      if (elem.name == name) {
        mesh = elem
      }
    })
    return mesh
  }

  getFovHeight() {
    const fov = this.experience.camera.instance.fov * (Math.PI / 180) // FOV to radians
    const height =
      2 * Math.tan(fov / 2.0) * this.experience.camera.instance.position.z
    return height
  }

  update() {
    this.mesh.updateMatrixWorld(true);
    
    // Update lines
    let vertexPosition = this.getVertexPosition(this.annotationData.position[0])

    // Move the red points (currently wrong in ar)
    // Transform to the local space of the parent object, if necessary
let localVertexPosition = this.line.worldToLocal(vertexPosition.clone());

// Move the red point to the correct position
this.line.children[0].position.copy(localVertexPosition);
    
    // === Invisible DOM Element update ===
    this.target.getWorldPosition(this.annotationVector)
    this.annotationVector.project(this.experience.camera.instance)

    let x = Math.round(
      (0.5 + this.annotationVector.x / 2) *
        (this.experience.canvas.width / Math.min(window.devicePixelRatio, 2))
    )
    let y = Math.round(
      (0.5 - this.annotationVector.y / 2) *
        (this.experience.canvas.height / Math.min(window.devicePixelRatio, 2))
    )

    const distance = this.target.position.distanceTo(
      this.experience.camera.instance.position
    )

    const objectSize = this.fovHeight / distance

    this.domElement.style.transform = `translate(${x}px, ${y}px) scale(${objectSize})`

    return distance
  }

  hide(willHide = true) {
    anime({
      targets: this.icon,
      opacity: !willHide ? 1.0 : 0.2,
      easing: 'easeInOutQuad',
      duration: 200,
    })

    anime({
      targets: this.line.material,
      opacity: !willHide ? 1.0 : 0.7,
      easing: 'easeInOutQuad',
      duration: 200,
    })

    this.domElement.style.pointerEvents = willHide ? 'none' : 'auto'
  }

  setQuestionIcon() {
    const spriteMaterial = new SpriteMaterial({
      map: this.experience.annotationSystem.questionIcon,
      depthWrite: true,
    })

    // Change the icon of the target sprite
    this.target.children[0].material = spriteMaterial
  }

  setLockIcon() {
    const lockMaterial = new SpriteMaterial({
      map: this.experience.annotationSystem.lockIcon,
      depthWrite: true,
    })

    // Change the icon of the target sprite
    this.target.children[0].material = lockMaterial
  }

  setIcon() {
    this.target.children[0].material = this.icon
  }

  setCorrectIcon() {
    let material = new SpriteMaterial({
      map: this.experience.annotationSystem.correctAnswerIcon,
      depthWrite: true,
    })

    this.target.children[0].material = material
  }

  setWrongIcon() {
    let material = new SpriteMaterial({
      map: this.experience.annotationSystem.wrongAnswerIcon,
      depthWrite: true,
    })

    this.target.children[0].material = material
  }
}
