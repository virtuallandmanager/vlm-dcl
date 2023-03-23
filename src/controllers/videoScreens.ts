import { StoredVideoMaterial } from "../classes/index";
import { TVideoInstanceConfig, TVideoMaterialConfig } from "../types/index";
import { videoInstances, videoMaterials } from "../storage";

export abstract class VLMVideoScreens {
  static init: CallableFunction = (
    videoScreens: Array<TVideoMaterialConfig>
  ) => {
    if (!videoScreens) {
      return;
    }
    videoScreens.forEach((videoScreen: TVideoMaterialConfig) => {
      this.create(videoScreen);
    });
  };

  static create: CallableFunction = (videoConfig: TVideoMaterialConfig) => {
    if (!videoConfig.show) {
      return;
    }
    new StoredVideoMaterial(videoConfig);
  };

  static createInstance: CallableFunction = (
    material: StoredVideoMaterial,
    instance: TVideoInstanceConfig
  ) => {
    if (!material.show || !instance.show) {
      return;
    }
    const videoId = material.id;
    videoMaterials[videoId].createInstance(instance);
  };

  static update: CallableFunction = (
    videoConfig: TVideoMaterialConfig,
    property: string,
    id: string
  ) => {
    const video: StoredVideoMaterial = videoMaterials[videoConfig.id];

    if (!videoConfig || (!video && !videoConfig.show)) {
      return;
    } else if (!video && videoConfig.show) {
      new StoredVideoMaterial(videoConfig);
    }

    switch (property) {
      case "visibility":
        if (!videoConfig.show) {
          this.remove(videoConfig.id);
        } else if (video) {
          this.add(videoConfig.id);
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
        video.updateOffImage(videoConfig.offImageLink);
        break;
      case "properties":
        video.updateParent(videoConfig.parent);
        video.updateCustomId(videoConfig.customId);
        break;
    }
  };

  static updateInstance: CallableFunction = (
    instanceConfig: TVideoInstanceConfig,
    property: string,
    id: string
  ) => {
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
  static add: CallableFunction = (id: string) => {
    videoMaterials[id].showAll();
  };
  static remove: CallableFunction = (id: string) => {
    videoMaterials[id].remove();
  };
  static delete: CallableFunction = (id: string) => {
    videoMaterials[id].delete();
  };

  static removeInstance: CallableFunction = (instanceId: string) => {
    const materialId = videoInstances[instanceId].materialId;
    videoMaterials[materialId].removeInstance(instanceId);
  };

  static deleteInstance: CallableFunction = (instanceId: string) => {
    const materialId = videoInstances[instanceId].materialId;
    videoMaterials[materialId].deleteInstance(instanceId);
  };
}
