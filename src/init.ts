import { initAnalytics } from "./analytics";
import { setCustomizations } from "./custom";
import { initDialogs } from "./dialogs";
import { initImages } from "./images";
import { initVideoScreens } from "./videos";

export const initScene = (message: any) => {
  if (message.features.analytics) {
    initAnalytics();
  }
  // if (features.dialogs) {
  //   initDialogs(sceneData.dialogs);
  // }
  if (message.features.entityPlacement) {
    initImages(message.sceneData.imageTextures);
    initVideoScreens(message.sceneData.videoSystems);
  }
  if (message.features.customizations) {
    setCustomizations(message.sceneData.customizations);
  }
};
