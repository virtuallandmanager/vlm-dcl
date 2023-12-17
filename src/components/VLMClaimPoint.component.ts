import { Entity, Transform, PBPointerEventsResult, InputAction, Material, engine, EntityState } from '@dcl/sdk/ecs'
import { Vector3, Color4 } from '@dcl/sdk/math'
import { ecs } from '../environment'
import messages from '../messages/giveaway'
import { VLMNotificationManager } from '../logic/VLMNotification.logic'
import { VLMNotification } from './VLMNotification.component'
import { VLMSessionManager } from '../logic/VLMSession.logic'
import { VLMEventManager } from '../logic/VLMSystemEvents.logic'
import { getModelPath } from '../shared/paths'
import { VLMBase } from './VLMBase.component'
import { VLMBaseProperties, VLMClickable, VLMInstanceProperties, VLMInstancedItem, VLMTextureOptions } from '../shared/interfaces'
import { MaterialService } from '../services/Material.service'
import { MeshService } from '../services/Mesh.service'
import { TransformService } from '../services/Transform.service'
import { ColliderService } from '../services/Collider.service'
import { ClickEventService } from '../services/ClickEvent.service'
import { VLMDebug } from '../logic/VLMDebug.logic'
import { VLMQuaternion } from '../shared/maths'

export namespace VLMClaimPoint {
  export const configs: { [uuid: string]: VLMClaimPoint.Config } = {}
  export const instances: { [uuid: string]: VLMClaimPoint.Instance } = {}

  export type VLMConfig = VLMBaseProperties & VLMClickable & VLMTextureOptions & VLMInstancedItem

