import { SceneData } from "./classes/SceneData";
import { TSceneData } from "./types/SceneData";

export let sceneData: TSceneData = new SceneData();

export const updateSceneData = (sceneDataConfig: TSceneData) => {
    sceneData = sceneDataConfig;
}

