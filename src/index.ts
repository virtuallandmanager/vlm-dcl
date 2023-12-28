import { VLM } from './app'
import { VLMVideo, VLMImage, VLMSound, VLMWidget, QuickVideoScreen, QuickImage, QuickSound, QuickMesh, VLMMesh, QuickNull } from './components/index'
import 'xmlhttprequest-polyfill'

// @ts-ignore
import { URL } from 'whatwg-url-without-unicode'
import { QuickDanceFloor } from './components/VLMDanceFloor.component'
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
  export class SceneParent extends QuickNull {}
  export class VideoScreen extends QuickVideoScreen {}
  export class Image extends QuickImage {}
  export class Mesh extends QuickMesh {}
  export class Sound extends QuickSound {}
  export class DanceFloor extends QuickDanceFloor {}
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
