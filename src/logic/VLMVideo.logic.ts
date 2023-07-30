import { VLMVideo } from "src/components/VLMVideo.component";

export abstract class VLMVideoManager {
  static init: CallableFunction = (videoScreens: VLMVideo.VLMConfig[]) => {
    try {
      if (!videoScreens) {
        return;
      }
      videoScreens.forEach((videoScreen: VLMVideo.VLMConfig) => {
        this.create(videoScreen);
      });
    } catch (error) {
      log(error);
    }
  };

  static create: CallableFunction = (config: VLMVideo.VLMConfig) => {
    try {
      log("VLM: Creating Video Screen");
      if (!config.enabled) {
        return;
      }
      new VLMVideo.DCLConfig(config);
    } catch (error) {
      log(error);
    }
  };

  static createInstance: CallableFunction = (config: VLMVideo.DCLConfig, instance: VLMVideo.VLMConfig) => {
    try {
      if (!config.enabled || !instance.enabled) {
        return;
      }
      const videoId = config.sk;
      VLMVideo.configs[videoId].createInstance(instance);
    } catch (error) {
      log(error);
    }
  };

  static update: CallableFunction = (config: VLMVideo.VLMConfig, property: string, id: string) => {
    const video: VLMVideo.DCLConfig = VLMVideo.configs[id || config.sk];

    if (!config || (!video && !config.enabled)) {
      return;
    } else if (!video && config.enabled) {
      new VLMVideo.DCLConfig(config);
    }

    switch (property) {
      case "enabled":
        if (!config.enabled) {
          this.remove(config.sk);
        } else if (video) {
          this.add(config.sk);
        }
        break;
      case "liveLink":
        video.liveLink = config.liveLink;
        break;
      case "enableLiveStream":
        video.enableLiveStream = config.enableLiveStream;
        break;
      case "playlist":
        video.updatePlaylist(config.playlist);
        break;
      case "volume":
        video.updateVolume(config.volume);
        break;
      case "emission":
        video.emissiveIntensity = config.emission;
        break;
      case "offType":
        video.offType = config.offType;
        break;
      case "properties":
        video.updateParent(config.parent);
        video.updateCustomId(config.customId);
        video.updateCustomRendering(config.customRendering);
      case "offImage":
        video.updateOffImage(config.offImageSrc);
        break;
      case "parent":
        video.updateParent(config.parent);
        break;
      case "customId":
        video.updateCustomId(config.customId);
        break;
      case "customRendering":
        video.updateCustomRendering(config.customRendering);
        break;
    }
  };

  static updateInstance: CallableFunction = (instanceConfig: VLMVideo.VLMInstanceConfig, property: string, id: string) => {
    const instance = VLMVideo.instances[instanceConfig?.sk] || VLMVideo.instances[id],
      configId = instance.configId,
      config = VLMVideo.configs[configId];

    if (!config) {
      return;
    } else if (!instance && instanceConfig.enabled) {
      config.createInstance(instanceConfig);
    }

    const { position, scale, rotation } = instanceConfig;

    switch (property) {
      case "enabled":
        if (!config.enabled || !instanceConfig.enabled) {
          config.removeInstance(instanceConfig.sk);
        } else if (instance && instanceConfig.enabled) {
          config.addInstance(instanceConfig.sk);
        }
        break;
      case "transform":
        instance.updateTransform(position, scale, rotation);
        break;
      case "properties":
        instance.updateCollider(instanceConfig);
        instance.updateParent(instanceConfig.parent);
        instance.updateCustomId(instanceConfig.customId);
        instance.updateCustomRendering(instanceConfig.customRendering);
        break;
      case "withCollider":
        instance.updateCollider(instanceConfig);
        break;
      case "customRendering":
        instance.updateCustomRendering(instanceConfig.customRendering);
        break;
      case "customId":
        instance.updateCustomId(instanceConfig.customId);
        break;
      case "parent":
        instance.updateParent(instanceConfig.parent);
        break;
    }
  };
  static add: CallableFunction = (id: string) => {
    VLMVideo.configs[id].showAll();
  };
  static remove: CallableFunction = (id: string) => {
    VLMVideo.configs[id].remove();
  };
  static delete: CallableFunction = (id: string) => {
    VLMVideo.configs[id].delete();
  };

  static removeInstance: CallableFunction = (instanceId: string) => {
    const configId = VLMVideo.instances[instanceId].configId;
    VLMVideo.configs[configId].removeInstance(instanceId);
  };

  static deleteInstance: CallableFunction = (instanceId: string) => {
    const configId = VLMVideo.instances[instanceId].configId;
    VLMVideo.configs[configId].deleteInstance(instanceId);
  };
}
