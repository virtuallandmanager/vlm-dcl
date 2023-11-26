import { VLMBase } from './VLMBase.component'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { AudioService } from '../services/Audio.service'
import { TransformService } from '../services/Transform.service'
import { MeshService } from '../services/Mesh.service'
import { MaterialService } from '../services/Material.service'
import { ecs } from '../environment'
import { VLMAudible, VLMBaseProperties, VLMInstanceProperties } from '../shared/interfaces'

export namespace VLMSound {
  export const configs: { [uuid: string]: Config } = {}
  export const instances: { [uuid: string]: Instance } = {}

  export type VLMConfig = VLMBaseProperties & VLMAudible

  /**
   * @public
   * VLM Sound Config: A config for VLMSound components
   *
   * Configs are used to define properties shared by multiple instances, such as materials, textures, files, etc.
   *
   * @param audioOptions - an object of options for the audio source
   * @param services - an object of services used by the config
   *
   * @constructor - creates a new config
   * @returns void
   */
  export class Config extends VLMBase.Config {
    audioOptions: { volume: number } = { volume: 1 }
    services: { audio: AudioService; mesh: MeshService; material: MaterialService; transform: TransformService }
    constructor(config: VLMBaseProperties) {
      super(config)
      this.services = {
        audio: new AudioService(),
        mesh: new MeshService(),
        material: new MaterialService(),
        transform: new TransformService(),
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

        this.audioOptions = this.services.audio.buildOptions(config)

        if (this.customRendering || !config.instances || config.instances.length < 1) {
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

    /**
     * @public toggleLocators
     * Toggles visual locators for the config's instances
     * @returns void
     */
    toggleLocators: CallableFunction = () => {
      try {
        this.instanceIds.forEach((instanceId: string) => {
          instances[instanceId].toggleLocator()
        })
      } catch (error) {
        throw error
      }
    }
  }

  /**
   * @public Instance
   * VLM Sound Instance: An instance of a VLMSound config
   *
   * Instances get shared properties from a config while defining their own unique properties, such as position, rotation, scale, etc.
   *
   * @constructor - creates a new instance
   * @returns void
   */
  export class Instance extends VLMBase.Instance {
    hasLocator: boolean = false
    constructor(config: Config, instanceConfig: VLMInstanceProperties) {
      super(config, instanceConfig)
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

      config.services.audio.set(this.entity, config.audioOptions)
      config.services.mesh.set(this.entity, 'sphere')
      config.services.material.set(this.entity, 'pbr', { albedoColor: Color4.create(0, 0, 0, 0) })

      this.updateTransform(this.position, this.scale, this.rotation)
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
    updateTransform: CallableFunction = (_position?: Vector3, _scale?: Vector3, _rotation?: Vector3) => {
      const position = _position || this.position,
        scale = _scale || this.scale,
        rotation = _rotation || this.rotation

      configs[this.configId].services.transform.set(this.entity, { position, scale: { x: 0.1, y: 0.1, z: 0.1 }, rotation })
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
     * @public toggleLocator
     * Toggles the instance's locator
     * @returns void
     */
    toggleLocator: CallableFunction = () => {
      try {
        if (this.hasLocator) {
          configs[this.configId].services.mesh.clear(this.entity)
          configs[this.configId].services.material.clear(this.entity)
          this.hasLocator = false
        } else {
          const { position, rotation } = this
          configs[this.configId].services.mesh.set(this.entity, 'sphere')
          configs[this.configId].services.material.set(this.entity, 'pbr', { color: Color4.White(), emissiveIntensity: 1 })
          configs[this.configId].services.transform.set(this.entity, { position, scale: { x: 0.1, y: 0.1, z: 0.1 }, rotation })
          this.hasLocator = true
        }
      } catch (error) {
        throw error
      }
    }
  }
}
