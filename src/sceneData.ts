import { TSceneData } from "./types/SceneData";

export let sceneData: TSceneData;

export const updateSceneData = (sceneDataConfig: TSceneData) => {
    sceneData = sceneDataConfig;
}