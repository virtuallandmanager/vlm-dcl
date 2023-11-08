import { Entity, Schemas, engine } from "@dcl/sdk/ecs";
import { Vector3 } from "~system/EngineApi";
import { VLMClickEvent } from "./VLMClickEvent.component";

export namespace VLMBase {
  /*
  * @public
  * VLM Base Config: A base config for all VLM components
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
  * @param clickEvent - a click event that can be attached to the component
  * @param instanceIds - an array of instanceIds that use this config
  * 
  */
  export class Config {
    sk: string;
    enabled: boolean;
    parent: string;
    customId?: string;
    customRendering?: boolean;
    name: string;
    clickEvent?: VLMClickEvent.Config;
    instanceIds: string[];

    constructor(config: Config & { instances: Instance[] }) {
      this.sk = config.sk;
      this.enabled = config.enabled;
      this.parent = config.parent;
      this.customId = config.customId;
      this.customRendering = config.customRendering;
      this.name = config.name;
      this.instanceIds = config.instances.map((instance: Instance) => instance.sk);
    }
  };

  /*
  * @public
  * VLM Base VLM Config: Extends the base config to include data sent from VLM servers
  * 
  * @param instances - an array of instances set up for this config - these get converted to an array of instanceIds
  */
  export type VLMConfig = Config & { instances: Instance[] };

  export const ConfigSpec = {
    id: Schemas.Number,
    sk: Schemas.String,
    enabled: Schemas.Boolean,
    parent: Schemas.String,
    customId: Schemas.String,
    customRendering: Schemas.Boolean,
    name: Schemas.String,
  }

  /*
  * @public
  * VLM Base Instance: A base instance config for all VLM components
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
  * @param clickEvent - a click event that can be attached to the component
  * @param defaultClickEvent - the default click event that is inherited from the config
  * @param position - the position of the instance
  * @param scale - the scale of the instance
  * @param rotation - the rotation of the instance
  * 
  */

  export class Instance {
    entity: Entity;
    sk: string;
    configId: string;
    enabled: boolean;
    parent: string;
    customId?: string;
    customRendering?: boolean;
    name: string;
    defaultClickEvent?: VLMClickEvent.Config;
    clickEvent?: VLMClickEvent.Config;
    position: Vector3;
    scale: Vector3;
    rotation: Vector3;

    constructor(config: Config, instance: Instance) {
      this.entity = engine.addEntity();
      this.sk = instance.sk;
      this.configId = config.sk;
      this.enabled = instance.enabled;
      this.parent = instance.parent;
      this.customId = instance.customId;
      this.customRendering = instance.customRendering;
      this.name = instance.name;
      this.defaultClickEvent = config.clickEvent;
      this.clickEvent = instance.clickEvent;
      this.position = instance.position;
      this.scale = instance.scale;
      this.rotation = instance.rotation;
    }
  };

  export const InstanceSpec = {
    entity: Schemas.Entity,
    sk: Schemas.String,
    enabled: Schemas.Boolean,
    parent: Schemas.String,
    customId: Schemas.String,
    customRendering: Schemas.Boolean,
    name: Schemas.String,
    position: Schemas.Vector3,
    rotation: Schemas.Vector3,
    scale: Schemas.Vector3,
  }
}
