import { VLMBase } from './VLMBase.component'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { MeshService } from '../services/Mesh.service'
import { TransformService } from '../services/Transform.service'
import { ClickEventService } from '../services/ClickEvent.service'
import { VLMClickEvent } from './VLMClickEvent.component'
import { ColliderService } from '../services/Collider.service'
import { ecs } from '../environment'
import { getModelPath } from '../shared/paths'
import { VLMBaseProperties, VLMClickable, VLMInstanceProperties, VLMMeshOptions, VLMTransformable } from '../shared/interfaces'

export namespace VLMMesh {
  export const configs: { [uuid: string]: Config } = {}
  export const instances: { [uuid: string]: Instance } = {}

  export type VLMConfig = VLMBaseProperties & VLMMeshOptions & VLMClickable & VLMTransformable

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

    constructor(config: VLMBaseProperties) {
      super(config)
      this.services = {
        mesh: new MeshService(),
        collider: new ColliderService(),
        transform: new TransformService(),
        clickEvent: new ClickEventService(),
      }
      this.init(config)
    }

    /**
     * @public init
     * Initializes the config
     * @returns void
     */
    init: CallableFunction = (config: VLMBaseProperties) => {
      try {
        Object.assign(this, config)

        configs[this.sk] = this

        if (this.customId) {
          configs[this.customId] = configs[this.sk]
        }

        if (!this.enabled || this.customRendering || !config.instances || config.instances.length < 1) {
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
      this.init(config, instanceConfig)
    }

    /**
     * @public init
     * initializes the instance
     * @returns void
     */
    init: CallableFunction = (config: Config, instanceConfig: VLMInstanceProperties) => {
      Object.assign(this, instanceConfig)

      config.services.mesh.set(this.entity, 'gltf', { src: getModelPath(config.modelSrc) })
      this.updateTransform(this.position, this.scale, this.rotation)
      this.updateClickEvent(this.clickEvent)

      instances[this.sk] = this

      if (this.customId) {
        instances[this.customId] = instances[this.sk]
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
        rotation: Quaternion.fromEulerDegrees(this.rotation.x, this.rotation.y, this.rotation.z),
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
    updateParent: CallableFunction = (parent: string) => {
      const config = configs[this.configId]
      this.parent = parent

      this.updateTransform(this.position, this.scale, this.rotation)
    }

    /**
     * @public updateClickEvent
     * Updates the instance's click event
     * @param clickEvent - the click event of the instance
     * @returns void
     */
    updateClickEvent: CallableFunction = (clickEvent: VLMClickEvent.Config) => {
      const config = configs[this.configId]
      this.clickEvent = clickEvent

      config.services.clickEvent.set(this.entity, this.clickEvent)
    }
  }
}
