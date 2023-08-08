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

  static create: CallableFunction = (soundConfig: VLMSound.VLMConfig) => {
    try {
      log("VLM - Creating Sound");
      if (!soundConfig.enabled) {
        return;
      }
      new VLMSound.DCLConfig(soundConfig);
    } catch (error) {
      log(error);
      log("VLM - Error creating sound");
    }
  };

  static createInstance: CallableFunction = (source: VLMSound.VLMConfig, instance: VLMSound.VLMInstanceConfig) => {
    if (!source.enabled || !instance.enabled) {
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
      case "audioPath":
        sound.updateSource(soundConfig.soundLink);
        break;
      case "properties":
        sound.updateParent(soundConfig.parent);
        sound.updateCustomId(soundConfig.customId);
        break;
    }
  };

  static updateInstance: CallableFunction = (instanceConfig: VLMSound.VLMInstanceConfig, property: string, id: string) => {
    const instance = VLMSound.instances[id],
      configId = instance.configId,
      material = VLMSound.configs[configId];

    if (!material) {
      return;
    } else if (!instance && instanceConfig.enabled) {
      material.createInstance(instanceConfig);
    }

    const { position, scale, rotation } = instanceConfig;

    switch (property) {
      case "enabled":
        if (!material.enabled || !instanceConfig.enabled) {
          material.removeInstance(instanceConfig.sk);
        } else if (instance && instanceConfig.enabled) {
          material.addInstance(instanceConfig.sk);
        }
        break;
      case "transform":
        instance.updateTransform(position, scale, rotation);
        break;
      case "properties":
        instance.updateParent(instanceConfig.parent);
        instance.updateCustomId(instanceConfig.customId);
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
