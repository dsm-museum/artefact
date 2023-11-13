import { AnimationClip, AnimationMixer } from 'three'

/**
 * AnimationSystem
 */
export default class AnimationSystem {
  constructor() {
    // Saves the different mixers, typically 1 mixer belongs to 1 animated mesh
    this.mixers = []

    // Saves the animation clips
    // "myClip": {...}
    this.animationClips = []

    this.debug = false
  }

  // Creates a new mixer for the specified object (rootModel)
  createMixer(rootModel, name = 'UnnamedMixer') {
    // Create the mixer
    let mixer = new AnimationMixer(rootModel)

    this.mixers.push({ name: name, mixer: mixer })
    return mixer
  }

  // Extracts and sets up animation clips for all the animations in the gltf file
  createClips(animations, mixer) {
    let actions = []
    for (let i = 0; i < animations.length; i++) {
      let action = mixer.clipAction(animations[i])
      actions.push(action)
      this.animationClips.push({
        name: animations[i].name,
        action: action,
        mixer: mixer,
      })
    }

    return actions
  }
}
