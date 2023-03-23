import { SceneData, SceneFeatures } from "./classes/SceneData";
import { TSceneData, TSceneFeatures } from "./types/SceneData";

export let sceneData: TSceneData = new SceneData();
export let sceneFeatures: SceneFeatures = new SceneFeatures();

export const updateSceneData = (sceneDataConfig: TSceneData) => {
  sceneData = sceneDataConfig;
};

export const updateSceneFeatures = (sceneFeaturesConfig: TSceneFeatures) => {
  if (!sceneFeaturesConfig) {
    return;
  }
  sceneFeatures = new SceneFeatures(sceneFeaturesConfig);
};
