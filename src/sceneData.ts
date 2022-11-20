import { SceneData, SceneFeatures } from "./classes/SceneData";
import { TSceneData, TSceneFeatures } from "./types/SceneData";

export let sceneData: TSceneData = new SceneData();
export let sceneFeatures: TSceneFeatures = new SceneFeatures();

export const updateSceneData = (sceneDataConfig: TSceneData) => {
  sceneData = sceneDataConfig;
};

export const updateSceneFeatures = (sceneFeaturesConfig: TSceneFeatures) => {
  Object.keys(sceneFeaturesConfig).forEach((feature: string) => {
    sceneFeatures[feature] = sceneFeaturesConfig[feature];
  });
};
