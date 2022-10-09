import { initAnalytics } from "./analytics";
import { initModeration } from "./moderation";
import { initImages } from "./images";
import { initVideoScreens } from "./videos";
import { initNfts } from "./nfts";
import { initDialogs } from "./dialogs";

export const initScene = (message: any) => {
  if (message.features.analytics) {
    initAnalytics();
  }
  if (message.features.moderation) {
    initModeration();
  }
  if (message.features.entityPlacement) {
    initImages(message.sceneData.images || message.sceneData.imageTextures);
    initVideoScreens(message.sceneData.videoScreens || message.sceneData.videoSystems);
    initNfts(message.sceneData.nfts);
  }
  // TODO: Implement dialog feature
  // if (features.dialogs) {
  //   initDialogs(sceneData.dialogs);
  // }
};
