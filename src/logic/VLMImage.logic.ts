import { VLMImage } from "../components/VLMImage.component";

export abstract class VLMImageManager {
  static init: CallableFunction = (images: VLMImage.VLMConfig[]) => {
    try {
      if (!images) {
        return;
      }
      images.forEach((image: VLMImage.VLMConfig) => {
        this.create(image);
      });
    } catch (error) {
      throw error;
    }
  };

  static create: CallableFunction = (config: VLMImage.VLMConfig) => {
    try {
      if (!config.enabled) {
        return;
      }
      new VLMImage.DCLConfig(config);
    } catch (error) {
      throw error;
    }
  };

  static createInstance: CallableFunction = (config: VLMImage.VLMConfig, instance: VLMImage.VLMInstanceConfig) => {
    try {
      if (!config.enabled || !instance.enabled) {
        return;
      }
      const imageId = config.sk;
      VLMImage.configs[imageId].createInstance(instance);
    } catch (error) {
      throw error;
    }
  };

  static update: CallableFunction = (config: VLMImage.VLMConfig | any, property: string, id: string) => {
    try {
      const image: VLMImage.DCLConfig = VLMImage.configs[config.sk || id];

      if (!config || (!image && !config.enabled)) {
        return;
      } else if (!image && config.enabled) {
        new VLMImage.DCLConfig(config);
      }

      switch (property) {
        case "enabled":
          if (!config.enabled) {
            this.remove(config.sk);
          } else if (image) {
            this.add(config.sk);
          }
          break;
        case "imageSrc":
          image.updateTexture(config);
          break;
        case "emission":
          image.emissiveIntensity = config.emission;
          break;
        case "clickEvent":
          image.updateClickEvent(config.clickEvent);
          break;
        case "isTransparent":
          image.updateTransparency(config.isTransparent);
          break;
        case "parent":
          image.updateParent(config.parent);
          break;
        case "customId":
          image.updateCustomId(config.customId);
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  static updateInstance: CallableFunction = (instanceConfig: VLMImage.VLMInstanceConfig, property: string, id: string) => {
    try {
      const instance = VLMImage.instances[instanceConfig.sk],
        configId = instance.configId,
        config = VLMImage.configs[configId];

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
        case "clickEvent":
          instance.updateClickEvent(instanceConfig.clickEvent);
          break;
        case "properties":
          instance.updateParent(instanceConfig.parent);
          instance.updateCustomId(instanceConfig.customId);
          instance.updateCustomRendering(instanceConfig.customRendering);
          instance.updateCollider(instanceConfig);
          break;
        case "withCollider":
          instance.updateCollider(instanceConfig);
          break;
        case "customId":
          instance.updateCustomId(instanceConfig.customId);
          break;
        case "customRendering":
          instance.updateCustomRendering(instanceConfig.customRendering);
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
    VLMImage.configs[id].showAll();
  };

  static delete: CallableFunction = (id: string) => {
    VLMImage.configs[id].delete();
  };

  static remove: CallableFunction = (id: string) => {
    VLMImage.configs[id].remove();
  };

  static removeInstance: CallableFunction = (instanceId: string) => {
    VLMImage.instances[instanceId].remove()
  };

  static deleteInstance: CallableFunction = (instanceId: string) => {
    log("VLM - Deleting Instance - Step 1", instanceId)

    const instanceids = Object.keys(VLMImage.instances).map((key) => {
      return key
    })
    const instancenames = Object.keys(VLMImage.instances).map((key) => {
      return VLMImage.instances[key].name
    })
    log(instanceids)
    log(instancenames)

    const instance = VLMImage.instances[instanceId];
    const configId = instance?.configId;

    log("VLM - Deleting Instance - Step 2", instance, instanceId)

    if (configId) {
      log("VLM - Deleting Instance - Step 3", instanceId, configId)
      VLMImage.configs[configId].deleteInstance(instanceId);
    }
  };
}
