import { Entity } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { VLMClickEvent } from './VLMClickEvent.component'
import { MaterialService } from '../services/Material.service'
import { MeshService } from '../services/Mesh.service'
import { VideoService } from '../services/Video.service'
import { TransformService } from '../services/Transform.service'
import { AudioService } from '../services/Audio.service'
import { VLMDebug } from '../logic/VLMDebug.logic'
import { BaseProperties, VLMBaseProperties, VLMClickable, VLMInstanceProperties, VLMMeshOptions } from '../shared/interfaces'
import { ecs } from '../environment'

export namespace VLMBase {
  /**
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
  export class Config implements BaseProperties {
    pk: string
    sk: string
    enabled: boolean
    parent?: string
    customId?: string
    customRendering?: boolean
    name: string
    withCollisions?: boolean
    clickEvent?: VLMClickEvent.Config
    instanceIds: string[] = []
    services: { material?: MaterialService; model?: MeshService; video?: VideoService; transform?: TransformService; audio?: AudioService } = {}

    constructor(config: VLMBaseProperties & VLMClickable & VLMMeshOptions) {
      this.pk = config.pk
      this.sk = config.sk
      this.enabled = config.enabled
      this.parent = config.parent
      this.customId = config.customId
      this.customRendering = config.customRendering
      this.name = config.name
      this.withCollisions = config.withCollisions
      this.clickEvent = config.clickEvent
      this.instanceIds = config.instances.map((instance: VLMInstanceProperties) => instance.sk)
    }
  }

  /**
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
    entity: Entity
    sk: string
    configId: string
    enabled: boolean
    parent?: string
    customId?: string
    customRendering?: boolean
    name: string
    defaultClickEvent?: VLMClickEvent.Config
    clickEvent?: VLMClickEvent.Config
    withCollisions?: boolean
    position: Vector3
    scale: Vector3
    rotation: Vector3

    constructor(config: Config, instance: VLMInstanceProperties) {
      this.entity = ecs.engine.addEntity()
      this.sk = instance.sk
      this.configId = config.sk
      this.enabled = instance.enabled
      this.parent = instance.parent || config.parent
      this.customId = instance.customId
      this.customRendering = instance.customRendering
      this.name = instance.name
      this.defaultClickEvent = config.clickEvent
      this.clickEvent = instance.clickEvent
      this.withCollisions = instance.withCollisions || config.withCollisions
      this.position = instance.position
      this.scale = instance.scale
      this.rotation = instance.rotation
      VLMDebug.log('Created Base Instance', this.entity, config.pk)
    }
  }
}

export type QuickNullConfig = {
  position: Vector3
  scale?: Vector3
  rotation?: Vector3
  colliders?: boolean
  parent?: Entity
} & VLMClickable

/**
 * Quick creator function for VLMMesh Configs
 * @param config - the config object
 * @returns void
 *
 *
 */
export class QuickNull {
  entity: Entity = ecs.engine.addEntity()
  services: { transform: TransformService }
  constructor(config: QuickNullConfig) {
    this.services = {
      transform: new TransformService(),
    }
    this.services.transform.set(this.entity, {
      position: config.position,
      scale: config.scale || Vector3.create(1, 1, 1),
      rotation: config.rotation || Vector3.create(0, 0, 0),
    })
  }
}