import { VLM } from './app'
import {
  VLMVideo,
  VLMImage,
  VLMSound,
  VLMWidget,
  QuickVideoScreen,
  QuickImage,
  QuickSound,
  QuickMesh,
  QuickDanceFloor,
  VLMMesh,
  QuickNull,
  QuickNullConfig,
  QuickVideoConfig,
  QuickImageConfig,
  QuickMeshConfig,
  QuickSoundConfig,
  QuickDanceFloorConfig,
} from './components/index'

import 'xmlhttprequest-polyfill'
// @ts-ignore
import { URL } from 'whatwg-url-without-unicode'
import { ReactEcsRenderer } from './services/UI.service'

// @ts-ignore
globalThis['URL'] = URL

interface VideoConfig extends VLMVideo.Config {}
interface VideoInstanceConfig extends VLMVideo.Instance {}
interface ImageConfig extends VLMImage.Config {}
interface ImageInstanceConfig extends VLMImage.Instance {}
interface MeshConfig extends VLMMesh.Config {}
interface MeshInstanceConfig extends VLMMesh.Instance {}
interface SoundConfig extends VLMSound.Config {}
interface SoundInstanceConfig extends VLMSound.Instance {}
interface WidgetConfig extends VLMWidget.Config {}
namespace QuickCreator {
  export class SceneParent extends QuickNull {
    constructor(config: QuickNullConfig) {
      super(config)
      return this
    }
  }
  export class VideoScreen extends QuickVideoScreen {
    constructor(config: QuickVideoConfig) {
      super(config)
      return this
    }
  }
  export class Image extends QuickImage {
    constructor(config: QuickImageConfig) {
      super(config)
      return this
    }
  }
  export class Mesh extends QuickMesh {
    constructor(config: QuickMeshConfig) {
      super(config)
      return this
    }
  }
  export class Sound extends QuickSound {
    constructor(config: QuickSoundConfig) {
      super(config)
      return this
    }
    play: CallableFunction = () => {
      this.config.services.audio.playAll()
    }
  }
  export class DanceFloor extends QuickDanceFloor {
    constructor(config: QuickDanceFloorConfig) {
      super(config)
      return this
    }
  }
}

export default VLM
export {
  VLM,
  ReactEcsRenderer,
  QuickCreator,
  VideoConfig,
  VideoInstanceConfig,
  ImageConfig,
  ImageInstanceConfig,
  MeshConfig,
  MeshInstanceConfig,
  SoundConfig,
  SoundInstanceConfig,
  WidgetConfig,
}
