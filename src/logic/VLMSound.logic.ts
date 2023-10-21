import { VLMSound } from "../components/VLMSound.component";

export abstract class VLMSoundManager {
  static init: CallableFunction = (sounds: VLMSound.VLMConfig[]) => {
    if (!sounds) {
      return;
    }
    sounds.forEach((sound: VLMSound.VLMConfig) => {
      new VLMSound.DCLConfig(sound);
    });
  };

  static create: CallableFunction = (config: VLMSound.VLMConfig) => {
    try {
      if (!config.enabled) {
        return;
      }
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

  static update: CallableFunction = (soundConfig: VLMSound.VLMConfig | any, property: string, id: string) => {
    const sound: VLMSound.DCLConfig = VLMSound.configs[soundConfig.sk];

    if (!soundConfig || (!sound && !soundConfig.enabled)) {
      return;
    } else if (!sound && soundConfig.enabled) {
      new VLMSound.DCLConfig(soundConfig);
    }

    switch (property) {
      case "enabled":
        if (!soundConfig.enabled) {
          this.remove(soundConfig.sk);
        } else if (sound) {
          this.add(soundConfig.sk);
        }
        break;
      case "sourceType":
        sound.updateSourceType(soundConfig.sourceType);
        break;
      case "audioSrc":
        sound.updateSource(soundConfig.audioSrc);
        break;
      case "volume":
        sound.updateVolume(soundConfig.volume);
        break;
      case "properties":
        sound.updateParent(soundConfig.parent);
        sound.updateCustomId(soundConfig.customId);
        sound.updateCustomRendering(soundConfig.customRendering);
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
