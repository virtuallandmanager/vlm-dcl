import { VLMClickEvent } from "./VLMClickEvent.component";
import { getEntityByName } from "../shared/entity";
import { Emissive, HasImageTexture, SimpleTransform, Transformable } from "../shared/interfaces";
import { sdkImagesAreFlipped } from "src/shared/defaults";

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
    instanceIds: string[] | any = [];
    imageSrc: string;
    roughness: number = 1.0;
    specularIntensity: number = 0;
    metallic: number = 0;
    withCollisions: boolean;
    isTransparent: boolean;
    clickEvent?: VLMClickEvent.DCLConfig;

    constructor(config: VLMConfig) {
      super();
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
      this.updateTexture(this.imageSrc);
      VLMImage.configs[this.sk] = this;

      if (this.customId) {
        VLMImage.configs[this.customId] = VLMImage.configs[this.sk];
      }

      if (this.customRendering || config.instances.length < 1) {
        return;
      }

      config.instances.forEach((instance: VLMInstanceConfig) => {
        this.createInstance(instance);
      });
    }

    // deletes the material record AND removes the VLMImage.instances from the engine
    delete: CallableFunction = () => {
      delete VLMImage.configs[this.sk];
      [...this.instanceIds].forEach((instanceId: string) => {
        VLMImage.instances[instanceId].delete();
      });
    };

    // just removes the VLMImage.instances from the engine, keeps the material record and instance records so we can bring stuff back
    remove: CallableFunction = () => {
      [...this.instanceIds].forEach((instanceId: string) => {
        VLMImage.instances[instanceId].remove();
      });
    };

    showAll: CallableFunction = () => {
      [...this.instanceIds].forEach((instanceId: string) => {
        const visible = VLMImage.instances[instanceId].enabled,
          parent = VLMImage.instances[instanceId].parent || this.parent;

        if (!visible) {
          return;
        } else if (parent) {
          VLMImage.instances[instanceId].updateParent(parent);
        } else if (!VLMImage.instances[instanceId].customRendering) {
          VLMImage.instances[instanceId].add();
        }
      });
    };

    updateParent: CallableFunction = (parent: string) => {
      [...this.instanceIds].forEach((instanceId: string) => {
        if (VLMImage.instances[instanceId].parent === this.parent) {
          VLMImage.instances[instanceId].updateParent(parent);
        }
      });
      this.parent = parent;
    };

    updateCustomId: CallableFunction = (customId: string) => {
      if (this.customId && VLMImage.configs[this.customId]) {
        delete VLMImage.configs[this.customId];
      }
      VLMImage.configs[customId] = VLMImage.configs[this.sk];
      this.customId = customId;
    };

    updateCustomRendering: CallableFunction = (customRendering: boolean) => {
      this.customRendering = customRendering;

      if (customRendering) {
        this.remove();
      } else {
        this.showAll();
      }
    };

    updateTexture: CallableFunction = (url?: string) => {
      if (url) {
        this.imageSrc = url;
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
    };

    updateBrightness: CallableFunction = (brightness: number) => {
      this.emissiveIntensity = brightness;
    };

    updateTransparency: CallableFunction = (isTransparent: boolean) => {
      this.isTransparent = isTransparent;
      this.updateTexture();
    };

    updateClickEvent: CallableFunction = (clickEvent: VLMClickEvent.DCLConfig) => {
      this.clickEvent = clickEvent;
      [...this.instanceIds].forEach((instanceId: string) => {
        VLMImage.instances[instanceId].updateDefaultClickEvent(this.clickEvent);
      });
    };

    createInstance: CallableFunction = (config: DCLInstanceConfig) => {
      try {
        log("VLM: Creating Image...");
        this.instanceIds.push(config.sk);
        new DCLInstanceConfig(this, config);
      } catch (error) {
        throw error;
      }
    };

    deleteInstance: CallableFunction = (instanceId: string) => {
      this.instanceIds = this.instanceIds.filter((id: string) => id !== instanceId);
      VLMImage.instances[instanceId].delete();
    };

    removeInstance: CallableFunction = (instanceId: string) => {
      VLMImage.instances[instanceId].remove();
    };

    addInstance: CallableFunction = (instanceId: string) => {
      VLMImage.instances[instanceId].add();
    };
  }

  export class VLMConfig extends DCLConfig {
    textureSrc?: string;
    emission?: number;
    instances?: VLMInstanceConfig[];
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
      log(config, instance);
      log("VLM: Check in constructor 1");
      super(instance.name);
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
        VLMImage.instances[this.sk] = this;
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
          VLMImage.instances[this.customId] = VLMImage.instances[this.sk];
        }
      } catch (error) {
        log("VLM: error in constructor");

        throw error;
      }
    }

    add: CallableFunction = () => {
      try {
        engine.addEntity(this);
      } catch (error) {
        throw error;
      }
    };

    delete: CallableFunction = () => {
      delete VLMImage.instances[this.sk];
      if (this.customId) {
        delete VLMImage.instances[this.customId];
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
      if (this.customId && VLMImage.instances[this.customId]) {
        delete VLMImage.instances[this.customId];
      }
      VLMImage.instances[customId] = VLMImage.instances[this.sk];
      this.customId = customId;
    };

    updateCustomRendering: CallableFunction = (customRendering: boolean) => {
      this.customRendering = customRendering;

      if (customRendering) {
        this.remove();
      } else {
        this.add();
      }
    };

    updateTransform: CallableFunction = (position?: SimpleTransform, scale?: SimpleTransform, rotation?: SimpleTransform) => {
      this.addComponentOrReplace(
        new Transform({
          position: new Vector3(position.x, position.y, position.z),
          scale: new Vector3(scale.x, scale.y, scale.z),
          rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z),
        })
      );
    };

    updateCollider: CallableFunction = (instanceConfig: DCLInstanceConfig) => {
      this.withCollisions = instanceConfig.withCollisions;
      const shape = new PlaneShape();
      shape.withCollisions = this.withCollisions;
      this.addComponentOrReplace(shape);
    };

    updateDefaultClickEvent: CallableFunction = (newDefaultClickEvent: VLMClickEvent.DCLConfig) => {
      this.defaultClickEvent = newDefaultClickEvent;
      this.updateClickEvent();
    };

    updateClickEvent: CallableFunction = (newClickEvent?: VLMClickEvent.DCLConfig) => {
      if (typeof newClickEvent !== "undefined") {
        this.clickEvent = newClickEvent;
      }

      if (this.clickEvent && this.clickEvent.synced) {
        this.clickEvent = this.defaultClickEvent;
      }

      const clickEvent = this.clickEvent,
        storageRecord = VLMImage.instances[this.sk];

      if (!clickEvent || !storageRecord) {
        return;
      }

      const clickEventObj = new VLMClickEvent.DCLConfig(clickEvent, storageRecord);

      if (clickEventObj.pointerDownEvent) {
        VLMImage.instances[this.sk].addComponentOrReplace(clickEventObj.pointerDownEvent);
      }
    };
  }
  export class VLMInstanceConfig extends DCLInstanceConfig {}
}
