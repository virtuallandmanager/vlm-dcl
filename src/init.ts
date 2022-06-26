import { initDialogs } from "./dialogs";
import { initImages } from "./images";
import { initVideoScreens } from "./videos";

export const initScene = (sceneData: any) => {
  log(sceneData);
  initDialogs(sceneData.dialogs);
  initImages(sceneData.imageTextures);
  initVideoScreens(sceneData.videoSystems);
};
