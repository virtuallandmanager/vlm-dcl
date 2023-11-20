import { VLMImage } from "../components/VLMImage.component";
import { VLMClaimPoint } from "../components/VLMClaimPoint.component";
import { VLMSound } from "../components/VLMSound.component";
import { VLMVideo } from "../components/VLMVideo.component";
import { VLMScene } from "../components/VLMScene.component";
import { VLMMesh } from "../components/VLMMesh.component";
export type VLMSceneElement = VLMImage.VLMConfig | VLMSound.VLMConfig | VLMVideo.VLMConfig | VLMMesh.VLMConfig | VLMClaimPoint.VLMConfig;
export type VLMSceneElementInstance = VLMImage.Instance | VLMSound.Instance | VLMVideo.Instance | VLMMesh.Instance;
export declare abstract class VLMSceneManager {
    static sceneId: string;
    static store: {
        [uuid: string]: VLMSceneElement;
    };
    static scenePreset?: VLMScene.Preset;
    static initScenePreset: CallableFunction;
    static updateScenePreset: CallableFunction;
    static createSceneElement: CallableFunction;
    static createSceneElementInstance: CallableFunction;
    static updateSceneElement: CallableFunction;
    static updateSceneSetting: CallableFunction;
    static updateSceneElementInstance: CallableFunction;
    static deleteSceneElement: CallableFunction;
    static deleteSceneElementInstance: CallableFunction;
}
