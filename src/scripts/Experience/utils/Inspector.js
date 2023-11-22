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
    this.scene.add(...this.createAxesHelpers())

    this.panel = this.createPanel()
    this.parent.insertBefore(this.panel, this.parent.firstChild)
  }

  createPanel() {
    let panel = document.createElement('div')
    panel.innerHTML = 'Hello World'
    panel.style.position = 'absolute'
    return panel
  }

  createTransformControls(
    scene,
    camera,
    renderer,
    initialPosition = new Vector3(0, 0, 0)
  ) {
    let root = new Object3D()

    if (initialPosition) {
      root.position.set(initialPosition.x, initialPosition.y, initialPosition.z)
    }

    let transformControls = new TransformControls(camera, renderer.domElement)

    scene.add(root)
    scene.add(transformControls)
    transformControls.attach(root)

    return transformControls
  }

  createAxesHelpers() {
    let posCoords = new AxesHelper(5)
    let negCoords = new AxesHelper(2)
    negCoords.rotateY(MathUtils.degToRad(180))

    negCoords.setColors(0xa65959, 0x59a659, 0x5959a6)
    return [posCoords, negCoords]
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
        console.log(intersects[0])
      }
    }

    window.addEventListener('pointermove', onPointerMove)

    window.addEventListener('click', onClick)

    return raycaster
  }
}
