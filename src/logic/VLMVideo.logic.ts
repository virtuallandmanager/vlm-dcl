import { VLMVideo } from "../components/VLMVideo.component";

export abstract class VLMVideoManager {
  static init: CallableFunction = (videoScreens: VLMVideo.VLMConfig[]) => {
    try {
      if (!videoScreens) {
        return;
      }
      videoScreens.forEach((videoScreen: VLMVideo.VLMConfig) => {
        const existing = VLMVideo.configs[videoScreen?.sk];
        if (existing) {
          existing.init();
        } else {
          this.create(videoScreen);
        }

      });
    } catch (error) {
      throw error;
    }
  };

  static create: CallableFunction = (config: VLMVideo.VLMConfig) => {
    try {
      new VLMVideo.DCLConfig(config);
    } catch (error) {
      throw error;
    }
  };

  static createInstance: CallableFunction = (config: VLMVideo.DCLConfig, instance: VLMVideo.VLMConfig) => {
    try {
      const videoId = config.sk;
      VLMVideo.configs[videoId].createInstance(instance);
    } catch (error) {
      throw error;
    }
  };

  static update: CallableFunction = (config: VLMVideo.VLMConfig, property: string, id: string) => {
    try {
      const storedConfig: VLMVideo.DCLConfig = VLMVideo.configs[config.sk];

      if (!config || (!storedConfig && !config.enabled)) {
        return;
      } else if (!storedConfig && config.enabled) {
        this.create(config)
        return this.update(config, property, id);
      }

      switch (property) {
        case "enabled":
          if (!config.enabled) {
            this.remove(config?.sk);
          } else if (storedConfig) {
            this.add(config?.sk);
          }
          break;
        case "liveSrc":
          storedConfig.liveSrc = config.liveSrc;
          break;
        case "enableLiveStream":
          console.log("enableLiveStream", config.enableLiveStream, config);
          storedConfig.updateOnAirState(config.enableLiveStream);
          break;
        case "playlist":
          storedConfig.updatePlaylist(config.playlist);
          break;
        case "volume":
          storedConfig.updateVolume(config.volume);
          break;
        case "emission":
          storedConfig.emissiveIntensity = config.emission || 0;
          break;
        case "offType":
          storedConfig.updateOffType(config.offType);
          break;
        case "clickEvent":
          storedConfig.updateClickEvent(config.clickEvent);
          break;
        case "properties":
          storedConfig.updateParent(config.parent);
          storedConfig.updateCustomId(config.customId);
          storedConfig.updateCustomRendering(config.customRendering);
        case "offImageSrc":
          storedConfig.updateOffImage(config.offImageSrc);
          break;
        case "parent":
          storedConfig.updateParent(config.parent);
          break;
        case "customId":
          storedConfig.updateCustomId(config.customId);
          break;
        case "customRendering":
          storedConfig.updateCustomRendering(config.customRendering);
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
          instance.updateCollider(instanceConfig.withCollisions);
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
    VLMVideo.systems[id].kill();
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
