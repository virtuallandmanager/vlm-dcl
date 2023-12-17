// import { VLMClaimPoint } from "./VLMClaimPoint.component";
// import { VLMNFT } from "./VLMNFT.component";
import { VLMSound } from './VLMSound.component'
import { VLMImage } from './VLMImage.component'
import { VLMMesh } from './VLMMesh.component'
import { VLMVideo } from './VLMVideo.component'
import { VLMWidget } from './VLMWidget.component'
import { VLMClaimPoint } from './VLMClaimPoint.component'

export namespace VLMScene {
  export let sceneName: string

  export class Preset {
    images: VLMImage.Config[] = []
    videos: VLMVideo.Config[] = []
    sounds: VLMSound.Config[] = []
    models: VLMMesh.Config[] = []
    widgets: VLMWidget.Config[] = []
    claimPoints: VLMClaimPoint.Config[] = []
    // nfts: VLMNFT.DCLConfig[] = [];

    constructor(config: Preset) {
      this.images = config.images || this.images
      this.videos = config.videos || this.videos
      this.sounds = config.sounds || this.sounds
      this.widgets = config.widgets || this.widgets
      this.claimPoints = config.claimPoints || this.claimPoints
      // this.nfts = config.nfts || this.nfts;
    }
  }
}
