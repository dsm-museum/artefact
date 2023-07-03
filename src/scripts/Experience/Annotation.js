import {
  Vector3,
  MeshBasicMaterial,
  Mesh,
  SphereBufferGeometry,
  TextureLoader,
  SpriteMaterial,
  Sprite,
  Group,
  Color,
  Line,
  BufferGeometry,
  LineDashedMaterial,
  BoxHelper,
} from 'three'
import Experience from './Experience'

let lineDashedMaterial = new LineDashedMaterial({
  color: 0xffffff,
  dashSize: 0.015,
  gapSize: 0.02, //0.02,
})

export default class Annotation {
  constructor(annotationData, urlPath = './') {
    this.experience = new Experience()
    this.size = 26
    this.scale = 0.03
    this.offsetX = this.size / 2
    this.offsetY = this.size / 2
    this.annotationData = annotationData
    this.urlPath = urlPath
    this.annotationBackgroundColor = new Color(0xffffff)
    this.debug = false

    this.domElement = this.createDOMElement(annotationData.id)
    this.target = this.createTarget(annotationData.position)

    this.annotationVector = new Vector3()
    this.fovHeight = this.getFovHeight()
  }

  // This creates the (hidden) DOM element, users can click on
  createDOMElement(_id) {
    let elem = document.createElement('div')
    elem.id = _id
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

  createTarget(position) {
    let target = null

    // If the first position is an array, we have a start and end position for the connecting line
    if (Array.isArray(position[0])) {
      // Create the connecting line
      target = this.createTargetVisualizer()

      // Set the final position of the target
      target.position.set(position[1][0], position[1][1], position[1][2])

      // Create the line and add it to the target
      let line = this.createDashedLine(position)

      // subtract the target position from the line
      //line.position.sub(target.position)

      // do not add decoration like the line to the target
      //target.add(line)
      this.experience.scene.add(line)

      console.log(this.debug)
    }

    // Position is just one xyz position
    if (typeof position[0] == 'number') {
      target = this.createTargetVisualizer()
      target.position.set(position[0], position[1], position[2])
    }

    if (this.debug) {
      let box = new BoxHelper(target, 0x00ff00)
      this.experience.scene.add(box)
    }

    return target
  }

  // Adds a sphere around the annotation
  createTargetVisualizer() {
    let targetGeometry = new SphereBufferGeometry(0.05, 32, 32)
    let targetMaterial = new MeshBasicMaterial({
      color: this.annotationBackgroundColor,
      transparent: true,
      depthWrite: false,
      opacity: 1.0, // change this for a transparent background
    })

    // We need a parent-level Mesh to raycast against, using a sphere for that
    let targetMesh = new Mesh(targetGeometry, targetMaterial)

    // Add the icon as a 3d object
    const map = new TextureLoader().load(
      './models/' + this.urlPath + '/' + this.annotationData.icon
    )

    const spriteMaterial = new SpriteMaterial({
      map: map,
      depthWrite: true,
    })

    this.icon = spriteMaterial

    const sprite = new Sprite(spriteMaterial)
    sprite.scale.set(0.07, 0.07, 1.0)

    targetMesh.add(sprite)

    return targetMesh
  }

  createDashedLine(position) {
    const points = []

    // from
    points.push(new Vector3(position[0][0], position[0][1], position[0][2]))

    // to
    points.push(new Vector3(position[1][0], position[1][1], position[1][2]))

    let lineGeometry = new BufferGeometry().setFromPoints(points)
    let line = new Line(lineGeometry, lineDashedMaterial)
    line.computeLineDistances()

    return line
  }

  getFovHeight() {
    const fov = this.experience.camera.instance.fov * (Math.PI / 180) // FOV to radians
    const height =
      2 * Math.tan(fov / 2.0) * this.experience.camera.instance.position.z
    return height
  }

  // TODO: Figure out, why the AR view of the dom elements is scaling wrong
  update(inAR = false) {
    this.target.updateWorldMatrix(true, false)

    //const x = (targetPosition.x + 1) / window.innerWidth
    //const y = ((-targetPosition.y + 1) / 2) * window.innerHeight

    this.annotationVector.set(this.target.x, this.target.y, this.target.z)
    this.target.getWorldPosition(this.annotationVector)
    this.annotationVector.project(this.experience.camera.instance)
    //this.icon.lookAt(this.experience.camera.instance.position)

    const targetPosition = this.target.position.clone()
    targetPosition.project(this.experience.camera.instance)

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

    //  in ar, correct vertical DOM position
    /*if (inAR) {
      this.offsetY = -this.size * 2
    } else {
      this.offsetY = this.size / 2
    }*/

    /*let distance = this.experience.camera.instance.position.distanceTo(
      this.target.position
    )*/

    //let scale = (1 / distance).toFixed(2) * 2

    this.domElement.style.transform = `translate(${x}px, ${y}px) scale(${objectSize})`

    return distance
  }

  hide(willHide = true) {
    this.icon.visible = !willHide
    this.domElement.style.pointerEvents = willHide ? 'none' : 'auto'
  }

  setQuestionIcon() {
    const spriteMaterial = new SpriteMaterial({
      map: this.experience.annotationSystem.questionIcon,
      depthWrite: true,
    })

    console.log(this.target.children[0])

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
    let geometry = new SphereBufferGeometry(0.1, 32, 32)
    let mesh = new Mesh(geometry, mat)
    mesh.position.set(position[0], position[1], position[2])
    this.experience.scene.add(mesh)
  }

  drawInlineSVG(ctx, rawSVG, callback) {
    var svg = new Blob([rawSVG], { type: 'image/svg+xml;charset=utf-8' }),
      domURL = self.URL || self.webkitURL || self,
      url = domURL.createObjectURL(svg),
      img = new Image()

    img.onload = function () {
      ctx.drawImage(this, 0, 0)
      domURL.revokeObjectURL(url)
      callback(this)
    }

    img.src = url
  }
}
