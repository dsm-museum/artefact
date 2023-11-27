import {
  AxesHelper,
  MathUtils,
  Object3D,
  Raycaster,
  Vector2,
  Vector3,
} from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'

export class Inspector {
  constructor(parent, scene) {
    this.parent = parent
    this.scene = scene
    this.scene.add(this.createAxesHelper())

    this.panel = this.createPanel()
    this.parent.insertBefore(this.panel, this.parent.firstChild)
    //this.buildSceneTree()
  }

  createPanel() {
    let panel = document.createElement('div')
    panel.id = 'three-inspector'
    panel.innerText = 'INSPECTOR'
    panel.appendChild(document.createElement('hr'))
    panel.style.color = '#ffffff'
    panel.style.padding = '8px'
    panel.style.borderRadius = '4px'
    panel.style.margin = '4px'
    panel.style.position = 'absolute'
    panel.style.backgroundColor = '#2e3440'
    return panel
  }

  createBlade(entity) {
    let blade = null
    let bladeName = 'Undefined'

    // If the entity does not have children
    if (entity.children.length == 0) {
      blade = document.createElement('div')
      bladeName = entity.name
        ? entity.name
        : 'Untitled ' + (entity.type ? entity.type : 'Untyped')
      blade.innerText = bladeName
    } else {
      blade = document.createElement('details')
      bladeName = entity.name
        ? entity.name
        : 'Untitled ' + (entity.type ? entity.type : 'Untyped')

      // Add summary heading
      let summary = document.createElement('summary')
      summary.innerText = '> ' + bladeName
      blade.appendChild(summary)

      let childList = document.createElement('ul')
      blade.appendChild(childList)

      for (let child of entity.children) {
        let elem = document.createElement('li')
        elem.innerText = child.name ? child.name : child.type
        childList.appendChild(elem)
      }
    }

    // Add to the inspector
    blade.style.color = '#ffffff'
    console.log(blade)
    this.panel.appendChild(blade)
  }

  createTransformControls(
    scene,
    camera,
    renderer,
    initialPosition = new Vector3(0, 0, 0)
  ) {
    let root = new Object3D()
    root.name = 'Transform Control Root'

    if (initialPosition) {
      root.position.set(initialPosition.x, initialPosition.y, initialPosition.z)
    }

    let transformControls = new TransformControls(camera, renderer.domElement)
    transformControls.name = 'Transform Controls'

    scene.add(root)
    scene.add(transformControls)
    transformControls.attach(root)

    return transformControls
  }

  createAxesHelper() {
    let posCoords = new AxesHelper(5)
    posCoords.name = 'Axes Helper'
    return posCoords
  }

  createRaycaster(camera) {
    let raycaster = new Raycaster()
    let pointer = new Vector2()
    let scene = this.scene

    function onPointerMove(event) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    function onClick(event) {
      raycaster.setFromCamera(pointer, camera)

      let intersects = raycaster.intersectObjects(scene.children)

      if (intersects.length > 0) {
        //console.log(intersects[0])
      }
    }

    window.addEventListener('pointermove', onPointerMove)

    window.addEventListener('click', onClick)

    return raycaster
  }

  buildSceneTree() {
    // Iterate over first level and indicate that there are child elements
    for (let entity of this.scene.children) {
      this.createBlade(entity)
    }
  }
}
