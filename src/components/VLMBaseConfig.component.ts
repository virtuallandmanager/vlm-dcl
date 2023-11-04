import { Schemas, engine } from "@dcl/sdk/ecs";

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
  * 
  */
  export const Config = engine.defineComponent(
    "VLMBaseConfig",
    {
      id: Schemas.Number,
      sk: Schemas.String,
      enabled: Schemas.Boolean,
      parent: Schemas.String,
      customId: Schemas.String,
      customRendering: Schemas.Boolean,
      name: Schemas.String,
    });

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
  * 
  */

  export const Instance = engine.defineComponent(
    "VLMBaseInstance",
    {
      id: Schemas.Number,
      sk: Schemas.String,
      enabled: Schemas.Boolean,
      parent: Schemas.String,
      customId: Schemas.String,
      customRendering: Schemas.Boolean,
      name: Schemas.String,
      position: Schemas.Vector3,
      rotation: Schemas.Vector3,
      scale: Schemas.Vector3,
    });
}
