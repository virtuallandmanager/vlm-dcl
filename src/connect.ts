import { VLMAudioStreams, VLMCustomizations, VLMDialogs, VLMImages, VLMNFTFrames, VLMVideoScreens } from "./controllers";
import { initScene } from "./init";
import { updateSceneData, updateSceneFeatures } from "./sceneData";
import { TWebSocketMessage } from "./types/WebSocketMessage";

export abstract class MessageRouter {
   
  onMessage: CallableFunction = (message: TWebSocketMessage) => {

      if (!message.sceneData && !message.entityData) {
        return;
      }

      updateSceneData(message.sceneData);
      updateSceneFeatures(message.features);

      switch (message.action) {
        case "init":
            initScene(message);
          break;
        case "create":
          createEntity(message);
          break;
        case "update":
          updateEntity(message);
          break;
        case "delete":
          deleteEntity(message);
          break;
      }

};
};

const createEntity = (message: any) => {
  switch (message.entity) {
    case "image":
      VLMImages.create(message.entityData);
      break;
    case "imageInstance":
      VLMImages.createInstance(message.entityData, message.instanceData);
      break;
    case "nft":
      VLMNFTFrames.create(message.entityData);
      break;
    case "nftInstance":
      VLMNFTFrames.createInstance(message.entityData, message.instanceData);
      break;
    case "video":
      VLMVideoScreens.create(message.entityData);
      break;
    case "videoInstance":
      VLMVideoScreens.createInstance(message.entityData, message.instanceData);
      break;
    case "audioStream":
      VLMAudioStreams.create(message.entityData);
      break;
    case "dialog":
      VLMDialogs.create(message.entityData);
      break;
  }
};

const updateEntity = (message: any) => {
  switch (message.entity) {
    case "image":
      VLMImages.update(message.entityData, message.property, message.id);
      break;
    case "imageInstance":
      VLMImages.updateInstance(message.instanceData, message.property, message.id);
      break;
    case "nft":
      VLMNFTFrames.update(message.entityData, message.property, message.id);
      break;
    case "nftInstance":
      VLMNFTFrames.updateInstance(message.instanceData, message.property, message.id);
      break;
    case "video":
      VLMVideoScreens.update(message.entityData, message.property, message.id);
      break;
    case "videoInstance":
      VLMVideoScreens.updateInstance(message.instanceData, message.property, message.id);
      break;
    case "audioStream":
      VLMAudioStreams.update(message.entityData, message.property, message.id);
      break;
    case "dialog":
      VLMDialogs.update(message.entityData, message.property, message.id);
      break;
    case "moderation":
      // updateModeration();
      break;
    case "customization":
      VLMCustomizations.update(message.customizationData, message.id);
      break;
  }
};

const deleteEntity = (message: any) => {
  log("remove entity message", message);
  switch (message.entity) {
    case "image":
      VLMImages.delete(message.id);
      break;
    case "imageInstance":
      VLMImages.deleteInstance(message.id);
      break;
    case "nft":
      VLMNFTFrames.delete(message.id);
      break;
    case "nftInstance":
      VLMNFTFrames.deleteInstance(message.id);
      break;
    case "video":
      VLMVideoScreens.delete(message.id);
      break;
    case "videoInstance":
      VLMVideoScreens.deleteInstance(message.id);
      break;
    case "audioStream":
      VLMAudioStreams.delete(message.id);
      break;
    case "dialog":
      VLMDialogs.delete(message.id);
      break;
    case "customization":
      VLMCustomizations.delete(message.id);
      break;
  }
};
