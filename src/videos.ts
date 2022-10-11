import { StoredVideoCheckSystem, StoredVideoMaterial } from "./classes";
import { videoInstances, videoMaterials, videoSystems } from "./storage";
import { TVideoInstanceConfig, TVideoMaterialConfig } from "./types";

export const initVideoScreens = (videoScreens: Array<TVideoMaterialConfig>) => {
  if (!videoScreens) {
    return;
  }
  videoScreens.forEach((videoScreen: TVideoMaterialConfig) => {
    createVideoScreen(videoScreen);
  });
};

export const createVideoScreen = (videoConfig: TVideoMaterialConfig) => {
  if (!videoConfig.show) {
    return;
  }

  const videoId = videoConfig.id;

  new StoredVideoMaterial(videoConfig);
  new StoredVideoCheckSystem(videoMaterials[videoId]);

  engine.addSystem(videoSystems[videoId]);
};

export const createVideoInstance = (material: StoredVideoMaterial, instance: TVideoInstanceConfig) => {
  if (!material.show || !instance.show) {
    return;
  }
  const videoId = material.id;
  videoMaterials[videoId].createInstance(instance);
};

export const updateVideoScreen = (videoConfig: TVideoMaterialConfig, property: string, id: string) => {
  const video: StoredVideoMaterial = videoMaterials[videoConfig.id];

  if (!videoConfig || (!video && !videoConfig.show)) {
    return;
  } else if (!video && videoConfig.show) {
    new StoredVideoMaterial(videoConfig);
  }

  switch (property) {
    case "visibility":
      if (!videoConfig.show) {
        removeVideoScreen(videoConfig.id);
      } else if (video) {
        addVideoScreen(videoConfig.id);
      }
      break;
    case "liveLink":
      video.liveLink = videoConfig.liveLink;
      break;
    case "enableLiveStream":
      video.enableLiveStream = videoConfig.enableLiveStream;
      break;
    case "playlist":
      video.updatePlaylist(videoConfig.playlist);
      break;
    case "volume":
      video.updateVolume(videoConfig.volume);
      break;
    case "emission":
      video.emissiveIntensity = videoConfig.emission;
      break;
    case "offType":
      video.offType = videoConfig.offType;
      break;
    case "offImage":
      video.updateOffImage(videoConfig.offImage);
      break;
    case "properties":
      video.updateParent(videoConfig.parent);
      video.updateCustomId(videoConfig.customId);
      break;
  }
};

export const updateVideoInstance = (instanceConfig: TVideoInstanceConfig, property: string, id: string) => {
  const instance = videoInstances[id],
    materialId = instance.materialId,
    material = videoMaterials[materialId];

  if (!material) {
    return;
  } else if (!instance && instanceConfig.show) {
    material.createInstance(instanceConfig);
  }

  const { position, scale, rotation } = instanceConfig;

  switch (property) {
    case "visibility":
      if (!material.show || !instanceConfig.show) {
        material.removeInstance(instanceConfig.id);
      } else if (instance && instanceConfig.show) {
        material.addInstance(instanceConfig.id);
      }
      break;
    case "transform":
      instance.updateTransform(position, scale, rotation);
      break;
    case "collider":
      instance.updateCollider(instanceConfig.withCollisions);
      break;
    case "parent":
      instance.updateParent(instanceConfig.parent);
      break;
    case "customId":
      instance.updateCustomId(instanceConfig.customId);
      break;
  }
};
export const addVideoScreen = (id: string) => {
  videoMaterials[id].showAll();
};
export const removeVideoScreen = (id: string) => {
  videoMaterials[id].remove();
};
export const deleteVideoScreen = (id: string) => {
  videoMaterials[id].delete();
};

export const removeVideoInstance = (instanceId: string) => {
  const materialId = videoInstances[instanceId].materialId;
  videoMaterials[materialId].removeInstance(instanceId);
};

export const deleteVideoInstance = (instanceId: string) => {
  const materialId = videoInstances[instanceId].materialId;
  videoMaterials[materialId].deleteInstance(instanceId);
};
