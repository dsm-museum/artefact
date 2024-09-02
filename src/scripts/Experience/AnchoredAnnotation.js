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

import anime from 'animejs'
import { BufferGeometry, Line, LineDashedMaterial } from 'three'

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
    this.target = this.createTargetMesh(annotationData.position)

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
  createTargetMesh(position) {
    let targetGeometry = new SphereGeometry(0.026, 16, 16)
    let targetMaterial = new MeshBasicMaterial({
      color: this.annotationBackgroundColor,
      transparent: true,
      depthWrite: false,
      opacity: 0.0,
    })

    // We need a parent mesh to raycast against
    let targetMesh = new Mesh(targetGeometry, targetMaterial)

    // position the target mesh icon at the specified location
    targetMesh.position.set(position.x, position.y, position.z)

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
    let line

    // Just initialize the line here, it gets updated on the first frame
    let start = new Vector3(0, 0, 0)
    let end = new Vector3(0, 0, 0)
    let points = []
    points.push(start)
    points.push(end)

    let material = new LineDashedMaterial({
      color: 0xffffff,
      gapSize: 0.02,
      dashSize: 0.03,
      linewidth: 1,
      transparent: true,
      opacity: 1.0,
    })

    let geometry = new BufferGeometry().setFromPoints(points)
    line = new Line(geometry, material)

    // Add white line endpoint on the model
    line.add(
      new Mesh(
        new SphereGeometry(0.002, 16, 16),
        new MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 1.0,
        })
      )
    )
    line.computeLineDistances()

    return line
  }

  getVertexPosition(verticesOnModelList = [new Vector3(0, 0, 0)]) {
    let positionAttribute = this.mesh.geometry.getAttribute('position')
    let centroid = new Vector3(0, 0, 0)
    let positions = []

    // Get all vertex positions
    for (let currentVertex of verticesOnModelList) {
      let currentVertexPosition = new Vector3(0, 0, 0)
      positions.push(
        currentVertexPosition.fromBufferAttribute(
          positionAttribute,
          currentVertex
        )
      )
    }

    // Add all positions together...
    for (let position of positions) {
      centroid.add(position)
    }

    // ... and divide through the amount of vertices defined in the config.json
    // to get the center of the vertices
    centroid.divideScalar(positions.length)
    this.mesh.localToWorld(centroid)
    return centroid
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
    this.mesh.updateMatrixWorld(true)

    // Update position of the vertex, remember this is world space
    // TODO: Change to barycentric coordinates to get the center of all 3 verticesOnModel
    let startVertexPosition = null

    startVertexPosition = this.getVertexPosition(
      this.annotationData.verticesOnModel
    )

    let endPosition = new Vector3(
      this.annotationData.position.x,
      this.annotationData.position.y,
      this.annotationData.position.z
    )

    // Transform to the local space of the parent object
    // startVertexPosition is in world space, convert it to local coordinates, so it's correct in ar
    let localVertexPosition = this.line.worldToLocal(startVertexPosition)

    // Move the red point to the correct position
    this.line.children[0].position.copy(localVertexPosition)

    // Create a new geometry for the line
    let points = []
    points.push(localVertexPosition)
    points.push(endPosition)

    let geometry = new BufferGeometry().setFromPoints(points)
    this.line.geometry = geometry
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
    anime({
      targets: this.icon,
      opacity: !willHide ? 1.0 : 0.2,
      easing: 'easeInOutQuad',
      duration: 200,
    })

    anime({
      targets: [this.line.material, this.line.children[0].material],
      opacity: !willHide ? 1.0 : 0.25,
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
