import Experience from './Experience'
import {
  LineDashedMaterial,
  Vector3,
  TextureLoader,
  SpriteMaterial,
  Sprite,
  SphereBufferGeometry,
  MeshBasicMaterial,
  Color,
  Mesh,
  BufferGeometry,
  Line,
  Object3D,
  BoxHelper,
} from 'three'

/*
 const points = [];
points.push( new THREE.Vector3( - 10, 0, 0 ) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );

const geometry = new THREE.BufferGeometry().setFromPoints( points );

const line = new THREE.Line( geometry, material );
scene.add( line );
 */

let textureLoader = new TextureLoader()

let lineDashedMaterial = new LineDashedMaterial({
  color: 0xffffff,
  linewidth: 5,
  scale: 1,
  dashSize: 0.01,
  gapSize: 0.01,
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

    this.meshGeometry = model.scene.children[0].geometry
    this.line = null

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

  createTargetMesh(position, indicatorPosition) {
    let targetGeometry = new SphereBufferGeometry(0.013, 32, 32) // TODO: Don't scale it here, but rather later?
    let targetMaterial = new MeshBasicMaterial({
      color: this.annotationBackgroundColor,
      transparent: true,
      depthWrite: false,
      opacity: 1.0,
    })

    // We need a parent mesh to raycast against
    let targetMesh = new Mesh(targetGeometry, targetMaterial)
    targetMesh.add(this.createIcon())

    // Set the position to the position of the center of the triangle defined by the three vertices in `position` of config.json
    // Setting it to the position of the first vertex for now
    // TODO: How to better connect Annotation and Mesh together?

    // Get the geometry of the mesh
    //this.model.scene.children[0].position.set(0, 0, 0)

    let meshGeometry = this.model.scene.children[0].geometry
    let positionAttribute = meshGeometry.getAttribute('position')

    // Get the three indices from the position array
    let indexVertexA = position[0]
    let indexVertexB = position[1]
    let indexVertexC = position[2]

    let vertexPositionA = new Vector3()
    vertexPositionA.fromBufferAttribute(positionAttribute, indexVertexA)

    // Get the world position of the endpoint of the annotation
    this.model.scene.children[0].localToWorld(vertexPositionA)

    // Set the position of the clickable target to the indicatorPosition
    targetMesh.position.set(
      indicatorPosition[0],
      indicatorPosition[1],
      indicatorPosition[2]
    )

    // Add the main mesh offset
    //vertexPositionA.add(this.model.scene.children[0].position)

    // Create the line
    let line = this.createDashedLine(vertexPositionA, indicatorPosition)
    this.line = line

    this.experience.scene.attach(line)

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
    sprite.scale.set(0.02, 0.02, 1.0)
    return sprite
  }

  createDashedLine(vertexPosition, indicatorPosition) {
    const points = []

    // from
    points.push(
      new Vector3(vertexPosition.x, vertexPosition.y, vertexPosition.z)
    )

    // to
    points.push(
      new Vector3(
        indicatorPosition[0],
        indicatorPosition[1],
        indicatorPosition[2]
      )
    )

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

  update(inXR = false) {
    this.target.updateWorldMatrix(true, true)

    // Update the vertex position just like in  `createTargetMesh`
    let vertexPosition = new Vector3()
    let positionAttribute = this.meshGeometry.getAttribute('position')

    let indexVertexA = this.annotationData.position[0]

    vertexPosition.fromBufferAttribute(positionAttribute, indexVertexA)

    this.model.scene.children[0].localToWorld(vertexPosition)

    //const x = (targetPosition.x + 1) / window.innerWidth
    //const y = ((-targetPosition.y + 1) / 2) * window.innerHeight

    // THIS WORKS AND IT SETS THE TARGET INDICATORS
    /*this.target.position.set(
      vertexPosition.x,
      vertexPosition.y,
      vertexPosition.z
    )*/

    let linePositionAttribute = this.line.geometry.getAttribute('position')
    linePositionAttribute.setXYZ(
      0,
      vertexPosition.x,
      vertexPosition.y,
      vertexPosition.z
    )

    linePositionAttribute.needsUpdate = true

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
    this.target.visible = !willHide
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
    let geometry = new SphereBufferGeometry(0.01, 32, 32)
    let mesh = new Mesh(geometry, mat)
    mesh.position.set(position.x, position.y, position.z)
    this.experience.scene.add(mesh)
  }
}
