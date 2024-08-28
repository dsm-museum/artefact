import {
  TextureLoader,
} from 'three'
import Annotation from './Annotation'
import Experience from './Experience'
import AnchoredAnnotation from './AnchoredAnnotation'
import { SRGBColorSpace } from 'three'

export default class AnnotationSystem {
  constructor(_annotationDOMContainer) {
    this.experience = new Experience()
    this.annotations = []
    this.debug = false
    this.annotationDOMContainer = _annotationDOMContainer
    this.textureLoader = new TextureLoader()
    this.correctAnswerIcon = this.loadIcon('./icons/correct-icon.png')
    this.wrongAnswerIcon = this.loadIcon('./icons/false-icon.png')
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

  /*createAnnotation(annotationData, urlPath, modelToAttachTo) {
    let annotation = new AnchoredAnnotation(
      annotationData,
      urlPath,
      modelToAttachTo
    )

    console.log(annotation)

    // Add the annotation to the internal array
    this.annotations.push(annotation)

    // Add the annotation to the DOM-Overlay
    this.annotationDOMContainer.appendChild(annotation.domElement)

    return annotation
  }*/

  createAnchoredAnnotation(annotationData, urlPath, modelToAttachTo) {
    let annotation = new AnchoredAnnotation(
      annotationData,
      urlPath,
      modelToAttachTo
    )

    // Add the annotation to the internal array
    this.annotations.push(annotation)

    // Add the annotation to the DOM-Overlay
    this.annotationDOMContainer.appendChild(annotation.domElement)

    return annotation
  }

  update() {
    if (this.annotations.length !== 0) {
      for (let annotation of this.annotations) {
        annotation.update()
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
    texture.colorSpace = SRGBColorSpace
    return texture
  }
}
