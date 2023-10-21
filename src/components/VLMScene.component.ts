import { VLMClaimPoint } from "./VLMClaimPoint.component";
import { VLMImage } from "./VLMImage.component";
import { VLMModel } from "./VLMModel.component";
import { VLMNFT } from "./VLMNFT.component";
import { VLMSound } from "./VLMSound.component";
import { VLMVideo } from "./VLMVideo.component";
import { VLMWidget } from "./VLMWidget.component";

export namespace VLMScene {
  export let sceneName: string;

  export class Preset {
    images: VLMImage.DCLConfig[] = [];
    videos: VLMVideo.DCLConfig[] = [];
    nfts: VLMNFT.DCLConfig[] = [];
    models: VLMModel.DCLConfig[] = [];
    sounds: VLMSound.DCLConfig[] = [];
    widgets: VLMWidget.DCLConfig[] = [];
    claimPoints: VLMClaimPoint.DCLConfig[] = [];

    constructor(config: Preset) {
      this.images = config.images || this.images;
      this.nfts = config.nfts || this.nfts;
      this.sounds = config.sounds || this.sounds;
      this.widgets = config.widgets || this.widgets;
      this.videos = config.videos || this.videos;
      this.claimPoints = config.claimPoints || this.claimPoints;
    }
  }
}
