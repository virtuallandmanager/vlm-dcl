import { StoredImageMaterial } from "./classes/index";
import { imageInstances, imageMaterials } from "./storage";
import { TImageInstanceConfig, TImageMaterialConfig } from "./types/index";

export const initImages = (imageScreens: Array<TImageMaterialConfig>) => {
  imageScreens.forEach((imageScreen: TImageMaterialConfig) => {
    createImage(imageScreen);
  });
};

export const createImage = (imageConfig: TImageMaterialConfig) => {
  if (!imageConfig.show) {
    return;
  }
  new StoredImageMaterial(imageConfig);
};

export const createImageInstance = (material: TImageMaterialConfig, instance: TImageInstanceConfig) => {
  if (!material.show || !instance.show) {
    return;
  }
  const imageId = material.id;
  imageMaterials[imageId].createInstance(instance);
};

export const updateImage = (imageConfig: TImageMaterialConfig | any, property: string, id: string) => {
  const image: StoredImageMaterial = imageMaterials[imageConfig.id];

  if (!imageConfig || (!image && !imageConfig.show)) {
    return;
  } else if (!image && imageConfig.show) {
    new StoredImageMaterial(imageConfig);
  }

  switch (property) {
    case "visibility":
      if (!imageConfig.show) {
        removeImage(imageConfig.id);
      } else if (image) {
        addImage(imageConfig.id);
      }
      break;
    case "imageLink":
      image.updateTexture(imageConfig.imageLink);
      break;
    case "emission":
      image.emissiveIntensity = imageConfig.emission;
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

export const updateImageInstance = (instanceConfig: TImageInstanceConfig, property: string, id: string) => {
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
    case "collider":
      instance.updateCollider(instanceConfig);
      break;
    case "parent":
      instance.updateParent(instanceConfig.parent);
      break;
    case "customId":
      instance.updateCustomId(instanceConfig.customId);
      break;
  }
};

export const addImage = (id: string) => {
  imageMaterials[id].showAll();
};

export const deleteImage = (id: string) => {
  imageMaterials[id].delete();
};

export const removeImage = (id: string) => {
  imageMaterials[id].remove();
};

export const removeImageInstance = (instanceId: string) => {
  const materialId = imageInstances[instanceId].materialId;
  imageMaterials[materialId].removeInstance(instanceId);
};

export const deleteImageInstance = (instanceId: string) => {
  const materialId = imageInstances[instanceId].materialId;
  imageMaterials[materialId].deleteInstance(instanceId);
};
