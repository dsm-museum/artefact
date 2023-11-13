import { Object3D, TextureLoader, Vector3 } from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import Annotation from './Annotation'
import Experience from './Experience'

export default class AnnotationSystem {
  constructor(_annotationDOMContainer) {
    this.experience = new Experience()
    this.annotations = []
    this.debug = false
    this.annotationDOMContainer = _annotationDOMContainer
    this.textureLoader = new TextureLoader()
    this.correctAnswerIcon = this.loadIcon('./icons/correct-answer.png')
    this.wrongAnswerIcon = this.loadIcon('./icons/wrong-answer.png')
    this.questionIcon = this.loadIcon('./icons/question-icon.png')
    this.lockIcon = this.loadIcon('./icons/lock-icon.png')

    if (
      this.experience.camera.instance === undefined ||
      this.experience.camera.canvas === undefined
    ) {
      throw 'AnnotationSystem needs a camera and canvas element to work.'
    }
  }

  dispose() {
    for (let annotation of this.annotations) {
      annotation.domElement.remove()
    }
  }

  createAnnotation(annotationData, urlPath) {
    let annotation = new Annotation(annotationData, urlPath)

    // Add the annotation to the internal array
    this.annotations.push(annotation)

    // Add the annotation to the DOM-Overlay
    this.annotationDOMContainer.appendChild(annotation.domElement)

    return annotation
  }

  createPlaceHelper(initialPosition = new Vector3(0, 0, 0)) {
    let root = new Object3D()

    if (initialPosition) {
      root.position.set(initialPosition.x, initialPosition.y, initialPosition.z)
    }

    let transformControls = new TransformControls(
      this.experience.camera.instance,
      this.experience.renderer.instance.domElement
    )

    transformControls.attach(root)

    transformControls.addEventListener('dragging-changed', (event) => {
      this.experience.controls.instance.enabled = !event.value
      console.log(root.position)
    })

    this.experience.scene.add(root)
    this.experience.scene.add(transformControls)
  }

  update(inAR = false) {
    if (this.annotations.length !== 0) {
      for (let annotation of this.annotations) {
        annotation.update(inAR)
      }
    }
  }

  setDebug(enabled = true) {
    this.debug = enabled
    for (let annotation of this.annotations) {
      annotation.enableDebug(this.debug)
    }
  }

  hideAnnotations(willHide = true) {
    for (let annotation of this.annotations) {
      annotation.hide(willHide)
    }
  }

  loadIcon(path) {
    let texture = this.textureLoader.load(path)
    return texture
  }
}