  export class Config extends VLMBase.Config {
    services: { material: MaterialService; mesh: MeshService; collider: ColliderService; transform: TransformService; clickEvent: ClickEventService }
    messageOptions?: VLMNotification.MessageOptions
    giveawayId: string = ''
    properties: ClaimPointProperties = {}
    public requestInProgress: boolean = false

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
        instances[config.sk].remove()
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
        instances[config.sk].delete()
      }
    }
  }

  export class Instance extends VLMBase.Instance {
    kioskEntities: {
      topEntity?: Entity
      glassEntity?: Entity
      baseEntity?: Entity
      baseTopEntity?: Entity
      baseBottomEntity?: Entity
    } = {}
    claimItemEntity?: Entity
    entity: Entity = ecs.engine.addEntity()
    properties: ClaimPointProperties = {}

    constructor(config: Config, instance: VLMInstanceProperties) {
      super(config, instance)
      this.init(config, instance)
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

      if (!this.properties) {
        this.properties = config.properties
      }

      if (!config.enabled || !this.enabled) {
        this.remove()
        return
      }

      config.services.transform.set(this.entity, {
        position: this.position,
        scale: this.scale,
        rotation: this.rotation,
      })

      this.generateClaimItem()

      if (this.properties.enableKiosk) {
        this.generateStandardBooth()
      } else {
        this.removeKiosk()
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
     *  Removes the instance from the engine, keeps the config and instance records so we can bring stuff back
     *  @returns void
     */
    remove: CallableFunction = () => {
      try {
        ecs.engine.removeEntity(this.entity)
        ecs.engine.removeEntity(this.claimItemEntity)
        this.removeKiosk()
      } catch (error) {
        throw error
      }
    }

    /**
     * @public removeKiosk
     *  Removes the instance's kiosk from the engine, keeps the config and instance records so we can bring stuff back
     *  @returns void
     */
    removeKiosk: CallableFunction = () => {
      try {
        Object.entries(this.kioskEntities).forEach(([key, entity]: [string, Entity]) => {
          if (ecs.engine.getEntityState(entity) !== EntityState.UsedEntity) {
            ecs.engine.removeEntity(entity)
          }
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
        this.remove()
        if (instances[this.sk]) {
          delete instances[this.sk]
        }
      } catch (error) {
        throw error
      }
    }

    generateClaimItem: CallableFunction = () => {
      const objThis = this,
        config = configs[this.configId],
        { hoverText } = this.properties

      if (!objThis.enabled) {
        return
      }

      this.claimItemEntity = ecs.engine.addEntity()

      if (this.properties.type == ClaimPointType.MODEL && this.properties.modelSrc) {
        config.services.mesh.set(this.claimItemEntity, 'gltf', { src: `${getModelPath(this.properties.modelSrc)}` })
      } else if (this.properties.type == ClaimPointType.CUSTOM_IMAGE && this.properties.imgSrc) {
        config.services.mesh.set(this.claimItemEntity, 'plane')
        config.services.collider.set(this.claimItemEntity, 'plane', true, true)
        config.services.material.set(this.claimItemEntity, 'basic', {
          texture: Material.Texture.Common({ src: this.properties.imgSrc }),
        })
      }

      config.services.transform.set(this.claimItemEntity, {
        position: {
          x: 0,
          y: 1 + (this.properties.itemYOffset || 0),
          z: 0,
        },
        scale: {
          x: this.scale.x * (this.properties.itemScale || 1),
          y: this.scale.y * (this.properties.itemScale || 1),
          z: this.properties.type == ClaimPointType.CUSTOM_IMAGE ? 0.01 : this.scale.z * (this.properties.itemScale || 1),
        },
        rotation: { x: 0, y: 0, z: 0 },
        parent: this.entity,
      })

      config.services.clickEvent.setCustom(this.claimItemEntity, { hoverText }, async () => {
        await objThis.claim()
      })
    }

    generateStandardBooth: CallableFunction = () => {
      const objThis = this,
        config = configs[this.configId]

      if (!objThis.enabled) {
        return
      }
      const { color1, color2, color3, hoverText } = this.properties,
        primaryColor = color1 ? Color4.create(color1.r / 255, color1.g / 255, color1.b / 255, color1.a) : Color4.White(),
        secondaryColor = color2 ? Color4.create(color2.r / 255, color2.g / 255, color2.b / 255, color2.a) : Color4.White(),
        glassColor = color3 ? Color4.create(color3.r / 255, color3.g / 255, color3.b / 255, color3.a) : Color4.White()

      this.kioskEntities.baseEntity = this.kioskEntities.baseEntity || ecs.engine.addEntity()
      this.kioskEntities.topEntity = this.kioskEntities.topEntity || ecs.engine.addEntity()
      this.kioskEntities.baseTopEntity = this.kioskEntities.baseTopEntity || ecs.engine.addEntity()
      this.kioskEntities.baseBottomEntity = this.kioskEntities.baseBottomEntity || ecs.engine.addEntity()
      this.kioskEntities.glassEntity = this.kioskEntities.glassEntity || ecs.engine.addEntity()

      config.services.mesh.set(this.kioskEntities.baseEntity, 'cylinder')
      config.services.mesh.set(this.kioskEntities.topEntity, 'cylinder')
      config.services.mesh.set(this.kioskEntities.baseTopEntity, 'cylinder')
      config.services.mesh.set(this.kioskEntities.baseBottomEntity, 'cylinder')
      config.services.mesh.set(this.kioskEntities.glassEntity, 'cylinder')

      config.services.collider.set(this.kioskEntities.baseEntity, 'cylinder', true, true)
      config.services.collider.set(this.kioskEntities.topEntity, 'cylinder', true, true)
      config.services.collider.set(this.kioskEntities.baseTopEntity, 'cylinder', true, true)
      config.services.collider.set(this.kioskEntities.baseBottomEntity, 'cylinder', true, true)
      config.services.collider.set(this.kioskEntities.glassEntity, 'cylinder', true, true)

      config.services.transform.set(this.kioskEntities.baseEntity, {
        position: Vector3.create(0, 0.5, 0),
        scale: Vector3.create(0.85, 1, 0.85),
        rotation: { x: 0, y: -90, z: 0 },
        parent: this.entity,
      })
      config.services.transform.set(this.kioskEntities.topEntity, {
        position: Vector3.create(0, 2.5, 0),
        scale: Vector3.create(1, 0.1, 1),
        rotation: { x: 0, y: 0, z: 0 },
        parent: this.entity,
      })
      config.services.transform.set(this.kioskEntities.baseTopEntity, {
        position: Vector3.create(0, 1, 0),
        scale: Vector3.create(1, 0.1, 1),
        rotation: { x: 0, y: 0, z: 0 },
        parent: this.entity,
      })
      config.services.transform.set(this.kioskEntities.baseBottomEntity, {
        position: Vector3.create(0, 0, 0),
        scale: Vector3.create(1, 0.1, 1),
        rotation: { x: 0, y: 0, z: 0 },
        parent: this.entity,
      })
      config.services.transform.set(this.kioskEntities.glassEntity, {
        position: Vector3.create(0, 1.75, 0),
        scale: Vector3.create(0.85, 1.5, 0.85),
        rotation: { x: 0, y: 0, z: 0 },
        parent: this.entity,
      })

      config.services.material.set(this.kioskEntities.baseEntity, 'pbr', {
        texture: objThis.properties?.kioskImgSrc && Material.Texture.Common({ src: objThis.properties.kioskImgSrc }),
        albedoColor: primaryColor,
      })

      config.services.material.set(this.kioskEntities.topEntity, 'pbr', {
        albedoColor: secondaryColor,
      })

      config.services.material.set(this.kioskEntities.baseTopEntity, 'pbr', {
        albedoColor: secondaryColor,
      })

      config.services.material.set(this.kioskEntities.baseBottomEntity, 'pbr', {
        albedoColor: secondaryColor,
      })

      config.services.material.set(this.kioskEntities.glassEntity, 'pbr', {
        albedoColor: glassColor,
      })

      config.services.clickEvent.setCustom(this.entity, { hoverText }, async () => {
        await objThis.claim()
      })

      config.services.clickEvent.setCustom(this.kioskEntities.glassEntity, { hoverText }, async () => {
        await objThis.claim()
      })
    }

    claim: CallableFunction = async () => {
      const sk = this.sk,
        config = configs[this.configId],
        giveawayId = config.giveawayId

      console.log(sk, giveawayId)

      if (!VLMSessionManager.sessionUser.hasConnectedWeb3) {
        VLMNotificationManager.addMessage(messages.noWallet)
        return
      } else if (config.requestInProgress) {
        VLMNotificationManager.addMessage(messages.claimInProgress)
        return
      }
      config.requestInProgress = true

      VLMNotificationManager.addMessage(messages.claimSubmitted)

      console.log(sk, giveawayId)

      VLMEventManager.events.emit('VLMClaimEvent', { action: 'giveaway_claim', giveawayId, sk: sk || '' })
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
  }

  export interface ClaimResponse {
    sk: string
    giveawayId?: string
    responseType?: ClaimResponseType
    reason?: ClaimRejection
  }

  export enum ClaimRejection {
    PAUSED,
    BEFORE_EVENT_START,
    AFTER_EVENT_END,
    EXISTING_WALLET_CLAIM,
    SUPPLY_DEPLETED,
    INAUTHENTIC,
    SUSPICIOUS,
    NO_LINKED_EVENTS,
    OVER_IP_LIMIT,
    OVER_DAILY_LIMIT,
    OVER_WEEKLY_LIMIT,
    OVER_MONTHLY_LIMIT,
    OVER_YEARLY_LIMIT,
    OVER_LIMIT,
  }

  export enum ClaimResponseType {
    CLAIM_ACCEPTED,
    CLAIM_DENIED,
    CLAIM_IN_PROGRESS,
    CLAIM_SERVER_ERROR,
  }

  export interface ClaimPointProperties {
    enableKiosk?: boolean
    enableSpin?: boolean
    type?: ClaimPointType
    imgSrc?: string
    modelSrc?: string
    mannequinType?: MannequinType
    hoverText?: string
    color1?: { r: number; g: number; b: number; a: number }
    color2?: { r: number; g: number; b: number; a: number }
    color3?: { r: number; g: number; b: number; a: number }
    kioskImgSrc?: string
    itemYOffset?: number
    itemScale?: number
  }
  export enum ClaimPointType {
    MARKETPLACE_IMAGE,
    CUSTOM_IMAGE,
    MODEL,
    MANNEQUIN,
  }

  export enum MannequinType {
    MALE,
    FEMALE,
    MATCH_PLAYER,
  }
}
