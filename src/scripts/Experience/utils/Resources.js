import EventEmitter from './EventEmitter'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { TextureLoader } from 'three'
import { LoadingManager } from 'three'

export default class Resources extends EventEmitter {
  constructor(sources) {
    super()

    this.sources = sources

    this.items = {}
    this.toLoad = this.sources.length
    this.loaded = 0

    //this.setLoadingManager();
    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    this.loaders = {}
    this.loaders.gltfLoader = new GLTFLoader()
    this.loaders.dracoLoader = new DRACOLoader()
    this.loaders.textureLoader = new TextureLoader()
    this.loaders.dracoLoader.setDecoderPath('./draco/')
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)
  }

  // Seems there is no trivial way to hook into the loading process, before the loading starts and get the name of the resource (to display it in the loading screen as "Started loading <source.name>")
  setLoadingManager() {
    this.loadingManager = new LoadingManager()

    // onStart (when a resource starts being loaded)
    this.loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
      console.log(url)
    }
  }

  startLoading() {
    for (const source of this.sources) {
      switch (source.type) {
        case 'gltfModel':
          this.loaders.gltfLoader.load(source.path, (file) => {
            this.loadInitial(source, file)
          })
          break
        case 'texture':
          this.loaders.textureLoader.load(source.path, (file) => {
            this.loadInitial(source, file)
          })
          break
        case 'dracoModel':
          //todo
          break
      }
    }
  }

  // Loads the first 3d model and triggers the "loaded" event
  loadInitial(source, file) {
    this.items[source.id] = file
    this.loaded++

    this.trigger('progress', [this.loaded, this.toLoad, source.name])

    if (this.loaded === this.toLoad) {
      this.trigger('loaded')
    }
  }

  // Loads a 3d model and triggers the modelReady event
  load(source) {
    this.loaders.gltfLoader.load(source, (file) => {
      this.trigger('modelReady', [file])
    })
  }
}
