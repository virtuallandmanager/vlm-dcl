import { sdkImageFlippedDimension, sdkImagesAreFlipped, sdkImagesFace, vlmImagesFace } from "../helpers/defaults";
import { getEntityByName } from "../helpers/entity";
import { IEmission, ITexture, ITransform } from "../interfaces";
import { imageInstances, imageMaterials } from "../storage";
import { TImageInstanceConfig, TImageMaterialConfig } from "../types/Image";
import { TTransform } from "../types/Transform";
import { StoredEntityInstance } from "./StoredEntity";

export class StoredImageMaterial extends Material implements ITexture, IEmission {
  id: string;
  customId?: string;
  customRendering: boolean;
  albedoTexture: Texture;
  alphaTexture: Texture;
  emissiveColor = Color3.White();
  emissiveIntensity: number;
  emissiveTexture: Texture;
  parent?: string;
  show: boolean;
  instanceIds: string[] | any = [];
  imageLink: string;
  roughness: number = 1.0;
  specularIntensity: number = 0;
  metallic: number = 0;
  withCollisions: boolean;
  isTransparent: boolean;

  constructor(_config: TImageMaterialConfig) {
    super();
    this.id = _config.id;
    this.customId = _config.customId;
    this.customRendering = !!_config.customRendering;
    this.parent = _config.parent;
    this.show = _config.show;
    this.emissiveIntensity = _config.emission || 1;
    this.imageLink = _config.imageLink;
    this.withCollisions = _config.withCollisions;
    this.isTransparent = _config.isTransparent;
    this.updateTexture(this.imageLink);
    imageMaterials[this.id] = this;

    if (this.customId) {
      imageMaterials[this.customId] = imageMaterials[this.id];
    }

    _config.instances.forEach((instance: TImageInstanceConfig) => {
      this.createInstance(instance);
    });
  }

  // deletes the material record AND removes the instances from the engine
  delete: CallableFunction = () => {
    delete imageMaterials[this.id];
    [...this.instanceIds].forEach((instanceId: string) => {
      log(instanceId);
      imageInstances[instanceId].delete();
    });
  };

  // just removes the instances from the engine, keeps the material record and instance records so we can bring stuff back
  remove: CallableFunction = () => {
    [...this.instanceIds].forEach((instanceId: string) => {
      imageInstances[instanceId].remove();
    });
  };

  showAll: CallableFunction = () => {
    [...this.instanceIds].forEach((instanceId: string) => {
      const visible = imageInstances[instanceId].show,
        parent = imageInstances[instanceId].parent || this.parent;

      if (!visible) {
        return;
      } else if (parent) {
        imageInstances[instanceId].updateParent(parent);
      } else {
        imageInstances[instanceId].add();
      }
    });
  };

  updateParent: CallableFunction = (parent: string) => {
    [...this.instanceIds].forEach((instanceId: string) => {
      if (imageInstances[instanceId].parent === this.parent) {
        imageInstances[instanceId].updateParent(parent);
      }
    });
    this.parent = parent;
  };

  updateCustomId: CallableFunction = (customId: string) => {
    if (this.customId && imageMaterials[this.customId]) {
      delete imageMaterials[this.customId];
    }
    imageMaterials[customId] = imageMaterials[this.id];
    this.customId = customId;
  };

  updateTexture: CallableFunction = (url?: string) => {
    if (url) {
      this.imageLink = url;
    }

    const texture = new Texture(this.imageLink, { hasAlpha: this.isTransparent });
    this.albedoTexture = texture;
    this.emissiveTexture = texture;
    this.alphaTexture = texture;
    if (this.isTransparent) {
      this.transparencyMode = TransparencyMode.ALPHA_BLEND;
    } else {
      this.transparencyMode = TransparencyMode.OPAQUE;
    }
  };

  updateBrightness: CallableFunction = (brightness: number) => {
    this.emissiveIntensity = brightness;
  };

  updateTransparency: CallableFunction = (isTransparent: boolean) => {
    this.isTransparent = isTransparent;
    this.updateTexture();
  };

