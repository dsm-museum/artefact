import Experience from './Experience'
import {
  Vector3,
  TextureLoader,
  SpriteMaterial,
  Sprite,
  SphereBufferGeometry,
  MeshBasicMaterial,
  Color,
  Mesh,
  BoxHelper,
  SphereGeometry,
  BoxGeometry,
  MeshStandardMaterial,
} from 'three'

import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'

let textureLoader = new TextureLoader()

/* let lineDashedMaterial = new LineDashedMaterial({
  color: 0xffffff,
  linewidth: 1,
  scale: 1,
  dashSize: 0.04,
  gapSize: 0.02,
})*/

let lineDashedMaterial = new LineMaterial({
  color: 0xffffff,
  linewidth: 0.001,
  vertexColors: false,
  dashed: true,
  dashOffset: 0,
  dashScale: 30,
  dashSize: 0.5,
  alphaToCoverage: true,
})

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

    this.line = null

    this.domElement = this.createDomElement(annotationData.id)
    this.target = this.createTargetMesh(
      annotationData.position,
      annotationData.indicatorPosition
    ) // .position are the three vertex indices here!!!
    this.annotationVector = new Vector3(0, 0, 0)
    //this.endMesh = this.endMesh()
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

  endMesh() {
    let targetGeometry = new SphereGeometry(0.013, 32, 32) // TODO: Don't scale it here, but rather later?
    let targetMaterial = new MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      depthWrite: false,
      opacity: 1.0,
    })

    // We need a parent mesh to raycast against
    let targetMesh = new Mesh(targetGeometry, targetMaterial)
    this.experience.scene.add(targetMesh)
    return targetMesh
  }

  createTargetMesh(position, indicatorPosition) {
    let targetGeometry = new SphereGeometry(0.013, 32, 32) // TODO: Don't scale it here, but rather later?
    let targetMaterial = new MeshBasicMaterial({
      color: this.annotationBackgroundColor,
      transparent: true,
      depthWrite: false,
      opacity: 0.0,
    })

    // We need a parent mesh to raycast against
    let targetMesh = new Mesh(targetGeometry, targetMaterial)
    targetMesh.add(this.createIcon())

    // Set the position to the position of the center of the triangle defined by the three vertices in `position` of config.json
    // Setting it to the position of the first vertex for now
    // TODO: How to better connect Annotation and Mesh together?

    // Get the geometry of the mesh
    //this.model.scene.children[0].position.set(0, 0, 0)

    // Find the mesh to anchor the annotation to
    if (this.annotationData.meshName != undefined) {
      this.meshName = this.annotationData.meshName
      this.model.scene.traverse((elem) => {
        if (elem.name == this.meshName) {
          this.mesh = elem
          //console.log(elem)
        }
      })
    }

    let positionAttribute = this.mesh.geometry.getAttribute('position')

    // Get the three indices from the position array
    // TODO: Calculate bary coords from the three vertices
    let indexVertexA = position[0]
    let indexVertexB = position[1]
    let indexVertexC = position[2]

    let vertexPositionA = new Vector3()
    vertexPositionA.fromBufferAttribute(positionAttribute, indexVertexA)

    // Get the world position of the endpoint of the annotation
    this.mesh.localToWorld(vertexPositionA)

    // Set the position of the clickable target to the indicatorPosition
    targetMesh.position.set(
      indicatorPosition[0],
      indicatorPosition[1],
      indicatorPosition[2]
    )

    // Create the line
    let line = this.createDashedLine(vertexPositionA, indicatorPosition)
    this.line = line

    if (this.debug) {
      let box = new BoxHelper(targetMesh, 0x00ff00)
      this.experience.scene.add(box)
    }

    return targetMesh
  }

  createIcon() {
    let map = textureLoader.load(
      './models/' + this.urlPath + '/' + this.annotationData.icon
    )

    let spriteMaterial = new SpriteMaterial({
      map: map,
      depthWrite: true,
    })

    this.icon = spriteMaterial

    let sprite = new Sprite(spriteMaterial)
    sprite.renderOrder = 1
    sprite.scale.set(0.02, 0.02, 1.0)
    return sprite
  }

  createDashedLine(vertexPosition, indicatorPosition) {
    let lineGeometry = new LineGeometry()

    lineGeometry.setPositions([
      vertexPosition.x,
      vertexPosition.y,
      vertexPosition.z,
      indicatorPosition[0],
      indicatorPosition[1],
      indicatorPosition[2],
    ])

    let line = new Line2(lineGeometry, lineDashedMaterial)
    line.computeLineDistances()
    return line
  }

  getFovHeight() {
    const fov = this.experience.camera.instance.fov * (Math.PI / 180) // FOV to radians
    const height =
      2 * Math.tan(fov / 2.0) * this.experience.camera.instance.position.z
    return height
  }

  update() {
    // === 3D Object Update ===

    // Update the vertex position just like in `createTargetMesh`
    let vertexPosition = new Vector3(0, 0, 0)

    // Get the position attribute from the buffer
    let positionAttribute = this.mesh.geometry.getAttribute('position')

    // Choose the vertex to anchor to
    let vertex = this.annotationData.position[0]

    // Copy the position into vertexPosition
    vertexPosition.fromBufferAttribute(positionAttribute, vertex)

    this.mesh.localToWorld(vertexPosition)

    let worldPosAnnotation = new Vector3()
    this.target.getWorldPosition(worldPosAnnotation)

    this.line.geometry.attributes.position.setXYZ(
      0,
      vertexPosition.x,
      vertexPosition.y,
      vertexPosition.z
    )

    this.line.geometry.attributes.position.setXYZ(
      1,
      worldPosAnnotation.x,
      worldPosAnnotation.y,
      worldPosAnnotation.z
    )

    // update the line
    this.line.geometry.attributes.position.needsUpdate = true
    this.line.computeLineDistances()

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
    this.icon.visible = !willHide
    this.line.visible = !willHide
    this.domElement.style.pointerEvents = willHide ? 'none' : 'auto'
    this.target.visible = !willHide
  }

  setQuestionIcon() {
    const spriteMaterial = new SpriteMaterial({
      map: this.experience.annotationSystem.questionIcon,
      depthWrite: true,
    })

    //console.log(this.target.children[0])

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

  debugSphere(position) {
    let mat = new MeshBasicMaterial({
      color: 0xff0000,
    })
    let geometry = new SphereBufferGeometry(0.01, 32, 32)
    let mesh = new Mesh(geometry, mat)
    mesh.position.set(position.x, position.y, position.z)
    this.experience.scene.add(mesh)
  }
}
