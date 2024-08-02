import { VLMBase } from './VLMBase.component'
import { Vector3 } from '@dcl/sdk/math'
import { Entity, ColliderLayer } from '@dcl/sdk/ecs'
import { MeshService } from '../services/Mesh.service'
import { TransformService } from '../services/Transform.service'
import { ClickEventService } from '../services/ClickEvent.service'
import { VLMClickEvent } from './VLMClickEvent.component'
import { ColliderService } from '../services/Collider.service'
import { ecs } from '../environment'
import { getModelPath } from '../shared/paths'
import { VLMBaseProperties, VLMClickable, VLMInstanceProperties, VLMInstancedItem, VLMMeshOptions, VLMTransformable } from '../shared/interfaces'
import { VLMDebug } from '../logic/VLMDebug.logic'

export namespace VLMMesh {
  export const configs: { [uuid: string]: Config } = {}
  export const instances: { [uuid: string]: Instance } = {}

  export type VLMConfig = VLMBaseProperties & VLMMeshOptions & VLMClickable & VLMInstancedItem

  export const reset = () => {
    Object.keys(configs).forEach((key: string) => {
      configs[key].delete()
      delete configs[key]
    })
    Object.keys(instances).forEach((key: string) => {
      delete instances[key]
    })
  }

  /**
   * @public
   * VLM Mesh Config: A config for VLMMesh components
   *
   * Configs are used to define properties shared by multiple instances, such as materials, textures, files, etc.
   *
   * @param services - an object of services used by the config
   * @param modelSrc - the path to the model file
   *
   * @constructor - creates a new config
   * @returns void
   */
  export class Config extends VLMBase.Config {
    services: { mesh: MeshService; collider: ColliderService; transform: TransformService; clickEvent: ClickEventService }
    modelSrc: string = ''

    constructor(config: VLMConfig) {
      super(config)
      this.services = {
        mesh: new MeshService(),
        collider: new ColliderService(),
        transform: new TransformService(),
        clickEvent: new ClickEventService(),
      }
      if (config?.instances?.length) {
        config.instances.forEach((instance: VLMInstanceProperties) => {
          this.createOrReplaceInstance(instance)
        })
      }
      if (this.customRendering) {
        this.setStorage(config)
        return
      }
      this.init(config)
    }

    setStorage: CallableFunction = (config: VLMConfig) => {
      try {
        Object.assign(this, config)

        configs[this.sk] = this

        if (this.customId) {
          configs[this.customId] = configs[this.sk]
        }
      } catch (error) {
        throw error
      }
    }

    /**
     * @public init
     * Initializes the config
     * @returns void
     */
    init: CallableFunction = (config?: VLMConfig) => {
      try {
        if (config) {
          this.setStorage(config)
        } else {
          config = this
        }

        if (!config.instances || config?.instances.length < 1) {
          return
        }

        config.instances?.forEach((instance: VLMInstanceProperties) => {
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
    deleteInstance: CallableFunction = (_instanceId: string) => {
      if (!this.instanceIds.includes(_instanceId)) {
        this.instanceIds = this.instanceIds.filter((instanceId: string) => instanceId !== _instanceId)
      }

      //replace instance if it already exists
      if (instances[_instanceId]) {
        ecs.engine.removeEntity(instances[_instanceId].entity)
        delete instances[_instanceId]
      }
    }

    /**
     * @public updateDefaultClickEvent
     * Updates the instance's click event
     * @param clickEvent - the click event of the instance
     * @returns void
     */
    updateDefaultClickEvent: CallableFunction = (clickEvent: VLMClickEvent.Config) => {
      this.instanceIds.forEach((instanceId: string) => {
        instances[instanceId].updateDefaultClickEvent(clickEvent)
      })
    }
  }

  /**
   * @public Instance
   * VLM Mesh Instance: An instance of a VLMMesh config
   *
   * Instances get shared properties from a config while defining their own unique properties, such as position, rotation, scale, etc.
   *
   * @constructor - creates a new instance
   * @returns void
   */
  export class Instance extends VLMBase.Instance {
    constructor(config: Config, instanceConfig: VLMInstanceProperties) {
      super(config, instanceConfig)
      if (!this.customRendering) {
        this.init(config, instanceConfig)
      } else {
        this.setStorage(instanceConfig)
      }
    }

    setStorage: CallableFunction = (config: VLMConfig) => {
      try {
        Object.assign(this, config)

        instances[this.sk] = this

        if (this.customId) {
          instances[this.customId] = instances[this.sk]
        }
      } catch (error) {
        throw error
      }
    }

    /**
     * @public init
     * initializes the instance
     * @returns void
     */
    init: CallableFunction = (config: Config, instanceConfig: VLMInstanceProperties) => {
      this.setStorage(instanceConfig)

      if (!this.enabled || !config.enabled) {
        return
      }

      config.services.mesh.set(this.entity, 'gltf', { src: getModelPath(config.modelSrc) })
      this.updateTransform(this.position, this.scale, this.rotation)
      this.updateClickEvent(this.clickEvent)
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
        rotation: this.rotation || Vector3.create(0, 0, 0),
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

    /**
     * @public updateDefaultClickEvent
     * Updates the instance's default click event
     * @param clickEvent - the click event of the instance
     * @returns void
     */
    updateDefaultClickEvent: CallableFunction = (clickEvent: VLMClickEvent.Config) => {
      this.defaultClickEvent = clickEvent

      this.updateClickEvent()
    }

    /**
     * @public updateClickEvent
     * Updates the instance's click event
     * @param clickEvent - the click event of the instance
     * @returns void
     */
    updateClickEvent: CallableFunction = (clickEvent: VLMClickEvent.Config) => {
      const config = configs[this.configId]
      this.clickEvent = clickEvent || this.clickEvent

      if (!this.clickEvent || this.clickEvent?.synced) {
        config.services.clickEvent.set(this.entity, this.defaultClickEvent)
      } else {
        config.services.clickEvent.set(this.entity, this.clickEvent)
      }
    }
  }
}

export type QuickMeshConfig = {
  path: string
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
export class QuickMesh {
  entity: Entity = ecs.engine.addEntity()
  services: { mesh: MeshService; collider: ColliderService; transform: TransformService; clickEvent: ClickEventService }
  constructor(config: QuickMeshConfig) {
    this.services = {
      mesh: new MeshService(),
      collider: new ColliderService(),
      transform: new TransformService(),
      clickEvent: new ClickEventService(),
    }

    this.services.mesh.set(this.entity, 'gltf', { src: getModelPath(config.path) })
    this.services.transform.set(this.entity, {
      position: config.position,
      scale: config.scale || Vector3.create(1, 1, 1),
      rotation: config.rotation || Vector3.create(0, 0, 0),
      parent: config.parent,
    })

    if (config.clickEvent) {
      this.services.clickEvent.set(this.entity, config.clickEvent)
    }
    if (config.colliders) {
      // this.services.collider.set(this.entity, 'box', true, true)
    }

    console.log('QuickMesh created!', config.clickEvent)
  }
}
