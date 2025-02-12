import { Pane } from 'tweakpane'
import cube from '../../../assets/inspector/cube.svg'

export default class Inspector {
  constructor() {
    this.sceneHierarchy = new Pane()
    this.sceneHierarchy.containerElem_.style.right = ''
    this.sceneHierarchy.containerElem_.style.top = ''
    this.sceneHierarchy.containerElem_.style.left = '8px'
    this.sceneHierarchy.containerElem_.style.top = '8px'
    this.sceneHierarchy.containerElem_.style.overflowY = 'scroll'
    this.sceneHierarchy.containerElem_.style.height = '100%'

    this.INSPECTOR_DEPTH = 2

    this.init()
    console.log(window.APP.scene.children)
  }

  init() {
    for (let child of window.APP.scene.children) {
      this.getSceneDepth(this.sceneHierarchy, child, 0)
    }
  }

  getSceneDepth(parent = null, element, depth) {
    if (depth > this.INSPECTOR_DEPTH) {
      return
    }

    if (depth == this.INSPECTOR_DEPTH) {
      let more = element.children.length != 0 ? ` (${element.children.length} more)` : ''
      parent.addBlade({
        view: 'text',
        disabled: true,
        parse: (v) => String(v),
        value: (element.name || element.type) + more,
      })
      return
    }

    let currentBlade = null

    if (element.children.length == 0) {
      // get the current element
      currentBlade = parent.addBlade({
        view: 'text',
        disabled: true,
        parse: (v) => String(v),
        value: element.name || element.type,
      })

      this.addIcon(currentBlade, element.type)
    } else {
      currentBlade = parent.addFolder({
        title: element.name || element.type,
        expanded: true,
      })
    }

    // try to get children
    for (let child of element.children) {
      this.getSceneDepth(currentBlade, child, depth + 1)
    }
  }

  addIcon(domElem) {
    let iconElem = document.createElement('img')
    iconElem.style.stroke = 'white'
    iconElem.style.width = '16px'
    iconElem.style.height = '16px'
    iconElem.src = cube

    let view = domElem.controller_.view.element
    view.style.display = 'flex'
    view.prepend(iconElem)
  }
}
