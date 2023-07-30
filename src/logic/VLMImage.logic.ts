import { VLMImage  } from "../components/VLMImage.component";

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
      log(error);
      throw error;
    }
  };

  static create: CallableFunction = (imageConfig: VLMImage.VLMConfig) => {
    try {
      if (!imageConfig.enabled) {
        return;
      }
      log("VLM: Creating Image");
      new VLMImage.DCLConfig(imageConfig);
    } catch (error) {
      log(error);
      throw error;
    }
  };

  static createInstance: CallableFunction = (config: VLMImage.VLMConfig, instance: VLMImage.VLMInstanceConfig) => {
    log("VLM: Creating Image Instance");

    if (!config.enabled || !instance.enabled) {
      return;
    }
    const imageId = config.sk;
    VLMImage.configs[imageId].createInstance(instance);
  };

  static update: CallableFunction = (imageConfig: VLMImage.VLMConfig | any, property: string, id: string) => {
    const image: VLMImage.DCLConfig = VLMImage.configs[imageConfig.sk || id];

    if (!imageConfig || (!image && !imageConfig.enabled)) {
      return;
    } else if (!image && imageConfig.enabled) {
      new VLMImage.DCLConfig(imageConfig);
    }

    switch (property) {
      case "enabled":
        if (!imageConfig.enabled) {
          this.remove(imageConfig.sk);
        } else if (image) {
          this.add(imageConfig.sk);
        }
        break;
      case "imageSrc":
        image.updateTexture(imageConfig.imageSrc);
        break;
      case "emission":
        image.emissiveIntensity = imageConfig.emission;
        break;
      case "clickEvent":
        image.updateClickEvent(imageConfig.clickEvent);
        break;
      case "transparency":
        image.updateTransparency(imageConfig.isTransparent);
        break;
      case "parent":
        image.updateParent(imageConfig.parent);
        break;
      case "customId":
        image.updateCustomId(imageConfig.customId);
        break;
    }
  };

  static updateInstance: CallableFunction = (instanceConfig: VLMImage.VLMInstanceConfig, property: string, id: string) => {
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
        instance.updateCollider(instanceConfig);
        instance.updateParent(instanceConfig.parent);
        instance.updateCustomId(instanceConfig.customId);
        instance.updateCustomRendering(instanceConfig.customRendering);
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
    const configId = VLMImage.instances[instanceId].configId;
    VLMImage.configs[configId].removeInstance(instanceId);
  };

  static deleteInstance: CallableFunction = (instanceId: string) => {
    const configId = VLMImage.instances[instanceId].configId;
    VLMImage.configs[configId].deleteInstance(instanceId);
  };
}
