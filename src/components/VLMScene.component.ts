import { VLMGiveaway } from "./VLMGiveaway.component";
import { VLMImage } from "./VLMImage.component";
import { VLMNFT } from "./VLMNFT.component";
import { VLMSound } from "./VLMSound.component";
import { VLMVideo } from "./VLMVideo.component";
import { VLMWidget } from "./VLMWidget.component";

export namespace VLMScene {
  export let sceneName: string;

  export class Preset {
    giveaways: VLMGiveaway.DCLConfig[] = [];
    images: VLMImage.DCLConfig[] = [];
    videos: VLMVideo.DCLConfig[] = [];
    nfts: VLMNFT.DCLConfig[] = [];
    sounds: VLMSound.DCLConfig[] = [];
    widgets: VLMWidget.DCLConfig[] = [];

    constructor(config: Preset) {
      this.giveaways = config.giveaways || this.giveaways;
      this.images = config.images || this.images;
      this.nfts = config.nfts || this.nfts;
      this.sounds = config.sounds || this.sounds;
      this.widgets = config.widgets || this.widgets;
    }
  }
}
