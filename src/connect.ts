// dcl utils
import { isPreviewMode } from "@decentraland/EnvironmentAPI";
import { getUserAccount } from "@decentraland/EthereumController";
import { getParcel } from "@decentraland/ParcelIdentity";
import { Interval } from "@dcl/ecs-scene-utils";
// vlm files and functions
import { initScene } from "./init";
import { startAnalytics } from "./analytics";
import { createAudioStream, removeAudioStream, updateAudioStream } from "./audio";
import { createDialog, removeDialog, updateDialog } from "./dialogs";
import { createImage, removeImage, updateImage } from "./images";
import { createVideoScreen, removeVideoScreen, updateVideoScreen } from "./videos";

export const connectCMS = async () => {
  startAnalytics();
  const parcel = await getParcel();
  const baseParcel = parcel.land.sceneJsonData.scene.base;

  const user = await getUserAccount();
  log("user is", user);
  let isPreview = await isPreviewMode();

  // isPreview = false

  let socket = new WebSocket("" + (isPreview ? "ws://localhost:3000/" : "wss://api.dcl-vlm.io/wss/") + `?scene=${baseParcel}`);
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

  socket.onopen = (ev) => {
    log("connected to web socket");
    socket.send(JSON.stringify({ action: "init" }));
  };

  socket.onclose = function (event) {
    log("socket closed");
  };

  socket.onmessage = function (event) {
    const message = JSON.parse(event.data);
    log(`received message to ${message.action} ${message.entity || ""} ${message.property || ""}`);
    switch (message.action) {
      case "init":
        initScene(message.sceneData);
        break;
      case "create":
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
      createImage(message.sceneData.imageTextures);
      break;
    case "videoScreen":
      createVideoScreen(message.sceneData.videoSystems);
      break;
    case "audioStream":
      createAudioStream(message.sceneData.audioStreams);
      break;
    case "dialog":
      createDialog(message.sceneData.dialogs);
      break;
  }
};

const updateEntity = (message: any) => {
  switch (message.entity) {
    case "image":
      updateImage(message.sceneData.imageTextures, message.property, message.id);
      break;
    case "videoScreen":
      updateVideoScreen(message.sceneData.videoSystems, message.property);
      break;
    case "audioStream":
      updateAudioStream(message.sceneData.audioStreams, message.property);
      break;
    case "dialog":
      updateDialog(message.sceneData.dialogs, message.property);
      break;
  }
};

const removeEntity = (message: any) => {
  switch (message.entity) {
    case "image":
      removeImage(message.sceneData.imageTextures, message.property);
      break;
    case "videoScreen":
      removeVideoScreen(message.sceneData.videoSystems, message.property);
      break;
    case "audioStream":
      removeAudioStream(message.sceneData.audioStreams, message.property);
      break;
    case "dialog":
      removeDialog(message.sceneData.dialogs, message.property);
      break;
  }
};


