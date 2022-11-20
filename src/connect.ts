import { getParcel } from "@decentraland/ParcelIdentity";
import { TWebSocketMessage } from "./types/WebSocketMessage";
import { VLMInterval } from "./components/interval";
import { createAudioStream, deleteAudioStream, updateAudioStream } from "./audio";
import { createDialog, deleteDialog, updateDialog } from "./dialogs";
import { createImage, updateImage, updateImageInstance, createImageInstance, deleteImage, deleteImageInstance } from "./images";
import { createNft, createNftInstance, deleteNft, deleteNftInstance, updateNft, updateNftInstance } from "./nfts";
import { createVideoScreen, updateVideoScreen, updateVideoInstance, createVideoInstance, deleteVideoScreen, deleteVideoInstance } from "./videos";
import { updateCustomization, deleteCustomization } from "./custom";
import { updateSceneData, updateSceneFeatures } from "./sceneData";
import { updateModeration } from "./moderation";
import { initScene } from "./init";
import { checkPreviewMode, isPreview, runLocalServer, runStagingServer } from "./environment";

export let sceneDataUrl = "wss://api.dcl-vlm.io/wss/";

let initialized;
let socketConnector;
let connecting = false;
let connected = false;

const reconnect = () => {
  connecting = false;
  connected = false;
  socketConnector = new Entity();
  engine.addEntity(socketConnector);
  socketConnector.addComponent(
    new VLMInterval(10000, async () => {
      if (connecting && socketConnector.getComponentOrNull(VLMInterval)) {
        socketConnector.removeComponent(VLMInterval);
        return;
      }
      log("Attempting to reconnect to websocket");
      await connectCMS();
    })
  );
};

export const connectCMS = async () => {
  const connectPromise = new Promise(async (resolve, reject) => {
    connecting = true;
    const parcel = await getParcel();
    const baseParcel = parcel.land.sceneJsonData.scene.base;

    await checkPreviewMode();

    if (runLocalServer && isPreview) {
      sceneDataUrl = "ws://localhost:3000";
    } else if (runStagingServer && isPreview) {
      sceneDataUrl = "wss://staging-api.dcl-vlm.io/wss/";
    }

    let socket = await new WebSocket(sceneDataUrl + `?scene=${baseParcel}`);

    if (!socket) {
      reconnect();
      return;
    }

    socket.onopen = (ev) => {
      log("connected to web socket");
      connected = true;
      connecting = false;
      socket.send(JSON.stringify({ action: "init" }));

      if (socketConnector) {
        socketConnector.removeComponent(VLMInterval);
        engine.removeEntity(socketConnector);
      }

      let socketdelay = new Entity();
      engine.addEntity(socketdelay);
      socketdelay.addComponent(
        new VLMInterval(10000, () => {
          if (socketdelay.getComponentOrNull(VLMInterval) && (!connected || connecting)) {
            socketdelay.removeComponent(VLMInterval);
            engine.removeEntity(socketdelay);
            return;
          }
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
      // log(`VLM-DEBUG: socket event | `, event);
      const message: TWebSocketMessage = JSON.parse(event.data);
      // log(`VLM-DEBUG: received message to ${message.action} ${message.entity || ""} ${message.property || ""}`);

      if (!message.sceneData && !message.entityData) {
        return;
      }

      updateSceneData(message.sceneData);
      updateSceneFeatures(message.features);

      switch (message.action) {
        case "init":
          if (!initialized) {
            initScene(message);
          }
          initialized = true;
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
      break;
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
