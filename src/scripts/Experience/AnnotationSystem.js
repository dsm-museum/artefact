import { TextureLoader } from 'three'
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
      throw 'AnnotationSystem need a camera and canvas element to work.'
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
