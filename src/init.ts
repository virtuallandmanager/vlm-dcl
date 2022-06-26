import { initDialogs } from "./dialogs";
import { initImages } from "./images";
import { initVideoScreens } from "./videos";

export const initScene = (sceneData: any) => {
  log(sceneData);
  initImages(sceneData.imageTextures);
  initDialogs(sceneData.dialogs);
  initVideoScreens(sceneData.videoSystems);
};
