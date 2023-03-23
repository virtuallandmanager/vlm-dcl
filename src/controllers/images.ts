import { StoredImageMaterial } from "../classes/index";
import { imageInstances, imageMaterials } from "../storage";
import { TImageInstanceConfig, TImageMaterialConfig } from "../types/index";

export abstract class VLMImages {
  static init: CallableFunction = (images: Array<TImageMaterialConfig>) => {
    if (!images) {
      return;
    }
    images.forEach((image: TImageMaterialConfig) => {
      this.create(image);
    });
  };

  static create: CallableFunction = (imageConfig: TImageMaterialConfig) => {
    if (!imageConfig.show) {
      return;
    }
    new StoredImageMaterial(imageConfig);
  };

  static createInstance: CallableFunction = (
    material: TImageMaterialConfig,
    instance: TImageInstanceConfig
  ) => {
    if (!material.show || !instance.show) {
      return;
    }
    const imageId = material.id;
    imageMaterials[imageId].createInstance(instance);
  };

  static update: CallableFunction = (
    imageConfig: TImageMaterialConfig | any,
    property: string,
    id: string
  ) => {
    const image: StoredImageMaterial = imageMaterials[imageConfig.id];

    if (!imageConfig || (!image && !imageConfig.show)) {
      return;
    } else if (!image && imageConfig.show) {
      new StoredImageMaterial(imageConfig);
    }

    switch (property) {
      case "visibility":
        if (!imageConfig.show) {
          this.remove(imageConfig.id);
        } else if (image) {
          this.add(imageConfig.id);
        }
        break;
      case "imageLink":
        image.updateTexture(imageConfig.imageLink);
        break;
      case "emission":
        image.emissiveIntensity = imageConfig.emission;
        break;
      case "clickEvent":
        image.updateClickEvent(imageConfig.clickEvent);
        break;
      case "properties":
        image.updateTransparency(imageConfig.isTransparent);
        image.updateParent(imageConfig.parent);
        image.updateCustomId(imageConfig.customId);
        break;
    }
  };

  static updateInstance: CallableFunction = (
    instanceConfig: TImageInstanceConfig,
    property: string,
    id: string
  ) => {
    const instance = imageInstances[id],
      materialId = instance.materialId,
      material = imageMaterials[materialId];

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
      case "clickEvent":
        instance.updateClickEvent(instanceConfig.clickEvent);
        break;
      case "properties":
        instance.updateCollider(instanceConfig);
        instance.updateParent(instanceConfig.parent);
        instance.updateCustomId(instanceConfig.customId);
        break;
    }
  };

  static add: CallableFunction = (id: string) => {
    imageMaterials[id].showAll();
  };

  static delete: CallableFunction = (id: string) => {
    imageMaterials[id].delete();
  };

  static remove: CallableFunction = (id: string) => {
    imageMaterials[id].remove();
  };

  static removeInstance: CallableFunction = (instanceId: string) => {
    const materialId = imageInstances[instanceId].materialId;
    imageMaterials[materialId].removeInstance(instanceId);
  };

  static deleteInstance: CallableFunction = (instanceId: string) => {
    const materialId = imageInstances[instanceId].materialId;
    imageMaterials[materialId].deleteInstance(instanceId);
  };
}
