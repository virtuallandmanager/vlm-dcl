import { isPreviewMode } from "@decentraland/EnvironmentAPI";
import { getParcel } from "@decentraland/ParcelIdentity";
import { createAudioStream, deleteAudioStream, updateAudioStream } from "./audio";
import { createDialog, deleteDialog, updateDialog } from "./dialogs";
import { createImage, updateImage, updateImageInstance, createImageInstance, deleteImage, deleteImageInstance } from "./images";
import { initScene } from "./init";
import { createVideoScreen, updateVideoScreen, updateVideoInstance, createVideoInstance, deleteVideoScreen, deleteVideoInstance } from "./videos";
import { updateCustomization, deleteCustomization } from "./custom";
import { createNft, createNftInstance, deleteNft, deleteNftInstance, updateNft, updateNftInstance } from "./nfts";
import { Interval } from "./components/interval";
import { updateSceneData } from "./sceneData";
import { updateModeration } from "./moderation";

export let runLocalServer = false;
export let runStagingServer = false;
let socketConnector;

const reconnect = () => {
  socketConnector = new Entity();
  engine.addEntity(socketConnector);
  socketConnector.addComponent(
    new Interval(10000, () => {
      log("Attempting to connect to websocket");
      connectCMS();
    })
  );
};

export const useLocal = () => {
  runLocalServer = true;
};

export const useStaging = () => {
  runStagingServer = true;
};

export const connectCMS = async () => {
  const connectPromise = new Promise(async (resolve, reject) => {
    const parcel = await getParcel();
    const baseParcel = parcel.land.sceneJsonData.scene.base;

    let isPreview = await isPreviewMode();

    let baseUrl = "wss://api.dcl-vlm.io/wss/";

    if (runLocalServer && isPreview) {
      baseUrl = "ws://localhost:3000";
    } else if (runStagingServer && isPreview) {
      baseUrl = "wss://staging-api.dcl-vlm.io/wss/";
    }

    let socket = await new WebSocket(baseUrl + `?scene=${baseParcel}`);

    if (!socket) {
      reconnect();
      return;
    }

    socket.onopen = (ev) => {
      log("connected to web socket");
      socket.send(JSON.stringify({ action: "init" }));

      if (socketConnector) {
        socketConnector.removeComponent(Interval);
      }

      let socketdelay = new Entity();
      engine.addEntity(socketdelay);
      socketdelay.addComponent(
        new Interval(10000, () => {
          log("Pinging web socket...");
          socket.send(JSON.stringify({ command: "ping" }));
        })
      );
    };

    socket.onclose = (event) => {
      log("socket closed");
      reconnect();
    };

    socket.onmessage = (event) => {
      log(`VLM-DEBUG: socket event | `, event);
      const message = JSON.parse(event.data);
      log(`VLM-DEBUG: received message to ${message.action} ${message.entity || ""} ${message.property || ""}`);

      if (!message.sceneData && !message.entityData) {
        return;
      }

      updateSceneData(message.sceneData);

      switch (message.action) {
        case "init":
          initScene(message);
          log("Scene initialized")
          resolve();
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
  });
  return connectPromise;
};

const createEntity = (message: any) => {
  switch (message.entity) {
    case "image":
      createImage(message.entityData);
    case "imageInstance":
      createImageInstance(message.entityData, message.instanceData);
      break;
    case "nft":
      createNft(message.entityData);
      break;
    case "nftInstance":
      createNftInstance(message.entityData, message.instanceData);
      break;
    case "video":
      createVideoScreen(message.entityData);
      break;
    case "videoInstance":
      createVideoInstance(message.entityData, message.instanceData);
      break;
    case "audioStream":
      createAudioStream(message.entityData);
      break;
    case "dialog":
      createDialog(message.entityData);
      break;
  }
};

const updateEntity = (message: any) => {
  switch (message.entity) {
    case "image":
      updateImage(message.entityData, message.property, message.id);
      break;
    case "imageInstance":
      updateImageInstance(message.instanceData, message.property, message.id);
      break;
    case "nft":
      updateNft(message.entityData, message.property, message.id);
      break;
    case "nftInstance":
      updateNftInstance(message.instanceData, message.property, message.id);
      break;
    case "video":
      updateVideoScreen(message.entityData, message.property, message.id);
      break;
    case "videoInstance":
      updateVideoInstance(message.instanceData, message.property, message.id);
      break;
    case "audioStream":
      updateAudioStream(message.entityData, message.property, message.id);
      break;
    case "dialog":
      updateDialog(message.entityData, message.property, message.id);
      break;
    case "moderation":
      updateModeration();
      break;
    case "customization":
      updateCustomization(message.customizationData, message.id);
      break;
  }
};

const deleteEntity = (message: any) => {
  log("remove entity message", message);
  switch (message.entity) {
    case "image":
      deleteImage(message.id);
      break;
    case "imageInstance":
      deleteImageInstance(message.id);
      break;
    case "nft":
      deleteNft(message.id);
      break;
    case "nftInstance":
      deleteNftInstance(message.id);
      break;
    case "video":
      deleteVideoScreen(message.id);
      break;
    case "videoInstance":
      deleteVideoInstance(message.id);
      break;
    case "audioStream":
      deleteAudioStream(message.id);
      break;
    case "dialog":
      deleteDialog(message.id);
      break;
    case "customization":
      deleteCustomization(message.id);
      break;
  }
};
