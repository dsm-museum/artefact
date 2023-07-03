import { MeshBasicMaterial } from 'three'
import { Mesh } from 'three'
import { RingGeometry } from 'three'
import Experience from './Experience'
import EventEmitter from './utils/EventEmitter'

export default class WebXRManager extends EventEmitter {
  constructor(_arSessionFeatures) {
    super()
    this.experience = new Experience()
    this.arSessionFeatures = this.configureFeatures(_arSessionFeatures)
    this.currentSession = null
    this.hitTestSourceRequested = false
    this.hitTestSource = null
    this.checkXRSupport()
    this.setup()
  }

  setup() {
    this.indicator = new XRIndicator()
    this.experience.scene.add(this.indicator.mesh)
  }

  configureFeatures(_arSessionFeatures) {
    if (!_arSessionFeatures) {
      return {
        requiredFeatures: ['hit-test', 'local'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body },
      }
    } else {
      return _arSessionFeatures
    }
  }

  dispose() {
    if (this.currentSession) {
      this.currentSession.end()
      this.currentSession = null
    }
  }

  // ToDo: Make this independent of requested mode, so either "immersive-ar", "immersive-vr" or something else works. Maybe as a parameter taken from the experience?
  async checkXRSupport() {
    if (!('xr' in window.navigator)) {
      this.xrInfo = { 'immersive-ar': false }
      return
    }

    const supportsAR = await window.navigator.xr.isSessionSupported(
      'immersive-ar'
    )

    // If AR is supported, save the info in the XRManager and trigger the event for further actions (e.g. enabling a button)
    this.xrInfo = { 'immersive-ar': supportsAR }
    this.trigger('supportsAR', [this.xrInfo])
  }

  // Currently only AR possible, ToDo: refactor to make it session-independent
  startSession() {
    // Ends the current Session if one already exists
    if (this.currentSession !== null) {
      this.dispose()
      return
    }

    if (this.xrInfo['immersive-ar'] !== true) {
      this.trigger('error', [
        'AR nicht unterstützt',
        'Die AR-Funktion ist für dieses Gerät leider nicht verfügbar.',
        'AR Session is not supported',
      ])
      return
    }

    if (this.xrInfo['immersive-ar'] === true) {
      navigator.xr
        .requestSession('immersive-ar', this.arSessionFeatures)
        .then((xrSession) => {
          this._onSessionStarted(xrSession)
        })
        .catch((error) => {
          // Log the error to the console for further investigation
          console.error(error)
          // Maybe make this as a switch case?
          if (error.name === 'NotSupportedError') {
            this.trigger('error', [
              'AR nicht unterstützt',
              'Ihr Browser unterstützt die benötigten AR-Funktionen leider nicht.',
              error.message,
            ])
          } else {
            // else if(error.name != null)?
            // Generic error
            this.trigger('error', [
              error.name,
              'Ein Fehler ist aufgetreten',
              error.message,
            ])
          }
        })
    }
  }

  _onSessionStarted(xrSession) {
    this.currentSession = xrSession
    this.trigger('onSessionStarted', [xrSession])
  }

  _onSessionEnded() {
    console.log('internal _onSessionEnded of WebXRManager')
    this.currentSession = null
    this.trigger('onSessionEnded')
  }
}

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
