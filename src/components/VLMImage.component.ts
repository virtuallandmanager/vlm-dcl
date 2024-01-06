import { Entity } from '@dcl/sdk/ecs'
import { VLMBase } from './VLMBase.component'
import { PBMaterial_PbrMaterial } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { MaterialService } from '../services/Material.service'
import { MeshService } from '../services/Mesh.service'
import { TransformService } from '../services/Transform.service'
import { ClickEventService } from '../services/ClickEvent.service'
import { VLMClickEvent } from './VLMClickEvent.component'
import { ColliderService } from '../services/Collider.service'
import { ecs } from '../environment'
import { VLMDebug } from '../logic/VLMDebug.logic'
import { TextureType, VLMBaseProperties, VLMClickable, VLMInstanceProperties, VLMInstancedItem, VLMTextureOptions } from '../shared/interfaces'

export namespace VLMImage {
  export const configs: { [uuid: string]: Config } = {}
  export const instances: { [uuid: string]: Instance } = {}

  export type VLMConfig = VLMBaseProperties & VLMClickable & VLMTextureOptions & VLMInstancedItem

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
   * VLM Image Config: A config for VLMImage components
   *
   * Configs are used to define properties shared by multiple instances, such as materials, textures, files, etc.
   *
   * @param textureOptions - an object of textures for the image
   * @param services - an object of services used by the config
   *
   * @constructor - creates a new config
   * @returns void
   */
  export class Config extends VLMBase.Config {
    textureType: TextureType = TextureType.BASIC
    textureOptions: PBMaterial_PbrMaterial = {}
    services: { material: MaterialService; mesh: MeshService; collider: ColliderService; transform: TransformService; clickEvent: ClickEventService }
    constructor(config: VLMConfig) {
      super(config)
      VLMDebug.log('Creating Image Config', config)
      this.services = {
        material: new MaterialService(),
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
    init: CallableFunction = (config: VLMConfig) => {
      try {
        Object.assign(this, config)

        this.textureOptions = this.services.material.buildOptions(config)

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
   * VLM Image Instance: An instance of a VLMImage config
   *
   * Instances get shared properties from a config while defining their own unique properties, such as position, rotation, scale, etc.
   *
   * @constructor - creates a new instance
   * @returns void
   */
  export class Instance extends VLMBase.Instance {
    constructor(config: Config, instanceConfig: VLMInstanceProperties) {
      super(config, instanceConfig)
      VLMDebug.log('Creating Image Instance', instanceConfig)
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
      config.services.material.set(this.entity, config.textureType, { ...config.textureOptions })

      const withCollisions = this.withCollisions || config.withCollisions
      config.services.collider.set(this.entity, 'plane', withCollisions, !!this.clickEvent)

      // add transform
      config.services.transform.set(this.entity, {
        position: this.position,
        scale: { x: this.scale.x, y: this.scale.y, z: 0.01 },
        rotation: this.rotation,
        parent: config.parent ? instances[config.parent].entity : undefined,
      })

      // add click event
      if (!this.clickEvent || this.clickEvent?.synced) {
        config.services.clickEvent.set(this.entity, this.defaultClickEvent)
      } else {
        config.services.clickEvent.set(this.entity, this.clickEvent)
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

export type QuickImageConfig = {
  path: string
  position: Vector3
  scale?: Vector3
  rotation?: Vector3
  colliders?: boolean
  parent?: Entity
} & VLMClickable

/**
 * Quick creator function for VLMImage Configs
 * @param config - the config object
 * @returns void
 */
export class QuickImage {
  entity: Entity = ecs.engine.addEntity()
  services: { material: MaterialService; mesh: MeshService; collider: ColliderService; transform: TransformService; clickEvent: ClickEventService }
  constructor(config: QuickImageConfig) {
    this.services = {
      material: new MaterialService(),
      mesh: new MeshService(),
      collider: new ColliderService(),
      transform: new TransformService(),
      clickEvent: new ClickEventService(),
    }

    const textureOptions = this.services.material.buildOptions({ textureSrc: config.path })
    this.services.material.set(this.entity, 'basic', textureOptions)
    this.services.mesh.set(this.entity, 'plane')
    this.services.collider.set(this.entity, 'plane', config.colliders, !!config.clickEvent)
    this.services.transform.set(this.entity, {
      position: config.position,
      scale: config.scale || Vector3.create(1, 1, 0.01),
      rotation: config.rotation || Vector3.create(0, 0, 0),
      parent: config.parent,
    })
    this.services.clickEvent.set(this.entity, config.clickEvent)
  }
}
