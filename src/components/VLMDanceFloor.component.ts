import { Entity } from '@dcl/sdk/ecs'
import { VLMBase } from './VLMBase.component'
import { Vector3, Color4 } from '@dcl/sdk/math'
import { MaterialService } from '../services/Material.service'
import { MeshService } from '../services/Mesh.service'
import { TransformService } from '../services/Transform.service'
import { ecs } from '../environment'
import { VLMDebug } from '../logic/VLMDebug.logic'
import { VLMBaseProperties, VLMClickable, VLMInstanceProperties, VLMInstancedItem, VLMTextureOptions } from '../shared/interfaces'
import { AutoDanceService } from '../services/AutoDance.service'

export type EmoteList = TriggeredEmote[]

export type TriggeredEmote = {
  emote: string
  isCustom?: string
  loop: boolean
}

export namespace VLMDanceFloor {
  export const configs: { [uuid: string]: Config } = {}
  export const instances: { [uuid: string]: Instance } = {}

  export type VLMConfig = VLMBaseProperties & VLMInstancedItem

  /**
   * @public
   * VLM Dance Floor Config: A config for VLMDance Floor components
   *
   * Configs are used to define properties shared by multiple instances, such as materials, textures, files, etc.
   *
   * @param textureOptions - an object of textures for the dance floor
   * @param services - an object of services used by the config
   *
   * @constructor - creates a new config
   * @returns void
   */
  export class Config extends VLMBase.Config {
    debugMode?: boolean = false
    emotes?: EmoteList = []
    interval?: number = 3000
    services: { material: MaterialService; mesh: MeshService; transform: TransformService; autodance: AutoDanceService }
    constructor(config: VLMConfig) {
      super(config)

      Object.assign(this, config)

      VLMDebug.log('Creating Dance Floor Config', config)

      this.services = {
        material: new MaterialService(),
        mesh: new MeshService(),
        transform: new TransformService(),
        autodance: new AutoDanceService(),
      }

      this.services.autodance.setup({ emotes: this.emotes || [], interval: 5000 })
      this.init(config)
    }

