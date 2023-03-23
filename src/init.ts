import { VLMNFTFrames, VLMImages, VLMVideoScreens, VLMCustomizations } from "./controllers";
import { TWebSocketMessage } from "./types/WebSocketMessage";

export const initScene = (message: TWebSocketMessage) => {
  if (message.features.entityPlacement) {
    VLMImages.init(message.sceneData.images);
    VLMVideoScreens.init(message.sceneData.videoScreens);
    VLMNFTFrames.init(message.sceneData.nfts);
  }
  if (message.features.customizations) {
    VLMCustomizations.setState(message.sceneData.customizations);
  }
  // TODO: Implement dialog feature
  // if (features.dialogs) {
  //   initDialogs(sceneData.dialogs);
  // }
};
