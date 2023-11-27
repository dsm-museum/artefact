import { EventDispatcher } from 'three'
import Experience from './Experience'
import XRIndicator from './utils/XRIndicator'

class WebXRSystem extends EventDispatcher {
  constructor() {
    super()
    this.experience = new Experience()
    this.xrMode = null
    this.xrSession = null
    this.xrSessionFeatures = null
    //
    this.xrIndicator = new XRIndicator()
    this.experience.scene.add(this.xrIndicator.mesh)
  }

  onSessionEnded = () => {
    this.xrSession.removeEventListener('end', this.onSessionEnded)

    this.xrSession = null

    this.dispatchEvent({ type: 'xrended', message: 'xrended' })
  }

  onSessionStarted = async (session) => {
    session.addEventListener('end', this.onSessionEnded)

    this.experience.renderer.instance.xr.setReferenceSpaceType('local')

    this.experience.renderer.instance.xr.setSession(session)

    this.xrSession = session

    this.dispatchEvent({ type: 'xrstarted', message: 'xrstarted' })
  }

  checkXRSupport() {
    if ('xr' in navigator) {
      navigator.xr.isSessionSupported(this.xrMode).then((isSupported) => {
        if (isSupported) {
          this.dispatchEvent({
            type: 'xrsupported',
            message: {
              isSupported: true,
            },
          })
        } else {
          this.dispatchEvent({
            type: 'xrsupported',
            message: {
              isSupported: false,
              reason: 'Session mode is not supported',
            },
          })
        }
      })
    } else {
      // XR not in navigator
      this.dispatchEvent({
        type: 'xrsupported',
        message: { isSupported: false, reason: "'XR' not in navigator." },
      })
    }
  }

  setXRSessionFeatures(mode = 'inline', features = {}) {
    this.xrMode = mode
    this.xrSessionFeatures = features
  }

  async startXR() {
    let session = this.experience.renderer.instance.xr.getSession()
    // End the previous session
    if (session) {
      console.log('There already is an active XR session. Exiting...')
      //this.onSessionEnded()
      session.end()
    } else {
      try {
        let requestedSession = await navigator.xr.requestSession(
          this.xrMode,
          this.xrSessionFeatures
        )

        this.onSessionStarted(requestedSession)
      } catch (error) {
        console.error(error)
      }
    }
  }

  dispose() {
    let session = this.experience.renderer.instance.xr.getSession()
    console.log(session)

    if (session) {
      session.end()
    }
  }
}

export { WebXRSystem }
