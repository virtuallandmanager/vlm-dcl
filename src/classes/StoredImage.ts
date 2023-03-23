import { movePlayerTo } from "@decentraland/RestrictedActions";
// import { recordEvent } from "../analytics";
import {
  sdkImageFlippedDimension,
  sdkImagesAreFlipped,
  sdkImagesFace,
  vlmImagesFace,
} from "../helpers/defaults";
import { getEntityByName } from "../helpers/entity";
import { IEmission, ITexture, ITransform } from "../interfaces/index";
import { sceneFeatures } from "../sceneData";
import { imageInstances, imageMaterials } from "../storage";
import {
  EClickEventType,
  TClickEvent,
  TImageInstanceConfig,
  TImageMaterialConfig,
  TTransform,
} from "../types/index";
import { StoredEntityInstance } from "./StoredEntity";

export class StoredImageMaterial
  extends Material
  implements ITexture, IEmission
{
  id: string;
  customId?: string;
  customRendering: boolean;
  albedoTexture: Texture = new Texture("");
  alphaTexture: Texture = new Texture("");
  emissiveColor = Color3.White();
  emissiveIntensity: number;
  emissiveTexture: Texture = new Texture("");
  parent?: string;
  show: boolean;
  instanceIds: string[] | any = [];
  imageLink: string;
  roughness: number = 1.0;
  specularIntensity: number = 0;
  metallic: number = 0;
  withCollisions: boolean;
  isTransparent: boolean;
  clickEvent?: TClickEvent;

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
    this.clickEvent = _config.clickEvent;
    this.updateTexture(this.imageLink);
    imageMaterials[this.id] = this;

    if (this.customId) {
      imageMaterials[this.customId] = imageMaterials[this.id];
    }

    if (this.customRendering || _config.instances.length < 1) {
      return;
    }

    _config.instances.forEach((instance: TImageInstanceConfig) => {
      this.createInstance(instance);
    });
  }

  // deletes the material record AND removes the instances from the engine
  delete: CallableFunction = () => {
    delete imageMaterials[this.id];
    [...this.instanceIds].forEach((instanceId: string) => {
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

    const texture = new Texture(this.imageLink, {
      hasAlpha: this.isTransparent,
    });
    this.albedoTexture = texture;
    this.emissiveTexture = texture;
    this.alphaTexture = texture;
    if (this.isTransparent) {
      this.transparencyMode = TransparencyMode.ALPHA_TEST;
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

  updateClickEvent: CallableFunction = (clickEvent: TClickEvent) => {
    this.clickEvent = clickEvent;
    [...this.instanceIds].forEach((instanceId: string) => {
      imageInstances[instanceId].updateDefaultClickEvent(this.clickEvent);
    });
  };

  createInstance: CallableFunction = (_config: TImageInstanceConfig) => {
    this.instanceIds.push(_config.id);
    new StoredImageInstance(this, _config);
    imageInstances[_config.id].add();
  };

  deleteInstance: CallableFunction = (instanceId: string) => {
    this.instanceIds = this.instanceIds.filter(
      (id: string) => id !== instanceId
    );
    imageInstances[instanceId].delete();
  };

  removeInstance: CallableFunction = (instanceId: string) => {
    imageInstances[instanceId].remove();
  };

  addInstance: CallableFunction = (instanceId: string) => {
    imageInstances[instanceId].add();
  };
}

export class StoredImageInstance
  extends StoredEntityInstance
  implements ITransform
{
  id: string;
  materialId: string;
  parent?: string;
  position: TTransform;
  scale: TTransform;
  rotation: TTransform;
  modifiedTransform: {
    position: TTransform;
    scale: TTransform;
    rotation: TTransform;
  };
  withCollisions: boolean;

  constructor(_material: StoredImageMaterial, _instance: TImageInstanceConfig) {
    super(_material, _instance);
    this.id = _instance.id;
    this.customId = _instance.customId;
    this.parent = _instance.parent || _material.parent;
    this.customRendering = _instance.customRendering;
    this.position = _instance.position;
    this.scale = _instance.scale;
    this.rotation = _instance.rotation;
    this.modifiedTransform = {
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
    };
    this.materialId = _material.id;
    this.show = _instance.show;
    this.clickEvent = _instance.clickEvent;
    this.defaultClickEvent = _material.clickEvent;
    this.withCollisions = _instance.withCollisions;
    imageInstances[this.id] = this;
    const shape = new PlaneShape();
    shape.withCollisions = this.withCollisions;
    this.addComponent(shape);
    this.addComponent(_material);
    this.updateTransform(this.position, this.scale, this.rotation);
    this.updateDefaultClickEvent(_material.clickEvent);

    if (this.parent && this.show && !this.customRendering) {
      this.updateParent(this.parent);
    } else if (this.show) {
      this.add();
    }

    if (this.customId) {
      imageInstances[this.customId] = imageInstances[this.id];
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

  updateTransform: CallableFunction = (
    newPosition?: TTransform,
    newScale?: TTransform,
    newRotation?: TTransform
  ) => {
    this.applyCustomTransforms(newPosition, newScale, newRotation);

    const { position, scale, rotation } = this.modifiedTransform;

    this.addComponentOrReplace(
      new Transform({
        position: new Vector3(position.x, position.y, position.z),
        scale: new Vector3(scale.x, scale.y, scale.z),
        rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z),
      })
    );
  };

  updateCollider: CallableFunction = (instanceConfig: TImageInstanceConfig) => {
    this.withCollisions = instanceConfig.withCollisions;
    const shape = new PlaneShape();
    shape.withCollisions = this.withCollisions;
    this.addComponentOrReplace(shape);
  };

  applyCustomTransforms: CallableFunction = (
    originalPosition: TTransform,
    originalScale: TTransform,
    originalRotation: TTransform
  ) => {
    this.position = originalPosition || this.position;
    this.scale = originalScale || this.scale;
    this.rotation = originalRotation || this.rotation;

    this.modifiedTransform = {
      position: { ...this.position },
      scale: { ...this.scale },
      rotation: { ...this.rotation },
    };

    if (sdkImagesAreFlipped) {
      this.modifiedTransform.rotation[sdkImageFlippedDimension] += 180;
    }

    const imageRotationDegree = (vlmImagesFace - sdkImagesFace) * 90;

    this.modifiedTransform.rotation.y += imageRotationDegree;
  };

  trackClickEvent: CallableFunction = (clickEvent: TClickEvent, id: string) => {
    const trackingId = clickEvent.trackingId || id;

    if (clickEvent.hasTracking && sceneFeatures.analytics) {
      // recordEvent(trackingId);
    }
  };

  updateDefaultClickEvent: CallableFunction = (
    newDefaultClickEvent: TClickEvent
  ) => {
    this.defaultClickEvent = newDefaultClickEvent;
    this.updateClickEvent();
  };

  updateClickEvent: CallableFunction = (newClickEvent?: TClickEvent) => {
    if (typeof newClickEvent !== "undefined") {
      this.clickEvent = newClickEvent;
    }

    if (this.clickEvent && this.clickEvent.synced) {
      this.clickEvent = this.defaultClickEvent;
    }

    const clickEvent = this.clickEvent;

    let pointerDownEvent,
      showFeedback = clickEvent && clickEvent.showFeedback,
      hoverText = clickEvent && clickEvent.hoverText,
      instanceId = this.id;

    if (!clickEvent || !imageInstances[instanceId]) {
      return;
    }

    switch (clickEvent.type) {
      case EClickEventType.NONE: //no click event
        if (imageInstances[instanceId].getComponentOrNull(OnPointerDown)) {
          imageInstances[instanceId].removeComponent(OnPointerDown);
        }
        return;
      case EClickEventType.TRACKING_ONLY: //tracking clicks only
        pointerDownEvent = new OnPointerDown(
          () => {
            this.trackClickEvent(
              clickEvent,
              `click-event-${this.customId || this.id}`
            );
          },
          { showFeedback, hoverText }
        );
        break;
      case EClickEventType.EXTERNAL: //external link
        pointerDownEvent = new OnPointerDown(
          () => {
            if (clickEvent.externalLink) {
              openExternalURL(clickEvent.externalLink);
              this.trackClickEvent(
                clickEvent,
                `click-event-(external-link)-${this.customId || this.id}`
              );
            }
          },
          { showFeedback, hoverText }
        );
        break;
      case EClickEventType.SOUND: //play a sound
        const clip = new AudioClip(clickEvent.sound || "");
        const source = new AudioSource(clip);
        pointerDownEvent = new OnPointerDown(
          () => {
            source.playOnce();
            this.trackClickEvent(
              clickEvent,
              `click-event-(sound)-${this.customId || this.id}`
            );
          },
          { showFeedback, hoverText }
        );
        break;
      case EClickEventType.MOVE: // move player
        pointerDownEvent = new OnPointerDown(
          () => {
            if (!clickEvent.moveTo) {
              return;
            }
            movePlayerTo(
              clickEvent.moveTo.position,
              clickEvent.moveTo.setCameraTarget
                ? clickEvent.moveTo.cameraTarget
                : undefined
            );
            this.trackClickEvent(
              clickEvent,
              `click-event-(move-player)-${this.customId || this.id}`
            );
          },
          { showFeedback, hoverText }
        );
        break;
      case EClickEventType.TELEPORT: // teleport player
        pointerDownEvent = new OnPointerDown(
          () => {
            if (clickEvent.teleportTo) {
              teleportTo(clickEvent.teleportTo);
              this.trackClickEvent(
                clickEvent,
                `click-event-(teleport-player)-${this.customId || this.id}`
              );
            }
          },
          { showFeedback, hoverText }
        );
        break;
    }
    if (pointerDownEvent) {
      imageInstances[instanceId].addComponentOrReplace(pointerDownEvent);
    }
  };
}