    /**
     * @public init
     * Initializes the config
     * @returns void
     */
    init: CallableFunction = (config: VLMConfig) => {
      try {
        Object.assign(this, config)

        configs[this.sk] = this

        if (this.customId) {
          configs[this.customId] = configs[this.sk]
        }

        if (!config.instances || config.instances.length < 1) {
          return
        }

        config.instances.forEach((instance: VLMInstanceProperties) => {
          this.createOrReplaceInstance(instance)
        })
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
        VLMDebug.log(instances)
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId].add()
        })
      } catch (error) {
        throw error
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
          instances[instanceId].remove()
        })
      } catch (error) {
        throw error
      }
    }

    /**
     * @public delete
     * Deletes the config's material record AND removes the config's instances from the engine
     * @returns void
     */
    delete: CallableFunction = () => {
      try {
        delete configs[this.sk]
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId].delete()
        })
      } catch (error) {
        throw error
      }
    }

    /**
     * @public createOrReplaceInstance
     * Creates a new instance of the config
     * @param config - the instance config
     * @returns void
     */
    createOrReplaceInstance: CallableFunction = (config: VLMInstanceProperties) => {
      if (!this.instanceIds.includes(config.sk)) {
        this.instanceIds.push(config.sk)
      }
      //replace instance if it already exists
      if (instances[config.sk]) {
        ecs.engine.removeEntity(instances[config.sk].entity)
        delete instances[config.sk]
      }
      new Instance(this, config)
    }

    /**
     * @public createOrReplaceInstance
     * Creates a new instance of the config
     * @param config - the instance config
     * @returns void
     */
    removeInstance: CallableFunction = (config: Instance) => {
      //replace instance if it already exists
      if (instances[config.sk]) {
        ecs.engine.removeEntity(instances[config.sk].entity)
      }
    }

    /**
     * @public deleteInstance
     * Creates a new instance of the config
     * @param config - the instance config
     * @returns void
     */
    deleteInstance: CallableFunction = (config: Instance) => {
      if (!this.instanceIds.includes(config.sk)) {
        this.instanceIds = this.instanceIds.filter((instanceId: string) => instanceId !== config.sk)
      }
      //replace instance if it already exists
      if (instances[config.sk]) {
        ecs.engine.removeEntity(instances[config.sk].entity)
        delete instances[config.sk]
      }
    }
  }

  /**
   * @public Instance
   * VLM Dance Floor Instance: An instance of a VLMDance Floor config
   *
   * Instances get shared properties from a config while defining their own unique properties, such as position, rotation, scale, etc.
   *
   * @constructor - creates a new instance
   * @returns void
   */
  export class Instance extends VLMBase.Instance {
    constructor(config: Config, instanceConfig: VLMInstanceProperties) {
      super(config, instanceConfig)
      VLMDebug.log('Creating Dance Floor Instance', instanceConfig)
      this.init(config, instanceConfig)
    }

    /**
     * @public init
     * initializes the instance
     * @returns void
     */
    init: CallableFunction = (config: Config, instanceConfig: Instance) => {
      Object.assign(this, instanceConfig)

      instances[this.sk] = this

      if (this.customId) {
        instances[this.customId] = instances[this.sk]
      }

      if (!this.enabled || !config.enabled) {
        return
      }

      config.services.mesh.set(this.entity, 'plane')

      if (config.debugMode) {
        config.services.material.set(this.entity, 'basic', { albedoColor: Color4.create(0, 1, 0, 0.5) })
      }

      // add transform
      config.services.transform.set(this.entity, {
        position: this.position,
        scale: { x: this.scale.x, y: this.scale.y, z: 0 },
        rotation: this.rotation,
        parent: config.parent ? instances[config.parent].entity : undefined,
      })
    }
    /**
     * @public add
     * Adds the instance to the engine
     * @returns void
     */

    add: CallableFunction = () => {
      try {
        if (instances[this.sk]) {
          this.init(configs[this.configId], this)
        }
      } catch (error) {
        throw error
      }
    }

    /**
     * @public remove
     *  Removes the config's instances from the engine, keeps the config and instance records so we can bring stuff back
     *  @returns void
     */
    remove: CallableFunction = () => {
      try {
        ecs.engine.removeEntity(this.entity)
      } catch (error) {
        throw error
      }
    }

    /**
     * @public delete
     * Deletes the config's material record AND removes the config's instances from the engine
     * @returns void
     */
    delete: CallableFunction = () => {
      try {
        ecs.engine.removeEntity(this.entity)
        if (instances[this.sk]) {
          delete instances[this.sk]
        }
      } catch (error) {
        throw error
      }
    }

    /**
     * @public updateTransform
     * Updates the instance's transform
     * @param position - the position of the instance
     * @param scale - the scale of the instance
     * @param rotation - the rotation of the instance
     * @returns void
     *
     */
    updateTransform: CallableFunction = (position?: Vector3, scale?: Vector3, rotation?: Vector3) => {
      const config = configs[this.configId]
      this.position = position || this.position
      this.scale = scale || this.scale
      this.rotation = rotation || this.rotation
      config.services.transform.set(this.entity, {
        position: this.position,
        scale: this.scale,
        rotation: this.rotation,
        parent: this.parent,
      })
    }

    /**
     * @public updateParent
     * Updates the instance's parent
     * @param parent - the parent of the instance
     * @returns void
     *
     */
    updateParent: CallableFunction = (parent: Entity) => {
      const config = configs[this.configId]
      this.parent = parent

      this.updateTransform(this.position, this.scale, this.rotation)
    }
  }
}

type QuickDanceFloorConfig = {
  emotes?: EmoteList
  interval?: number
  position: Vector3
  scale?: Vector3
  rotation?: Vector3
  parent?: Entity
  debug?: boolean
  enabledOnLoad?: boolean
} & VLMClickable

/**
 * Quick creator function for VLMDance Floor Configs
 * @param config - the config object
 * @returns void
 */
export class QuickDanceFloor {
  entity: Entity = ecs.engine.addEntity()
  services: { material: MaterialService; mesh: MeshService; transform: TransformService; autodance: AutoDanceService }
  constructor(config: QuickDanceFloorConfig) {
    this.services = {
      material: new MaterialService(),
      mesh: new MeshService(),
      transform: new TransformService(),
      autodance: new AutoDanceService(),
    }

    if (config.debug) {
      this.services.material.set(this.entity, 'pbr', { albedoColor: Color4.create(0, 1, 0, 0.5) })
    }
    this.services.mesh.set(this.entity, 'box')
    this.services.transform.set(this.entity, {
      position: config.position,
      scale: config.scale || Vector3.create(4, 2, 4),
      rotation: config.rotation || Vector3.create(0, 0, 0),
      parent: config.parent,
    })
    this.services.autodance.addEntity(this.entity)
    this.services.autodance.setup({ emotes: config.emotes || [], delay: config.interval || 5000, enabledOnLoad: config.enabledOnLoad })
  }
}
