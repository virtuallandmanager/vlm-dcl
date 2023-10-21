import { VLMClickEvent } from "./VLMClickEvent.component";
import { Emissive, SimpleTransform, Transformable } from "../shared/interfaces";
import { includes } from "../utils";
import { VLMBase } from "./VLMBaseConfig.component";
import { getEntityByName } from "../shared/entity";
import { getModelPath } from "../shared/paths";

export namespace VLMModel {
  export const configs: { [uuid: string]: DCLConfig } = {};
  export const instances: { [uuid: string]: DCLInstanceConfig } = {};

  export class DCLConfig {
    sk: string;
    customId?: string;
    customRendering: boolean;
    parent?: string;
    enabled: boolean;
    instanceIds: string[] = [];
    modelSrc: string;;
    clickEvent?: VLMClickEvent.DCLConfig;

    constructor(config: VLMConfig) {
      this.init(config);
    };

    private init: CallableFunction = (config: VLMConfig) => {
      try {
        this.sk = config.sk;
        this.customId = config.customId;
        this.customRendering = !!config.customRendering;
        this.parent = config.parent;
        this.enabled = config.enabled;
        this.modelSrc = config.modelSrc;
        this.clickEvent = config.clickEvent;

        configs[this.sk] = this;

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

    // just removes the VLMModel.instances from the engine, keeps the material record and instance records so we can bring stuff back
    remove: CallableFunction = () => {
      try {
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId].remove();
        });
      } catch (error) {
        throw error;
      }
    };

    // deletes the material record AND removes the VLMModel.instances from the engine
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

    updateModelSrc: CallableFunction = (modelSrc: string) => {
      try {
        this.modelSrc = modelSrc;
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId].init(this, instances[instanceId]);
        });
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

    createInstance: CallableFunction = (config: VLMInstanceConfig) => {
      if (!includes(this.instanceIds, config.sk)) {
        this.instanceIds.push(config.sk);
      }
      new DCLInstanceConfig(this, config);
      if (config.customId) {
        instances[config.customId] = instances[config.sk];
      }
    };

    deleteInstance: CallableFunction = (instanceId: string) => {
      try {
        log("VLM - DELETING INSTANCE - Step 4", instanceId)
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

  @Component("VLMModelInstance")
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

    constructor(config: DCLConfig, instance: VLMInstanceConfig) {
      super(instance.name || null);
      this.init(config, instance)
    }

    init: CallableFunction = (config: DCLConfig, instance: VLMInstanceConfig) => {
      try {
        this.sk = instance?.sk;
        this.customId = instance?.customId;
        this.parent = instance?.parent || config?.parent;
        this.customRendering = instance?.customRendering;
        this.configId = config?.sk;
        this.position = instance?.position;
        this.scale = instance.scale;
        this.rotation = instance.rotation;
        this.enabled = instance.enabled;
        this.clickEvent = instance.clickEvent;
        this.defaultClickEvent = config.clickEvent;
        instances[this.sk] = this;
        log("VLM - CREATING INSTANCE - Step 3", instances && instances[this.sk])
        const model = new GLTFShape(`${getModelPath()}${config.modelSrc}`);
        this.addComponentOrReplace(model);
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
        this.remove();
        delete instances[this.sk];
        if (this.customId) {
          delete instances[this.customId];
        }
      } catch (error) {
        throw error;
      }
    };

    remove: CallableFunction = () => {
      try {
        if (this.isAddedToEngine()) {
          engine.removeEntity(this);
        }
      } catch (error) {
        throw error;
      }
    };

    updateParent: CallableFunction = (parent: string) => {
      try {
        if (parent) {
          this.parent = parent;
          const instanceParent = getEntityByName(parent);
          this.setParent(instanceParent); //// SDK SPECIFIC ////
        } else {
          this.setParent(null); //// SDK SPECIFIC ////
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
        this.customId = customId;
        this.init(configs[this.configId], this);

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
        if (newClickEvent !== undefined) {
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
        } else if (instances[this.sk].getComponentOrNull(OnPointerDown)) {
          instances[this.sk].removeComponent(OnPointerDown);
        }
      } catch (error) {
        throw error;
      }
    };
  }
  export class VLMInstanceConfig extends DCLInstanceConfig { }
}
