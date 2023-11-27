import { AxesHelper, BoxGeometry, MeshBasicMaterial, Object3D } from 'three'

function createDebugOutline() {
  console.log('debug')
  const headElement = document.head
  const styleElement = document.createElement('style')
  styleElement.setAttribute('debug-css', '')
  const styleText = `* {
      outline: 1px dashed tomato;
      outline-offset: -1px;
    }`
  styleElement.innerText = styleText
  const debugElement = headElement.querySelector('[debug-css]')
  if (debugElement) {
    return debugElement.remove()
  }
  headElement.append(styleElement)
}

function createAxis(object3d) {
  let axis = new AxesHelper()

  if (object3d instanceof Object3D) {
    object3d.add(axis)
  } else {
    return axis
  }
}

function createDebugCube() {
  let geom = new BoxGeometry(0.2, 0.2, 0.2)
  let mat = new MeshBasicMaterial({ color: 0xff0000 })
  let mesh = new Mesh(geom, mat)
  return mesh
}

export { createDebugOutline, createDebugCube, createAxis }
