import { RingGeometry, MeshBasicMaterial, Mesh } from 'three'

class XRIndicator {
  constructor(scale = 1, mesh = null) {
    this.scale = scale
    this.shownOnce = false
    this.setupMesh(mesh)
  }

  setupMesh(_userMesh) {
    if (_userMesh) {
      return _userMesh
    }

    let geometry = new RingGeometry(0.12 * this.scale, 0.14 * this.scale, 32)
    geometry.rotateX(-Math.PI / 2)

    let material = new MeshBasicMaterial()
    let mesh = new Mesh(geometry, material)

    mesh.matrixAutoUpdate = false
    mesh.visible = false
    mesh.name = 'XRIndicator'
    this.mesh = mesh
  }

  enable() {
    this.mesh.visible = true
  }

  disable() {
    this.mesh.visible = false
  }

  isEnabled() {
    return this.mesh.visible
  }

  reset() {
    this.disable()
    this.shownOnce = false
  }
}

export default XRIndicator
