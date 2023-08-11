import { VLMClickEvent } from "./VLMClickEvent.component";
import { getEntityByName } from "../shared/entity";
import { Emissive, HasImageTexture, SimpleTransform, Transformable } from "../shared/interfaces";
import { sdkImagesAreFlipped } from "../shared/defaults";
import { includes } from "../utils";

export namespace VLMImage {
  export const configs: { [uuid: string]: DCLConfig } = {};
  export const instances: { [uuid: string]: DCLInstanceConfig } = {};

  export class DCLConfig extends Material implements HasImageTexture, Emissive {
    // Implement the required methods and properties
    sk: string;
    customId?: string;
    customRendering: boolean;
    albedoTexture: Texture = new Texture("");
    alphaTexture: Texture = new Texture("");
    emissiveColor = Color3.White();
    emissiveIntensity: number;
    emissiveTexture: Texture = new Texture("");
    parent?: string;
    enabled: boolean;
    instanceIds: string[] = [];
    imageSrc: string;
    roughness: number = 1.0;
    specularIntensity: number = 0;
    metallic: number = 0;
    withCollisions: boolean;
    isTransparent: boolean;
    clickEvent?: VLMClickEvent.DCLConfig;

    constructor(config: VLMConfig) {
      super();
      try {
        this.sk = config.sk;
        this.customId = config.customId;
        this.customRendering = !!config.customRendering;
        this.parent = config.parent;
        this.enabled = config.enabled;
        this.emissiveIntensity = config.emission || 1;
        this.imageSrc = config.textureSrc || config.imageSrc;
        this.withCollisions = config.withCollisions;
        this.isTransparent = config.isTransparent;
        this.clickEvent = config.clickEvent;

        configs[this.sk] = this;
        this.updateTexture(config);

        if (this.customId) {
          configs[this.customId] = configs[this.sk];
        }

        if (this.customRendering || !config.instances || config.instances.length < 1) {
          return;
        }

        config.instances.forEach((instance: VLMInstanceConfig) => {
          this.createInstance(instance);
        });
      } catch (error) {
        throw error
      }
    }

