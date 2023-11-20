import { VLMSound } from "./VLMSound.component";
import { VLMImage } from "./VLMImage.component";
import { VLMMesh } from "./VLMMesh.component";
import { VLMVideo } from "./VLMVideo.component";
import { VLMWidget } from "./VLMWidget.component";
export declare namespace VLMScene {
    let sceneName: string;
    class Preset {
        images: VLMImage.Config[];
        videos: VLMVideo.Config[];
        sounds: VLMSound.Config[];
        models: VLMMesh.Config[];
        widgets: VLMWidget.Config[];
        constructor(config: Preset);
    }
}
