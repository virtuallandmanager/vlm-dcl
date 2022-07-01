import { Delay } from "@dcl/ecs-scene-utils";
import { setClickEvent } from "./helpers/clickEvent";
import { getEntityByName, getId } from "./helpers/entity";
import { TEntityInstance } from "./types/Entity";
import { TImage } from "./types/Image";

export let cmsImages: any = {};

export function initImages(imageTextures: Array<any>) {
  log("creating image textures", imageTextures);
  imageTextures.forEach((image: any, i: number) => {
    createImage(image);
  });
}

export function createImage(image: any) {
  const imageId = getId(image);
  createOrUpdateMaterial(image);

  image.instances.forEach((instance: any, ii: number) => {
    const instanceId = getId(instance);
    if ((cmsImages[imageId] && cmsImages[imageId][instanceId]) || instance.customRendering || image.customRendering) {
      return;
    }
    createImageInstance(image, instance);
  });
}

export function createImageInstance(image: any, instance: any) {
  const { position, scale, rotation } = instance,
    imageId = getId(image),
    instanceId = getId(instance);

  cmsImages[imageId][instanceId] = new Entity(image.name + " " + instance.name);
  cmsImages[imageId][instanceId].addComponent(new PlaneShape());
  cmsImages[imageId][instanceId].addComponent(
    new Transform({
      position: new Vector3(position.x, position.y, position.z),
      rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z - 180),
      scale: new Vector3(scale.x, scale.y, scale.z)
    })
  );

  cmsImages[imageId][instanceId].addComponent(cmsImages[imageId].material);

  if (!image.show || !instance.show) {
    return;
  }

  setImageProperties(image, instance);
  setClickEvent(cmsImages, image, instance);
}

export function updateImage(imageTextures: any, property: string, id: string) {
  log("checking image");
  const image = imageTextures.find((imageTexture: any) => getId(imageTexture) == id);
  switch (property) {
    case "link":
      createOrUpdateMaterial(image);
  }
  image.instances.forEach((instance: any, ii: number) => {
    if (instance.customRendering || image.customRendering) {
      return;
    }
    processInstanceUpdate(property, image, instance);
  });
  log("cmsImage image updated: ", image);
}

export function updateImageInstance(imageTextures: any, property: string, id: string) {
  let instance: any;
  const image = imageTextures.find((image: any) => {
    if (image.instances) {
      instance = image.instances.find((instance: any) => getId(instance) == id);
      return instance;
    }
  });

  if (!instance) {
    return;
  }

  processInstanceUpdate(property, image, instance);

  log("cmsImage instance updated: ", instance);
}

export function createOrUpdateMaterial(image: any) {
  const imageId = getId(image);
  let isUpdate = false;
  if (!cmsImages[imageId]) {
    cmsImages[imageId] = {};
  } else {
    isUpdate = true;
  }
  if (image.isTransparent) {
    cmsImages[imageId].material = new BasicMaterial();
    cmsImages[imageId].texture = new Texture(image.imageLink);
    cmsImages[imageId].material.texture = cmsImages[imageId].texture;
  } else {
    cmsImages[imageId].material = new Material();
    cmsImages[imageId].texture = new Texture("" + image.imageLink);
    cmsImages[imageId].material.albedoTexture = cmsImages[imageId].texture;
    cmsImages[imageId].material.emissiveTexture = cmsImages[imageId].texture;
    cmsImages[imageId].material.emissiveIntensity = image.emission || 1.2;
    cmsImages[imageId].material.emissiveColor = Color3.White();
    cmsImages[imageId].material.roughness = 0.6;
  }
  if (isUpdate) {
    image.instances.forEach((instance: any) => {
      const instanceId = getId(instance);
      cmsImages[imageId][instanceId].addComponentOrReplace(cmsImages[imageId].material);
    });
  }
}

export function processInstanceUpdate(property: string, image: any, instance: any) {
  const imageId = getId(image),
    instanceId = getId(instance);
  switch (property) {
    case "visibility":
      if (!image.show || !instance.show) {
        engine.removeEntity(cmsImages[imageId][instanceId]);
        return;
      } else if (instance.parent || image.parent) {
        cmsImages[imageId][instanceId].setParent(getEntityByName(instance.parent || image.parent));
      } else {
        engine.addEntity(cmsImages[imageId][instanceId]);
      }
      break;
    case "clickEvent":
      setClickEvent(cmsImages, image, instance);
      break;
    case "transform":
      cmsImages[imageId][instanceId].addComponentOrReplace(
        new Transform({
          position: new Vector3(instance.position.x, instance.position.y, instance.position.z),
          rotation: Quaternion.Euler(instance.rotation.x, instance.rotation.y, instance.rotation.z - 180),
          scale: new Vector3(instance.scale.x, instance.scale.y, instance.scale.z)
        })
      );
      break;
    case "properties":
      setImageProperties(image, instance);
  }
}

export function setImageProperties(image: any, instance: any) {
  const imageId = getId(image),
    instanceId = getId(instance);

  if (instance.parent || image.parent) {
    cmsImages[imageId][instanceId].setParent(getEntityByName(instance.parent || image.parent));
  } else {
    engine.addEntity(cmsImages[imageId][instanceId]);
  }
}

export function removeImage(image: TImage) {
  const imageId = getId(image);
  cmsImages[imageId].instances.forEach((instance: any, ii: number) => {
    engine.removeEntity(instance);
  });
}

export function removeImageInstance(image: TImage, instance: TEntityInstance) {
  const imageId = getId(image),
    instanceId = getId(instance);

  engine.removeEntity(cmsImages[imageId][instanceId]);
}