    // deletes the material record AND removes the VLMImage.instances from the engine
    delete: CallableFunction = () => {
      try {
        delete configs[this.sk];
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId].delete();
        });
      } catch (error) {
        throw error;
      }
    };

    // just removes the VLMImage.instances from the engine, keeps the material record and instance records so we can bring stuff back
    remove: CallableFunction = () => {
      try {
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId].remove();
        });
      } catch (error) {
        throw error;
      }
    };

    showAll: CallableFunction = () => {
      try {
        this.instanceIds.forEach((instanceId: string) => {
          const visible = instances[instanceId].enabled,
            parent = instances[instanceId].parent || this.parent;

          if (!visible) {
            return;
          } else if (parent) {
            instances[instanceId].updateParent(parent);
          } else if (!instances[instanceId].customRendering) {
            instances[instanceId].add();
          }
        });
      } catch (error) {
        throw error;
      }
    };

    updateParent: CallableFunction = (parent: string) => {
      try {
        this.instanceIds.forEach((instanceId: string) => {
          if (instances[instanceId].parent === this.parent) {
            instances[instanceId].updateParent(parent);
          }
        });
        this.parent = parent;
      } catch (error) {
        throw error;
      }
    };

    updateCustomId: CallableFunction = (customId: string) => {
      try {
        if (this.customId && configs[this.customId]) {
          delete configs[this.customId];
        }
        configs[customId] = configs[this.sk];
        this.customId = customId;
      } catch (error) {
        throw error;
      }
    };

    updateCustomRendering: CallableFunction = (customRendering: boolean) => {
      try {
        this.customRendering = customRendering;

        if (customRendering) {
          this.remove();
        } else {
          this.showAll();
        }
      } catch (error) {
        throw error;
      }
    };

    updateTexture: CallableFunction = (config: VLMConfig) => {
      try {
        if (config) {
          this.imageSrc = config.textureSrc || config.imageSrc;
        }

        const texture = new Texture(this.imageSrc, {
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
      } catch (e) {
        throw e;
      }
    };

    updateBrightness: CallableFunction = (brightness: number) => {
      this.emissiveIntensity = brightness;
    };

    updateTransparency: CallableFunction = (isTransparent: boolean) => {
      try {
        this.isTransparent = isTransparent;
        this.updateTexture();
      } catch (error) {
        throw error;
      }
    };

    updateClickEvent: CallableFunction = (clickEvent: VLMClickEvent.DCLConfig) => {
      try {
        this.clickEvent = clickEvent;
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId].updateDefaultClickEvent(this.clickEvent);
        });
      } catch (error) {
        throw error;
      }
    };

    createInstance: CallableFunction = (config: DCLInstanceConfig) => {
      try {
        if (!includes(this.instanceIds, config.sk)) {
          this.instanceIds.push(config.sk);
        }
        new DCLInstanceConfig(this, config);
        if (config.customId) {
          instances[config.customId] = instances[config.sk];
        }
      } catch (error) {
        throw error;
      }
    };

    deleteInstance: CallableFunction = (instanceId: string) => {
      try {
        this.instanceIds = this.instanceIds.filter((id: string) => id !== instanceId);
        instances[instanceId].delete();
      } catch (error) {
        throw error;
      }
    };

    removeInstance: CallableFunction = (instanceId: string) => {
      instances[instanceId].remove();
    };

    addInstance: CallableFunction = (instanceId: string) => {
      instances[instanceId].add();
    };
  }

  export class VLMConfig extends DCLConfig {
    textureSrc?: string;
    emission?: number;
    instances: VLMInstanceConfig[];

    constructor(config: VLMConfig) {
      super(config);
      this.textureSrc = config.textureSrc;
      this.emission = config.emission;
      this.instances = config.instances;
    }
  }

  @Component("VLMImageInstance")
  export class DCLInstanceConfig extends Entity implements Transformable {
    sk: string;
    configId: string;
    customId: string;
    customRendering: boolean;
    enabled?: boolean;
    parent?: string;
    position: SimpleTransform;
    scale: SimpleTransform;
    rotation: SimpleTransform;
    defaultClickEvent?: VLMClickEvent.DCLConfig;
    clickEvent?: VLMClickEvent.DCLConfig;
    correctUvs: boolean = sdkImagesAreFlipped;
    withCollisions: boolean;

    constructor(config: DCLConfig, instance: VLMInstanceConfig) {
      super(instance?.name || instance?.sk);
      try {
        this.sk = instance.sk;
        this.customId = instance.customId;
        this.parent = instance.parent || config.parent;
        this.customRendering = instance.customRendering;
        this.position = instance.position;
        this.scale = instance.scale;
        this.rotation = instance.rotation;
        this.configId = config.sk;
        this.enabled = instance.enabled;
        this.clickEvent = instance.clickEvent;
        this.defaultClickEvent = config.clickEvent;
        this.withCollisions = instance.withCollisions;
        instances[this.sk] = this;
        const plane = new PlaneShape();
        if (this.correctUvs) {
          plane.uvs = [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1];
        }
        plane.withCollisions = this.withCollisions;
        this.addComponent(plane);
        this.addComponent(config);
        this.updateTransform(this.position, this.scale, this.rotation);
        this.updateDefaultClickEvent(config.clickEvent);

        if (this.parent && this.enabled && !this.customRendering) {
          this.updateParent(this.parent);
        } else if (this.enabled) {
          this.add();
        }

        if (this.customId) {
          instances[this.customId] = instances[this.sk];
        }
      } catch (error) {
        throw error;
      }
    }

    add: CallableFunction = () => {
      try {
        if (this.isAddedToEngine()) {
          return;
        } else if (this.parent) {
          this.updateParent(this.parent);
        } else {
          engine.addEntity(this);
        }
      } catch (error) {
        throw error;
      }
    };

    delete: CallableFunction = () => {
      try {
        delete instances[this.sk];
        if (this.customId) {
          delete instances[this.customId];
        }
        engine.removeEntity(this);
      } catch (error) {
        throw error;
      }
    };

    remove: CallableFunction = () => {
      try {
        engine.removeEntity(this);
      } catch (error) {
        throw error;
      }
    };

    updateParent: CallableFunction = (parent: string) => {
      try {
        if (parent) {
          this.parent = parent;
          const instanceParent = getEntityByName(parent);
          this.setParent(instanceParent);
        } else {
          this.setParent(null);
        }
      } catch (error) {
        throw error;
      }
    };

    updateCustomId: CallableFunction = (customId: string) => {
      try {
        if (this.customId && instances[this.customId]) {
          delete instances[this.customId];
        }
        instances[customId] = instances[this.sk];
        this.customId = customId;
      } catch (error) {
        throw error;
      }
    };

    updateCustomRendering: CallableFunction = (customRendering: boolean) => {
      try {
        this.customRendering = customRendering;

        if (customRendering) {
          this.remove();
        } else {
          this.add();
        }
      } catch (error) {
        throw error;
      }
    };

    updateTransform: CallableFunction = (position: SimpleTransform, scale: SimpleTransform, rotation: SimpleTransform) => {
      try {
        this.addComponentOrReplace(
          new Transform({
            position: new Vector3(position.x, position.y, position.z),
            scale: new Vector3(scale.x, scale.y, scale.z),
            rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z),
          })
        );
      } catch (error) {
        throw error;
      }
    };

    updateCollider: CallableFunction = (instanceConfig: DCLInstanceConfig) => {
      try {
        this.withCollisions = instanceConfig.withCollisions;
        const shape = new PlaneShape();
        shape.withCollisions = this.withCollisions;
        this.addComponentOrReplace(shape);
      } catch (error) {
        throw error;
      }
    };

    updateDefaultClickEvent: CallableFunction = (newDefaultClickEvent: VLMClickEvent.DCLConfig) => {
      try {
        this.defaultClickEvent = newDefaultClickEvent;
        this.updateClickEvent();
      } catch (error) {
        throw error;
      }
    };

    updateClickEvent: CallableFunction = (newClickEvent?: VLMClickEvent.DCLConfig) => {
      try {
        if (typeof newClickEvent !== "undefined") {
          this.clickEvent = newClickEvent;
        }

        if (this.clickEvent && this.clickEvent?.synced) {
          this.clickEvent = this.defaultClickEvent;
        }

        const clickEvent = this.clickEvent,
          storageRecord = instances[this.sk];

        if (!clickEvent || !storageRecord) {
          return;
        }

        const clickEventObj = new VLMClickEvent.DCLConfig(clickEvent, storageRecord);

        if (clickEventObj.pointerDownEvent) {
          instances[this.sk].addComponentOrReplace(clickEventObj.pointerDownEvent);
        }
      } catch (error) {
        throw error;
      }
    };
  }
  export class VLMInstanceConfig extends DCLInstanceConfig { }
}
