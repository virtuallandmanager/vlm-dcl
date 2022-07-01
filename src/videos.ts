import { StoredVideoScreen } from "./classes/StoredVideoScreen";
import { getId, getEntityByName } from "./helpers/entity";
import { TVideoStorage } from "./types/Storage";
import { TVideoScreen, TVideoScreenInstance } from "./types/VideoScreen";

export let videoSystems: TVideoStorage = {};

export const initVideoScreens = (videoScreens: Array<TVideoScreen>) => {
  videoScreens.forEach((videoScreen: TVideoScreen) => {
    createVideoScreen(videoScreen);
  });
};

export const createVideoScreen = (videoConfig: TVideoScreen) => {
  if (!videoConfig.show) {
    return;
  }

  const videoId = getId(videoConfig);

  log("creating new video screen", videoId);

  videoSystems[videoId] = new StoredVideoScreen({
    ...videoConfig
  });

  videoConfig.instances.forEach((instance: TVideoScreenInstance) => {
    if (!instance.customRendering && !videoConfig.customRendering) {
      createVideoInstance(videoConfig, instance);
    }
  });


  videoSystems[videoId].start(videoConfig.volume);
  videoSystems[videoId].setVolume(videoConfig.volume);
};

export const createVideoInstance = (videoConfig: any, instance: any) => {
  if (!instance.show) {
    return;
  }
  const videoId = getId(videoConfig),
    instanceId = getId(instance),
    videoInstance = new Entity(instance.name),
    { position, scale, rotation } = instance;

  videoInstance.addComponent(new PlaneShape());
  videoInstance.addComponent(
    new Transform({
      position: new Vector3(position.x, position.y, position.z),
      rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z),
      scale: new Vector3(scale.x, scale.y, scale.z)
    })
  );
  videoInstance.addComponent(videoSystems[videoId].material);

  videoSystems[videoId][instanceId] = videoInstance;

  if (videoConfig.customRendering) {
    return;
  } else if (videoConfig.parent) {
    const screenParent = getEntityByName(videoConfig.parent);
    videoInstance.setParent(screenParent);
  } else {
    engine.addEntity(videoInstance);
  }
};

export const updateVideoScreen = (videoConfigs: any, property: string, id: string) => {
  const video = videoConfigs.find((videoConfig: any) => videoConfig.id == id),
    videoId = getId(video);

  switch (property) {
    case "visibility":
      if (!video.show) {
        removeVideoScreen(videoConfigs, videoId);
      } else {
        createVideoScreen(video);
      }
      break;
    case "liveLink":
      videoSystems[videoId].data.liveLink = video.liveLink;
      break;
    case "volume":
      videoSystems[videoId].setVolume(video.volume);
      break;
    case "emission":
      videoSystems[videoId].material.emissiveIntensity = video.emission;
      break;
    case "offType":
      videoSystems[videoId].data.offType = video.offType;
      break;
    case "offImage":
      videoSystems[videoId].data.offImage = video.offImage;
      break;
  }
};

export const updateVideoInstance = (videoConfigs: any, property: string, id: string) => {
  let instance: any;
  const video = videoConfigs.find((videoConfig: any) => {
      if (videoConfig.instances) {
        instance = videoConfig.instances.find((instance: any) => getId(instance) == id);
        return instance;
      }
    }),
    videoId = getId(video),
    instanceId = getId(instance);

  if (!instance) {
    return;
  }
  const { position, scale, rotation } = instance;

  switch (property) {
    case "visibility":
      if (!instance.show) {
        removeVideoInstance(videoId, instanceId);
      } else {
        createVideoInstance(video, instance);
      }
      break;
    case "transform":
      videoSystems[videoId][instanceId].addComponentOrReplace(
        new Transform({
          position: new Vector3(position.x, position.y, position.z),
          rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z),
          scale: new Vector3(scale.x, scale.y, scale.z)
        })
      );
      break;
    case "properties":
      if (instance.customRendering) {
        return;
      } else if (instance.parent) {
        const screenParent = getEntityByName(instance.parent);
        instance.setParent(screenParent);
      } else {
        engine.addEntity(instance);
      }
  }
};

export const removeVideoScreen = (videoConfigs: any, id: string) => {
  videoSystems[id].stop();
  const video = videoConfigs.find((videoConfig: any) => getId(videoConfig) == id);
  video.instances.forEach((instance: any) => {
    const instanceId = getId(instance);
    engine.removeEntity(videoSystems[id][instanceId]);
  });
};

export const removeVideoInstance = (videoId: string, instanceId: string) => {
  engine.removeEntity(videoSystems[videoId][instanceId]);
};
