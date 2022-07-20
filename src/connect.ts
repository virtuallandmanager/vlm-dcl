import { isPreviewMode } from "@decentraland/EnvironmentAPI";
import { getUserAccount } from "@decentraland/EthereumController";
import { getParcel } from "@decentraland/ParcelIdentity";
import { initAnalytics } from "./analytics";
import { createAudioStream, removeAudioStream, updateAudioStream } from "./audio";
import { createDialog, removeDialog, updateDialog } from "./dialogs";
import { createImage, updateImage, updateImageInstance, removeImage, createImageInstance, removeImageInstance } from "./images";
import { initScene } from "./init";
import { createVideoScreen, removeVideoScreen, updateVideoScreen, updateVideoInstance, createVideoInstance, removeVideoInstance } from "./videos";
import { Interval } from "@dcl/ecs-scene-utils";
import { createCustomizations, updateCustomization, removeCustomization } from "./custom";

export let user:any
export let sceneData: any = {};

export const socketConnect = (reconnect?:boolean) =>{

}


export const connectCMS = async () => {
  initAnalytics();
  const parcel = await getParcel();
  const baseParcel = parcel.land.sceneJsonData.scene.base;

  user = await getUserAccount();
  log("user is", user);
  let isPreview = await isPreviewMode();

  const useLocal = false;
  const useStaging = false;

  let baseUrl = "wss://api.dcl-vlm.io/wss/";

  if (useLocal && isPreview) {
    baseUrl = "ws://localhost:3000";
  } else if (useStaging && isPreview) {
    baseUrl = "wss://staging-api.dcl-vlm.io/wss/";
  }

  let socket = new WebSocket(baseUrl + `?scene=${baseParcel}`);

  if (!socket) {
    return;
  }

  socket.onopen = (ev) => {
    log("connected to web socket");
    socket.send(JSON.stringify({ action: "init" }));

    let socketdelay = new Entity();
    engine.addEntity(socketdelay);
    socketdelay.addComponent(
      new Interval(10000, () => {
        socket.send(JSON.stringify({ command: "ping" }));
      })
    );
  };

  // socket.onopen = (ev) => {
  //   log("connected to web socket");
  //   socket.send(JSON.stringify({ action: "init" }));

  //   // let socketdelay = new Entity();
  //   // engine.addEntity(socketdelay);
  //   // socketdelay.addComponent(
  //   //   new utils.Interval(10000, () => {
  //   //     socket.send(JSON.stringify({ command: "ping" }));
  //   //   })
  //   // );
  // };

  socket.onclose = function (event) {
    log("socket closed");
  };

  socket.onmessage = function (event) {
    const message = JSON.parse(event.data);

    sceneData = message.sceneData;

    log(`received message to ${message.action} ${message.entity || ""} ${message.property || ""}`);
    switch (message.action) {
      case "init":
        initScene(message.sceneData);
        break;
      case "create":
      case "add":
        createEntity(message);
        break;
      case "update":
        updateEntity(message);
        break;
      case "remove":
        removeEntity(message);
        break;
    }
  };
};

const createEntity = (message: any) => {
  switch (message.entity) {
    case "image":
      createImage(message.entityData);
    case "imageInstance":
      createImageInstance(message.entityData, message.instanceData);
      break;
    case "video":
      createVideoScreen(message.entityData);
      break;
    case "videoInstance":
      createVideoInstance(message.entityData, message.instanceData);
      break;
    case "audioStream":
      createAudioStream(message.sceneData.audioStreams);
      break;
    case "dialog":
      createDialog(message.sceneData.dialogs);
      break;
    case "customization":
      createCustomizations(message.sceneData.customizations);
      break;
  }
};

const updateEntity = (message: any) => {
  switch (message.entity) {
    case "image":
      updateImage(message.sceneData.imageTextures, message.property, message.id);
      break;
    case "imageInstance":
      updateImageInstance(message.sceneData.imageTextures, message.property, message.id);
      break;
    case "video":
      updateVideoScreen(message.sceneData.videoSystems, message.property, message.id);
      break;
    case "videoInstance":
      updateVideoInstance(message.sceneData.videoSystems, message.property, message.id);
      break;
    case "audioStream":
      updateAudioStream(message.sceneData.audioStreams, message.property, message.id);
      break;
    case "dialog":
      updateDialog(message.sceneData.dialogs, message.property, message.id);
      break;
    case "customization":
      updateCustomization(message.sceneData.customizations, message.id);
      break;
  }
};

const removeEntity = (message: any) => {
  log('remove entity message', message)
  switch (message.entity) {
    case "image":
      removeImage(message.entityData);
    case "imageInstance":
      removeImageInstance(message.entityData, message.instanceData);
      break;
    case "video":
      removeVideoScreen(message.sceneData.videoSystems, message.id);
      break;
    case "videoInstance":
      removeVideoInstance(message.sceneData.videoSystems, message.id);
      break;
    case "audioStream":
      removeAudioStream(message.sceneData.audioStreams, message.property, message.id);
      break;
    case "dialog":
      removeDialog(message.sceneData.dialogs, message.property, message.id);
      break;
    case "customization":
      removeCustomization(message.id);
      break;
  }
};