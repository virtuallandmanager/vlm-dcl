import { VLMSound } from "../components/VLMSound.component";

export abstract class VLMSoundManager {
  static init: CallableFunction = (sounds: VLMSound.VLMConfig[]) => {
    if (!sounds) {
      return;
    }
    sounds.forEach((sound: VLMSound.VLMConfig) => {
      this.create(sound);
    });
  };

  static create: CallableFunction = (config: VLMSound.VLMConfig) => {
    try {
      new VLMSound.DCLConfig(config);
    } catch (error) {
      throw error;
    }
  };

  static createInstance: CallableFunction = (source: VLMSound.VLMConfig, instance: VLMSound.VLMInstanceConfig) => {
    if (!source?.enabled || !instance?.enabled) {
      return;
    }
    const soundId = source.sk;
    VLMSound.configs[soundId].createInstance(instance);
  };

  static update: CallableFunction = (config: VLMSound.VLMConfig | any, property: string, id: string) => {
    const storedConfig: VLMSound.DCLConfig = VLMSound.configs[config.sk];

    if (!config || (!storedConfig && !config.enabled)) {
      return;
    } else if (!storedConfig && config.enabled) {
      this.create(config)
      return this.update(config, property, id);
    }

    switch (property) {
      case "enabled":
        if (!config.enabled) {
          this.remove(config.sk);
        } else if (storedConfig) {
          this.add(config.sk);
        }
        break;
      case "sourceType":
        storedConfig.updateSourceType(config.sourceType);
        break;
      case "audioSrc":
        storedConfig.updateSource(config.audioSrc);
        break;
      case "volume":
        storedConfig.updateVolume(config.volume);
        break;
      case "properties":
        storedConfig.updateParent(config.parent);
        storedConfig.updateCustomId(config.customId);
        storedConfig.updateCustomRendering(config.customRendering);
        break;
    }
  };

  static updateInstance: CallableFunction = (instanceConfig: VLMSound.VLMInstanceConfig, property: string, id: string) => {
    const instance = VLMSound.instances[instanceConfig.sk],
      configId = instance?.configId,
      config = VLMSound.configs[configId];
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
        instance.updateParent(instanceConfig.parent);
        instance.updateCustomId(instanceConfig.customId);
        instance.updateCustomRendering(instanceConfig.customRendering);
        break;
    }
  };

  static add: CallableFunction = (id: string) => {
    VLMSound.configs[id].showAll();
  };

  static delete: CallableFunction = (id: string) => {
    VLMSound.configs[id].delete();
  };

  static remove: CallableFunction = (id: string) => {
    VLMSound.configs[id].remove();
  };

  static removeInstance: CallableFunction = (instanceId: string) => {
    const configId = VLMSound.instances[instanceId].configId;
    VLMSound.configs[configId].removeInstance(instanceId);
  };

  static deleteInstance: CallableFunction = (instanceId: string) => {
    const configId = VLMSound.instances[instanceId].configId;
    VLMSound.configs[configId].deleteInstance(instanceId);
  };
}
