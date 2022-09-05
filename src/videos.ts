import { StoredVideoCheckSystem, StoredVideoInstance, StoredVideoMaterial } from "./classes/index";
import { getId, getEntityByName } from "./helpers/entity";
import { videoInstances, videoMaterials, videoSystems } from "./storage";
import { TVideoInstanceConfig, TVideoMaterialConfig } from "./types/index";

export const initVideoScreens = (videoScreens: Array<TVideoMaterialConfig>) => {
  videoScreens.forEach((videoScreen: TVideoMaterialConfig) => {
    createVideoScreen(videoScreen);
  });
};

export const createVideoScreen = (videoConfig: TVideoMaterialConfig) => {
  if (!videoConfig.show) {
    return;
  }

  const videoId = getId(videoConfig);

  videoMaterials[videoId] = new StoredVideoMaterial(videoConfig);
  videoMaterials[videoId].updateTexture(videoMaterials[videoId].liveLink);

  videoConfig.instances.forEach((instance: TVideoInstanceConfig) => {
    const material = videoMaterials[videoId];
    if (!instance.customRendering && !material.customRendering) {
      createVideoInstance(material, instance);
    }
  });

  videoSystems[videoId] = new StoredVideoCheckSystem(videoMaterials[videoId]);

  engine.addSystem(videoSystems[videoId]);
};

export const createVideoInstance = (material: StoredVideoMaterial, instance: TVideoInstanceConfig) => {
  if (!material.show || !instance.show) {
    return;
  }
  const videoId = getId(material);
  videoMaterials[videoId].createInstance(instance);
};

export const updateVideoScreen = (videoConfigs: TVideoMaterialConfig[], property: string, id: string) => {
  const videoConfig: TVideoMaterialConfig | undefined = videoConfigs.find((videoConfig: TVideoMaterialConfig) => videoConfig.id == id),
    video: StoredVideoMaterial = videoMaterials[id];

  if (!videoConfig) {
    return;
  }

  switch (property) {
    case "visibility":
      if (!video.show) {
        removeVideoScreen(video.id);
      } else {
        new StoredVideoMaterial(videoConfig);
      }
      break;
    case "liveLink":
      video.liveLink = videoConfig.liveLink;
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
      video.offImage = videoConfig.offImage;
      break;
    case "parent":
      video.updateParent(videoConfig.parent);
      break;
  }
};

export const updateVideoInstance = (videoConfigs: TVideoMaterialConfig[], property: string, id: string) => {
  const materialId: string | undefined = Object.keys(videoMaterials).find((materialId: string) => {
      return videoMaterials[materialId].instanceIds.includes(id);
    }),
    material = materialId && videoMaterials[materialId],
    instance = videoInstances[id],
    instanceId = getId(instance);

  if (!material || !instance) {
    return;
  }
  const { position, scale, rotation } = instance;

  switch (property) {
    case "visibility":
      if (!material.show || !instance.show) {
        material.removeInstance(instanceId);
      } else {
        material.createInstance(instanceId);
      }
      break;
    case "transform":
      instance.updateTransform(position, scale, rotation);
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

export const removeVideoScreen = (id: string) => {
  videoMaterials[id].remove();
};

export const removeVideoInstance = (instanceId: string) => {
  engine.removeEntity(videoInstances[instanceId]);
};
