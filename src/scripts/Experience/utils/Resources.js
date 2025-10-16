import EventEmitter from './EventEmitter'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module'
import { TextureLoader } from 'three'
import { LoadingManager } from 'three'

export default class Resources extends EventEmitter {
  constructor() {
    super()

    this.assets = []
    this.requiredAssets = 0
    this.loadedAssets = 0

    this.currentAssetProgress = 0
    this.overallLoadingProgress = 0

    this.setLoadingManager()
    this.setLoaders()
  }

  setup(_assets) {
    this.assets = _assets
    this.requiredAssets = this.assets.filter((e) => {
      return e.replaces == null
    }).length
  }

  setLoaders() {
    this.loaders = {}
    this.loaders.gltfLoader = new GLTFLoader(this.loadingManager)
    this.loaders.dracoLoader = new DRACOLoader(this.loadingManager)
    this.loaders.textureLoader = new TextureLoader(this.loadingManager)
    this.loaders.dracoLoader.setDecoderPath('./draco/')
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)
    this.loaders.gltfLoader.setMeshoptDecoder(MeshoptDecoder)
  }

  // The loading manager can only track overall progress of asset loading (like 4 out of 5 items are loaded)
  // It does not support partial progress events
  setLoadingManager() {
    this.loadingManager = new LoadingManager()
  }

  // This evaluates the overall loading progress
  evaluateProgress() {
    // Get the progress of all previous assets (meaning loaded assets count 100 to the progress)
    let previousProgress = Number(this.loadedAssets * 100)

    // Overall progress is defined as the percentage of all 3D models that needs to be loaded
    let overallProgress = (previousProgress + this.currentAssetProgress) / this.assets.length

    overallProgress = Math.round(overallProgress)

    return overallProgress
  }

  // Loads a 3D model and reports back with an event
  async load(source) {
    // reset the current asset progress from previously, as loading begins now
    this.currentAssetProgress = 0
    let result = this.loaders.gltfLoader.loadAsync(source, (progressEvent) => {
      if (progressEvent.total == 0) {
        console.warn('progressEvent.total is 0')
        //TODO: what to do, maybe give an estimate somehow? or just return 100, as loaded
        this.currentAssetProgress = 100
        return
      }

      this.currentAssetProgress = Number(
        ((progressEvent.loaded / progressEvent.total) * 100).toFixed(0),
      )

      this.overallLoadingProgress = this.evaluateProgress()

      // finally trigger a progress event with the updated loading progress
      this.trigger('progress', [this.overallLoadingProgress])
    })

    result
      .then((result) => {
        this.loadedAssets += 1
        this.trigger('finishedSingle', [
          this.loadedAssets,
          this.assets.length,
          this.overallLoadingProgress,
        ])

        if (this.loadedAssets == this.assets.length) {
          this.trigger('finishedAll', [this.loadedAssets, 100])
        }
        return result
      })
      .catch((e) => {
        console.error(
          `The specified model "${source}" could not be loaded. Please check if the path is correct.`,
        )
        console.error(e)
      })

    return result
  }
}
