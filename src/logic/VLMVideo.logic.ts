import { VLMVideo } from "../components/VLMVideo.component";

export abstract class VLMVideoManager {
  static init: CallableFunction = (videoScreens: VLMVideo.VLMConfig[]) => {
    try {
      if (!videoScreens) {
        return;
      }
      videoScreens.forEach((videoScreen: VLMVideo.VLMConfig) => {
        const existing = VLMVideo.configs[videoScreen.sk];
        if (existing) {
          existing.delete();
        }
        this.create(videoScreen);

      });
    } catch (error) {
      throw error;
    }
  };

  static create: CallableFunction = (config: VLMVideo.VLMConfig) => {
    try {
      if (!config.enabled) {
        return;
      }
      new VLMVideo.DCLConfig(config);
    } catch (error) {
      throw error;
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
      throw error;
    }
  };

  static update: CallableFunction = (config: VLMVideo.VLMConfig, property: string, id: string) => {
    try {
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
        case "liveSrc":
          video.liveSrc = config.liveSrc;
          break;
        case "enableLiveStream":
          video.updateOnAirState(config.enableLiveStream);
          break;
        case "playlist":
          video.updatePlaylist(config.playlist);
          break;
        case "volume":
          video.updateVolume(config.volume);
          break;
        case "emission":
          video.emissiveIntensity = config.emission || 0;
          break;
        case "offType":
          video.updateOffType(config.offType);
          break;
        case "clickEvent":
          video.updateClickEvent(config.clickEvent);
          break;
        case "properties":
          video.updateParent(config.parent);
          video.updateCustomId(config.customId);
          video.updateCustomRendering(config.customRendering);
        case "offImageSrc":
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
    } catch (error) {
      throw error;
    }
  };

  static updateInstance: CallableFunction = (instanceConfig: VLMVideo.VLMInstanceConfig, property: string, id: string) => {
    try {
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
        case "clickEvent":
          instance.updateClickEvent(instanceConfig.clickEvent);
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
    } catch (error) {
      throw error;
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

  static removeInstance: CallableFunction = (instanceId: string, configId?: string) => {
    const configIdA = configId || VLMVideo.instances[instanceId].configId;
    VLMVideo.configs[configIdA].removeInstance(instanceId);
  };

  static deleteInstance: CallableFunction = (instanceId: string, configId?: string) => {
    const configIdA = configId || VLMVideo.instances[instanceId].configId;
    VLMVideo.configs[configIdA].deleteInstance(instanceId);
  };
}
