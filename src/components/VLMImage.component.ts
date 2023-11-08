import { VLMBase } from "./VLMBaseConfig.component";
import { Material, MeshRenderer, PBMaterial_PbrMaterial, Transform, engine } from "@dcl/sdk/ecs";
import { Quaternion } from "@dcl/sdk/math";

export namespace VLMImage {
  export const configs: { [uuid: string]: Config } = {};
  export const instances: { [uuid: string]: Instance } = {};

  /** 
  * @public
  * VLM Image Config: A config for VLMImage components
  *
  * Configs are used to define properties shared by multiple instances, such as materials, textures, files, etc.
  * 
  * @param textureOptions - an object of textures for the image
  * 
  * @constructor - creates a new config
  * @returns void
  */
  export class Config extends VLMBase.Config {
    textureOptions: PBMaterial_PbrMaterial = {};

    constructor(config: VLMConfig) {
      super(config);
      this.init(config);
    }

    /**
     * @public init
     * Initializes the config
     * @returns void
     */
    init: CallableFunction = (config: VLMConfig) => {
      try {
        Object.assign(this, config);

        this.buildMaterial(config);

        configs[this.sk] = this;

        if (this.customId) {
          configs[this.customId] = configs[this.sk];
        }

        if (this.customRendering || !config.instances || config.instances.length < 1) {
          return;
        }

        config.instances.forEach((instance: Partial<Instance>) => {
          this.createOrReplaceInstance(instance);
        });
      } catch (error) {
        throw error
      }
    }

    /**
     * @public addAll
     * Adds all of the config's instances to the engine
     * @returns void
     */

    addAll: CallableFunction = () => {
      try {
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId].add();
        });
      } catch (error) {
        throw error;
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
    createOrReplaceInstance: CallableFunction = (config: Instance) => {
      if (!this.instanceIds.includes(config.sk)) {
        this.instanceIds.push(config.sk);
      }
      if (instances[config.sk]) {
        engine.removeEntity(instances[config.sk].entity);
        delete instances[config.sk];
      }
      new Instance(this, config);
    };

    /**
     * @public buildMaterials
     * Builds the materials for the config
     * @returns void
     */
    buildMaterial: CallableFunction = (config: VLMConfig) => {
      try {
        const { textureSrc, bumpSrc, emissiveSrc, alphaSrc, emission } = config;

        if (textureSrc) {
          this.textureOptions.texture = Material.Texture.Common({ src: textureSrc });
        }
        if (bumpSrc) {
          this.textureOptions.bumpTexture = Material.Texture.Common({ src: bumpSrc });
        }
        if (emissiveSrc) {
          this.textureOptions.emissiveTexture = Material.Texture.Common({ src: emissiveSrc });
        }
        if (alphaSrc) {
          this.textureOptions.alphaTexture = Material.Texture.Common({ src: alphaSrc });
        }
        if (emission) {
          this.textureOptions.emissiveIntensity = emission;
        }
      } catch (error) {
        throw error;
      }
    }
  }

  export type VLMConfig = Config & VLMBase.VLMConfig & {
    textureSrc?: string, bumpSrc?: string, emissiveSrc?: string, alphaSrc?: string, emission?: number,
  };

  /**
   * @public Instance
   * VLM Image Instance: An instance of a VLMImage config
   * 
   * Instances get shared properties from a config while defining their own unique properties, such as position, rotation, scale, etc.
   * 
   * @constructor - creates a new instance
   * @returns void
    */
  export class Instance extends VLMBase.Instance {
    constructor(config: Config, instanceConfig: Instance) {
      super(config, instanceConfig);
    }

    /**
     * @public init
     * initializes the instance
     * @returns void
     */
    init: CallableFunction = (config: Config, instanceConfig: Instance) => {
      Object.assign(this, instanceConfig);

      instances[this.sk] = this;

      MeshRenderer.setPlane(this.entity);

      Material.setPbrMaterial(this.entity, config.textureOptions);

      Transform.createOrReplace(this.entity, {
        position: this.position,
        scale: this.scale,
        rotation: Quaternion.fromEulerDegrees(this.rotation.x, this.rotation.y, this.rotation.z)
      });

      if (this.customId) {
        instances[this.customId] = instances[this.sk];
      }
    }
    /**
     * @public add
     * Adds the instance to the engine
     * @returns void
     */

    add: CallableFunction = () => {
      try {
        if (instances[this.sk]) {
          engine.addEntity();
        }
      } catch (error) {
        throw error;
      }
    }

    /** 
     * @public remove
     *  Removes the config's instances from the engine, keeps the config and instance records so we can bring stuff back
     *  @returns void
     */
    remove: CallableFunction = () => {
      try {

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
        if (instances[this.sk]) {
          engine.removeEntity(instances[this.sk].entity);
          delete instances[this.sk];
        }
      } catch (error) {
        throw error;
      }
    };
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
