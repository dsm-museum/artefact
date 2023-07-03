import { AnimationClip, AnimationMixer } from 'three'

/**
 * AnimationSystem
 */
export default class AnimationSystem {
  constructor() {
    // Saves the different mixers
    this.mixers = []

    // Saves the animation clips
    this.animationClips = []

    // Save the raw animations array from the gltfFile
    this.animations = []

    this.debug = false
  }

  addAnimations(animations) {
    for (let animation of animations) {
      this.animations.push(animation)
    }
  }

  /* Adds a new mixer to the system */
  addMixer(rootObject, name = 'mainMeshMixer') {
    let mixer = new AnimationMixer(rootObject)
    this.mixers.push({ name: name, mixer: mixer })
  }

  getMixerByName(name) {
    let mixerObj = this.mixers.find((mixer) => mixer.name == name)

    if (!mixerObj) {
      throw new Error(`No mixer named ${name} found.`)
    }

    return mixerObj.mixer
  }

  getClipByName(name) {
    if (!name) {
      throw new Error('AnimationSystem.getClipByName: No name specified')
    }

    let clip = AnimationClip.findByName(this.animations, name)

    if (!clip) {
      throw `No AnimationClip with the name ${name} found.`
    }

    return clip
  }

  // Create a playable animation for the object/mixer
  // (maybe change the name to getPlayableAnimation() or something more "understandable")
  getAction(animationName, mixerName) {
    // get the clip
    let clip = this.getClipByName(animationName)

    // get the corresponding mixer
    let mixer = this.getMixerByName(mixerName)

    // get an clipAction for the passed clip
    return mixer.clipAction(clip)
  }

  listMixers() {
    console.table(this.mixers)
  }

  listAnimationClips() {
    console.table(this.animationClips)
  }

  setDebug(enabled = true) {
    this.debug = enabled
  }

  // GETTERS
  //get MixerByIndex(index) {} ?

  //getMixerByName(name) {} ?

  //getAnimationClip(name) {} ?
}
