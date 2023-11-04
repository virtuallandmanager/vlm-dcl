import { VLMClickEvent } from "./VLMClickEvent.component";
import { Emissive, HasImageTexture, SimpleTransform, Transformable } from "../shared/interfaces";
import { sdkImagesAreFlipped } from "../shared/defaults";
import { includes } from "../utils";
import { VLMBase } from "./VLMBaseConfig.component";
import { getEntityByName } from "../shared/entity";
import { Material, engine } from "@dcl/sdk/ecs";
import { } from "@dcl/sdk/math";

export namespace VLMImage {
  export const configs: { [uuid: string]: Config } = {};
  export const instances: { [uuid: string]: Instance } = {};

  /** 
  * @public
  * VLM Image Config: A config for VLMImage components
  *
  * Configs are used to define properties shared by multiple instances, such as materials, textures, files, etc.
  * 
  * @param id - the id of the config - a unique number id used by DCL's SDK
  * @param sk - the sk of the config - a unique UUID used by VLM servers
  * @param enabled - enables or disables the component and all of its instances
  * @param parent - the parent component for all instances that use this config
  * @param customId - the customId of the config - used for manual control of the config, such as custom rendering
  * @param customRendering - disables the default rendering of the component so that it can be rendered manually in code
  * @param name - the name of the component
  * @param imageSrc - the image source for the image
  * @param clickEvent - the click event for the image
  * @param instanceIds - the ids of the instances that use this config
  */
  export class Config {
    sk: string;
    customId?: string;
    imageSrc?: string;
    clickEvent?: VLMClickEvent.Config;
    instanceIds: string[] = [];

    constructor(config: Config) {
      this.sk = config.sk;
      this.customId = config.customId;
      this.imageSrc = config.imageSrc;

      configs[this.sk] = this;

      if (this.customId) {
        configs[this.customId] = configs[this.sk];
      }
    }