  createInstance: CallableFunction = (_config: TImageInstanceConfig) => {
    this.instanceIds.push(_config.id);
    imageInstances[_config.id] = new StoredImageInstance(this, _config);
    if (_config.customId) {
      imageInstances[_config.customId] = imageInstances[_config.id];
    }
    imageInstances[_config.id].add();
  };

  deleteInstance: CallableFunction = (instanceId: string) => {
    this.instanceIds = this.instanceIds.filter((id: string) => id !== instanceId);
    imageInstances[instanceId].delete();
  };

  removeInstance: CallableFunction = (instanceId: string) => {
    imageInstances[instanceId].remove();
  };

  addInstance: CallableFunction = (instanceId: string) => {
    imageInstances[instanceId].add();
  };
}

export class StoredImageInstance extends StoredEntityInstance implements ITransform {
  id: string;
  materialId: string;
  parent: string;
  position: TTransform;
  scale: TTransform;
  rotation: TTransform;
  modifiedTransform: { position: TTransform; scale: TTransform; rotation: TTransform };
  withCollisions: boolean;

  constructor(_material: StoredImageMaterial, _instance: TImageInstanceConfig) {
    super(_material, _instance);
    this.id = _instance.id;
    this.customId = _instance.customId;
    this.parent = _instance.parent;
    this.position = _instance.position;
    this.scale = _instance.scale;
    this.rotation = _instance.rotation;
    this.materialId = _material.id;
    this.show = _instance.show;
    const shape = new PlaneShape();
    shape.withCollisions = typeof _instance.withCollisions === "boolean" ? _instance.withCollisions : _material.withCollisions;
    this.addComponent(shape);
    this.addComponent(_material);
    this.updateTransform(this.position, this.scale, this.rotation);

    if (this.parent && this.show) {
      this.updateParent(this.parent);
    } else if (this.show) {
      this.add();
    }
  }

  add: CallableFunction = () => {
    engine.addEntity(this);
  };

  delete: CallableFunction = () => {
    delete imageInstances[this.id];
    if (this.customId) {
      delete imageInstances[this.customId];
    }
    engine.removeEntity(this);
  };

  remove: CallableFunction = () => {
    engine.removeEntity(this);
  };

  updateParent: CallableFunction = (parent: string) => {
    if (parent) {
      this.parent = parent;
      const instanceParent = getEntityByName(parent);
      this.setParent(instanceParent);
    } else {
      this.setParent(null);
    }
  };

  updateCustomId: CallableFunction = (customId: string) => {
    if (this.customId && imageInstances[this.customId]) {
      delete imageInstances[this.customId];
    }
    imageInstances[customId] = imageInstances[this.id];
    this.customId = customId;
  };

  updateTransform: CallableFunction = (newPosition?: TTransform, newScale?: TTransform, newRotation?: TTransform) => {
    this.applyCustomTransforms(newPosition, newScale, newRotation);

    const { position, scale, rotation } = this.modifiedTransform;

    this.addComponentOrReplace(
      new Transform({
        position: new Vector3(position.x, position.y, position.z),
        scale: new Vector3(scale.x, scale.y, scale.z),
        rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z)
      })
    );
  };

  updateCollider: CallableFunction = (instanceConfig: TImageInstanceConfig) => {
    this.withCollisions = instanceConfig.withCollisions;
    const shape = new PlaneShape();
    shape.withCollisions = this.withCollisions;
    this.addComponentOrReplace(shape);
  };

  applyCustomTransforms: CallableFunction = (originalPosition: TTransform, originalScale: TTransform, originalRotation: TTransform) => {
    this.position = originalPosition || this.position;
    this.scale = originalScale || this.scale;
    this.rotation = originalRotation || this.rotation;

    this.modifiedTransform = { position: { ...this.position }, scale: { ...this.scale }, rotation: { ...this.rotation } };

    if (sdkImagesAreFlipped) {
      this.modifiedTransform.rotation[sdkImageFlippedDimension] += 180;
    }

    const imageRotationDegree = (vlmImagesFace - sdkImagesFace) * 90;

    this.modifiedTransform.rotation.y += imageRotationDegree;
  };
}