    /** 
     * @public remove
     *  Removes the config's instances from the engine, keeps the config and instance records so we can bring stuff back
     *  @returns void
     */
    remove: CallableFunction = () => {
      try {
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId].remove();
        });
      } catch (error) {
        throw error;
      }
    };

    /**
     * @public delete
     * Deletes the config's material record AND removes the config's instances from the engine
     * @returns void
     */
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

    /**
     * @public createInstance
     * Creates a new instance of the config
     * @param config - the instance config
     * @returns void
     */
    createInstance: CallableFunction = (config: Instance) => {
      if (!includes(this.instanceIds, config.sk)) {
        this.instanceIds.push(config.sk);
      }
      if (!instances[config.sk]) {
        new Instance(this, config);
      } else {
        // delete and recreate
      }
    };
  }

  /**
   * @public Instance
   * VLM Image Instance: An instance of a VLMImage config
   * 
   * Instances get shared properties from a config while defining their own unique properties, such as position, rotation, scale, etc.
   * 
   * @param id - the id of the config - a unique number id used by DCL's SDK
   * @param sk - the sk of the config - a unique UUID used by VLM servers
   * @param enabled - enables or disables the component and all of its instances
   * @param parent - the parent component for all instances that use this config
   * @param customId - the customId of the config - used for manual control of the config, such as custom rendering
   * @param customRendering - disables the default rendering of the component so that it can be rendered manually in code
   * @param name - the name of the component
   * @param imageSrc - the image source for the image
   * @param clickEvent - the click event for the image
   * @param instanceIds - the ids of the instances that use this config
   * @param position - the position of the instance
   * @param rotation - the rotation of the instance
   * @param scale - the scale of the instance
   * @param defaultClickEvent - the default click event for the instance
   * @param correctUvs - whether or not the instance's uvs are correct
   * @param emissiveIntensity - the emissive intensity of the instance
   * @param emissiveColor - the emissive color of the instance
   * @param emissiveTexture - the emissive texture of the instance
   * @param albedoTexture - the albedo texture of the instance
   * @param alphaTexture - the alpha texture of the instance
   * @param transparencyMode - the transparency mode of the instance
   * @param withCollisions - whether or not the instance has collisions
   * @param material - the material of the instance
   * @param plane - the plane of the instance
    */
  export class Instance {
    id: number;
    sk: string;
    customId?: string;
    clickEvent?: VLMClickEvent.Config;
    constructor(config: Config, instanceConfig: Instance) {
      this.id = engine.addEntity();
      this.sk = instanceConfig.sk;
      this.customId = instanceConfig.customId;

      instances[this.sk] = this;

      if (this.customId) {
        instances[this.customId] = instances[this.id];
      }
    }
  }

  // export class DCLConfig implements HasImageTexture, Emissive {
  //   sk: string;
  //   customId?: string;
  //   customRendering: boolean;
  //   albedoTexture: Texture = new Texture("");
  //   alphaTexture: Texture = new Texture("");
  //   emissiveColor = Color3.White();
  //   emissiveIntensity: number;
  //   emissiveTexture: Texture = new Texture("");
  //   parent?: string;
  //   enabled: boolean;
  //   instanceIds: string[] = [];
  //   imageSrc: string;
  //   roughness: number = 1.0;
  //   specularIntensity: number = 0;
  //   metallic: number = 0;
  //   withCollisions: boolean;
  //   isTransparent: boolean;
  //   clickEvent?: VLMClickEvent.DCLConfig;

  //   constructor(config: VLMConfig) {
  //     this.sk = config.sk;
  //     this.customId = config.customId;
  //     this.customRendering = !!config.customRendering;
  //     this.parent = config.parent;
  //     this.enabled = config.enabled;
  //     this.emissiveIntensity = config.emission || 1;
  //     this.imageSrc = config.textureSrc || config.imageSrc;
  //     this.withCollisions = config.withCollisions;
  //     this.isTransparent = config.isTransparent;
  //     this.clickEvent = config.clickEvent;
  //     this.init(config);
  //   };

  //   init: CallableFunction = (config: VLMConfig) => {
  //     try {
  //       this.sk = config.sk;
  //       this.customId = config.customId;
  //       this.customRendering = !!config.customRendering;
  //       this.parent = config.parent;
  //       this.enabled = config.enabled;
  //       this.emissiveIntensity = config.emission || 1;
  //       this.imageSrc = config.textureSrc || config.imageSrc;
  //       this.withCollisions = config.withCollisions;
  //       this.isTransparent = config.isTransparent;
  //       this.clickEvent = config.clickEvent;

  //       this.updateTexture(config);

  //       configs[this.sk] = this;
  //       if (this.customId) {
  //         configs[this.customId] = configs[this.sk];
  //       }

  //       if (this.customRendering || !config.instances || config.instances.length < 1) {
  //         return;
  //       }

  //       config.instances.forEach((instance: VLMInstanceConfig) => {
  //         this.createInstance(instance);
  //       });
  //     } catch (error) {
  //       throw error
  //     }
  //   }

  //   showAll: CallableFunction = () => {
  //     try {
  //       this.instanceIds.forEach((instanceId: string) => {
  //         const visible = instances[instanceId].enabled,
  //           parent = instances[instanceId].parent || this.parent;

  //         if (!visible) {
  //           return;
  //         } else if (parent) {
  //           instances[instanceId].updateParent(parent);
  //         } else if (!instances[instanceId].customRendering) {
  //           instances[instanceId].add();
  //         }
  //       });
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   // just removes the VLMImage.instances from the engine, keeps the material record and instance records so we can bring stuff back
  //   remove: CallableFunction = () => {
  //     try {
  //       this.instanceIds.forEach((instanceId: string) => {
  //         instances[instanceId].remove();
  //       });
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   // deletes the material record AND removes the VLMImage.instances from the engine
  //   delete: CallableFunction = () => {
  //     try {
  //       delete configs[this.sk];
  //       this.instanceIds.forEach((instanceId: string) => {
  //         instances[instanceId].delete();
  //       });
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   updateParent: CallableFunction = (parent: string) => {
  //     try {
  //       this.instanceIds.forEach((instanceId: string) => {
  //         if (instances[instanceId].parent === this.parent) {
  //           instances[instanceId].updateParent(parent);
  //         }
  //       });
  //       this.parent = parent;
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   updateCustomId: CallableFunction = (customId: string) => {
  //     try {
  //       if (this.customId && configs[this.customId]) {
  //         delete configs[this.customId];
  //       }
  //       configs[customId] = configs[this.sk];
  //       this.customId = customId;
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   updateCustomRendering: CallableFunction = (customRendering: boolean) => {
  //     try {
  //       this.customRendering = customRendering;

  //       if (customRendering) {
  //         this.remove();
  //       } else {
  //         this.showAll();
  //       }
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   updateTexture: CallableFunction = (config: VLMConfig) => {
  //     try {
  //       if (config) {
  //         this.imageSrc = config.textureSrc || config.imageSrc;
  //       }

  //       const texture = new Texture(this.imageSrc, {
  //         hasAlpha: this.isTransparent,
  //       });
  //       this.albedoTexture = texture;
  //       this.emissiveTexture = texture;
  //       this.alphaTexture = texture;
  //       if (this.isTransparent) {
  //         this.transparencyMode = TransparencyMode.ALPHA_TEST;
  //       } else {
  //         this.transparencyMode = TransparencyMode.OPAQUE;
  //       }
  //     } catch (e) {
  //       throw e;
  //     }
  //   };

  //   updateBrightness: CallableFunction = (brightness: number) => {
  //     this.emissiveIntensity = brightness;
  //   };

  //   updateTransparency: CallableFunction = (isTransparent: boolean) => {
  //     try {
  //       this.isTransparent = isTransparent;
  //       this.updateTexture();
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   updateClickEvent: CallableFunction = (clickEvent: VLMClickEvent.DCLConfig) => {
  //     try {
  //       this.clickEvent = clickEvent;
  //       this.instanceIds.forEach((instanceId: string) => {
  //         instances[instanceId].updateDefaultClickEvent(this.clickEvent);
  //       });
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   createInstance: CallableFunction = (config: VLMInstanceConfig) => {
  //     if (!includes(this.instanceIds, config.sk)) {
  //       this.instanceIds.push(config.sk);
  //     }
  //     if (!instances[config.sk]) {
  //       new DCLInstanceConfig(this, config);
  //     } else {
  //       instances[config.sk].init(this, config);
  //     }
  //   };

  //   deleteInstance: CallableFunction = (instanceId: string) => {
  //     try {
  //       console.log("VLM - DELETING INSTANCE - Step 4", instanceId)
  //       this.instanceIds = this.instanceIds.filter((id: string) => id !== instanceId);
  //       instances[instanceId].delete();
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   removeInstance: CallableFunction = (instanceId: string) => {
  //     instances[instanceId].remove();
  //   };

  //   addInstance: CallableFunction = (instanceId: string) => {
  //     instances[instanceId].add();
  //   };
  // }

  // export class VLMConfig extends DCLConfig {
  //   textureSrc?: string;
  //   emission?: number;
  //   instances: VLMInstanceConfig[];

  //   constructor(config: VLMConfig) {
  //     super(config);
  //     this.textureSrc = config.textureSrc;
  //     this.emission = config.emission;
  //     this.instances = config.instances;
  //   }
  // }

  // export class DCLInstanceConfig extends VLMBase.Instance implements Transformable {
  //   sk: string;
  //   configId: string;
  //   customId: string;
  //   customRendering: boolean;
  //   enabled?: boolean;
  //   parent?: string;
  //   position: SimpleTransform;
  //   scale: SimpleTransform;
  //   rotation: SimpleTransform;
  //   defaultClickEvent?: VLMClickEvent.DCLConfig;
  //   clickEvent?: VLMClickEvent.DCLConfig;
  //   correctUvs: boolean = sdkImagesAreFlipped;
  //   withCollisions: boolean;

  //   constructor(config: DCLConfig, instance: VLMInstanceConfig) {
  //     super(config, instance);
  //     this.init(config, instance)
  //   }

  //   init: CallableFunction = (config: DCLConfig, instance: VLMInstanceConfig) => {
  //     try {
  //       this.sk = instance?.sk;
  //       this.customId = instance?.customId;
  //       this.parent = instance?.parent || config?.parent;
  //       this.customRendering = instance?.customRendering;
  //       this.configId = config?.sk;
  //       this.position = instance?.position;
  //       this.scale = instance.scale;
  //       this.rotation = instance.rotation;
  //       this.enabled = instance.enabled;
  //       this.clickEvent = instance.clickEvent;
  //       this.defaultClickEvent = config.clickEvent;
  //       this.withCollisions = instance.withCollisions;
  //       instances[this.sk] = this;
  //       console.log("VLM - CREATING INSTANCE - Step 3", instances && instances[this.sk])
  //       const plane = new PlaneShape();
  //       if (this.correctUvs) {
  //         plane.uvs = [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1];
  //       }
  //       if (this.withCollisions === undefined) {
  //         this.withCollisions = config.withCollisions
  //       }
  //       plane.withCollisions = this.withCollisions;
  //       this.addComponentOrReplace(plane);
  //       this.addComponentOrReplace(config);
  //       this.updateTransform(this.position, this.scale, this.rotation);
  //       this.updateDefaultClickEvent(config.clickEvent);
  //       this.add();

  //       if (this.customId) {
  //         instances[this.customId] = instances[this.sk];
  //       }
  //     } catch (error) {
  //       throw error;
  //     }
  //   }

  //   add: CallableFunction = () => {
  //     try {
  //       if (this.isAddedToEngine() || this.customRendering || !configs[this.configId].enabled || !this.enabled) {
  //         return;
  //       }

  //       if (this.parent) {
  //         this.updateParent(this.parent);
  //       } else if (this.enabled) {
  //         engine.addEntity(this);
  //       }
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   delete: CallableFunction = () => {
  //     try {
  //       this.remove();
  //       delete instances[this.sk];
  //       if (this.customId) {
  //         delete instances[this.customId];
  //       }
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   remove: CallableFunction = () => {
  //     try {
  //       if (this.isAddedToEngine()) {
  //         engine.removeEntity(this);
  //       }
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   updateParent: CallableFunction = (parent: string) => {
  //     try {
  //       if (parent) {
  //         this.parent = parent;
  //         const instanceParent = getEntityByName(parent);
  //         this.setParent(instanceParent); //// SDK SPECIFIC ////
  //       } else {
  //         this.setParent(null); //// SDK SPECIFIC ////
  //       }
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   updateCustomId: CallableFunction = (customId: string) => {
  //     try {
  //       if (this.customId && instances[this.customId]) {
  //         delete instances[this.customId];
  //       }
  //       this.customId = customId;
  //       this.init(configs[this.configId], this);

  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   updateCustomRendering: CallableFunction = (customRendering: boolean) => {
  //     try {
  //       this.customRendering = customRendering;

  //       if (customRendering) {
  //         this.remove();
  //       } else {
  //         this.add();
  //       }
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   updateTransform: CallableFunction = (position: SimpleTransform, scale: SimpleTransform, rotation: SimpleTransform) => {
  //     try {
  //       this.addComponentOrReplace(
  //         new Transform({
  //           position: new Vector3(position.x, position.y, position.z),
  //           scale: new Vector3(scale.x, scale.y, scale.z),
  //           rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z),
  //         })
  //       );
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   updateCollider: CallableFunction = (instanceConfig: DCLInstanceConfig) => {
  //     try {
  //       this.withCollisions = instanceConfig.withCollisions;
  //       this.init(configs[this.configId], this);
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   updateDefaultClickEvent: CallableFunction = (newDefaultClickEvent: VLMClickEvent.DCLConfig) => {
  //     try {
  //       this.defaultClickEvent = newDefaultClickEvent;
  //       this.updateClickEvent();
  //     } catch (error) {
  //       throw error;
  //     }
  //   };

  //   updateClickEvent: CallableFunction = (newClickEvent?: VLMClickEvent.DCLConfig) => {
  //     try {
  //       if (newClickEvent !== undefined) {
  //         this.clickEvent = newClickEvent;
  //       }

  //       if (this.clickEvent && this.clickEvent?.synced) {
  //         this.clickEvent = this.defaultClickEvent;
  //       }

  //       const clickEvent = this.clickEvent,
  //         storageRecord = instances[this.sk];

  //       if (!clickEvent || !storageRecord) {
  //         return;
  //       }

  //       const clickEventObj = new VLMClickEvent.DCLConfig(clickEvent, storageRecord);

  //       if (clickEventObj.pointerDownEvent) {
  //         instances[this.sk].addComponentOrReplace(clickEventObj.pointerDownEvent);
  //       } else if (instances[this.sk].getComponentOrNull(OnPointerDown)) {
  //         instances[this.sk].removeComponent(OnPointerDown);
  //       }
  //     } catch (error) {
  //       throw error;
  //     }
  //   };
  // }
  // export class VLMInstanceConfig extends DCLInstanceConfig { }
}
