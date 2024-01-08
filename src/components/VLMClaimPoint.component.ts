import { Entity, Material, EntityState, ColliderLayer, EasingFunction, Tween, TweenLoop, MaterialTransparencyMode } from '@dcl/sdk/ecs'
import { Vector3, Color3, Color4, Quaternion } from '@dcl/sdk/math'
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
import defaultMessages from '../messages/giveaway'
import { VLMClaimEvent } from './VLMSystemEvents.component'
import { VLMClaimPointManager } from '../logic/VLMClaimPoint.logic'

export namespace VLMClaimPoint {
  export const configs: { [uuid: string]: VLMClaimPoint.Config } = {}
  export const instances: { [uuid: string]: VLMClaimPoint.Instance } = {}
  const boothLightImageBase64 =
    'data:image/png;base64,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'

  export type VLMConfig = VLMBaseProperties & VLMClickable & VLMTextureOptions & VLMInstancedItem

  export class Config extends VLMBase.Config {
    services: { material: MaterialService; mesh: MeshService; collider: ColliderService; transform: TransformService; clickEvent: ClickEventService }
    messageOptions?: VLMNotification.MessageOptions
    giveawayId: string = ''
    properties: ClaimPointProperties = {}
    messages: typeof defaultMessages = defaultMessages
    hasCustomFunctions: boolean = false
    disableDefaults: boolean = false
    customFunctions?: CustomFunctions
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

    claim: CallableFunction = async () => {
      const giveawayId = this.giveawayId

      if (!VLMSessionManager.sessionData.hasConnectedWeb3 && this.customFunctions?.noWallet) {
        this.customFunctions.noWallet()
        return
      } else if (!VLMSessionManager.sessionData.hasConnectedWeb3 && !this.customFunctions?.noWallet) {
        VLMNotificationManager.addMessage(messages.noWallet)
        return
      } else if (this.requestInProgress && VLMNotificationManager.messageQueue.length < 1 && !this.hasCustomFunctions) {
        VLMNotificationManager.addMessage(messages.claimInProgress)
        return
      } else if (this.requestInProgress && VLMNotificationManager.messageQueue.length > 0) {
        return
      }
      this.requestInProgress = true

      if (!this.hasCustomFunctions) {
        VLMNotificationManager.addMessage(messages.claimSubmitted, { delay: 0.5 })
      } else if (this.customFunctions?.claimSubmitted) {
        this.customFunctions.claimSubmitted()
      }

      VLMEventManager.events.emit('VLMClaimEvent', { action: 'giveaway_claim', giveawayId, sk: this.sk || '' })
    }

    runClaimFunction: CallableFunction = (response: VLMClaimPoint.ClaimResponse) => {
      VLMDebug.log('info', 'VLMClaimPoin.runClaimFunction', response)

      const claimPoint = VLMClaimPoint.configs[response.sk],
        messageOptions = claimPoint.messageOptions || null,
        messages = claimPoint.messages

      if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_ACCEPTED && this.customFunctions?.successfulClaim) {
        this.customFunctions.successfulClaim()
      } else if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_SERVER_ERROR && this.customFunctions?.errorMessage) {
        this.customFunctions.errorMessage()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.BEFORE_EVENT_START && this.customFunctions?.beforeEventTime) {
        this.customFunctions.beforeEventTime()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.AFTER_EVENT_END && this.customFunctions?.afterEventTime) {
        this.customFunctions.afterEventTime()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.EXISTING_WALLET_CLAIM && this.customFunctions?.existingClaim) {
        this.customFunctions.existingClaim()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.CLAIM_COMPLETE && this.customFunctions?.claimComplete) {
        this.customFunctions.claimComplete()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_IP_LIMIT && this.customFunctions?.ipLimitReached) {
        this.customFunctions.ipLimitReached()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.SUPPLY_DEPLETED && this.customFunctions?.noSupply) {
        this.customFunctions.noSupply()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.INAUTHENTIC && this.customFunctions?.inauthenticConnection) {
        this.customFunctions.inauthenticConnection()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.NO_LINKED_EVENTS && this.customFunctions?.noLinkedEvents) {
        this.customFunctions.noLinkedEvents()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.PAUSED && this.customFunctions?.paused) {
        this.customFunctions.paused()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_DAILY_LIMIT && this.customFunctions?.dailyLimitReached) {
        this.customFunctions.dailyLimitReached()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_WEEKLY_LIMIT && this.customFunctions?.otherLimitReached) {
        this.customFunctions.otherLimitReached()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_MONTHLY_LIMIT && this.customFunctions?.otherLimitReached) {
        this.customFunctions.otherLimitReached()
      } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_YEARLY_LIMIT && this.customFunctions?.otherLimitReached) {
        this.customFunctions.otherLimitReached()
      } else if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_DENIED && this.customFunctions?.claimDenied) {
        this.customFunctions.claimDenied()
      } else if (!this.disableDefaults) {
        VLMClaimPointManager.showMessage(response, messageOptions, messages)
      }
    }
  }

  export const setClaimFunctions: CallableFunction = (customId: string, claimFunctions: CustomFunctions, options?: { disableDefaults: boolean }) => {
    if (customId && claimFunctions && configs[customId]) {
      configs[customId].hasCustomFunctions = true
    } else {
      configs[customId].hasCustomFunctions = false
      return
    }

    const config = configs[customId],
      originalConfig = configs[config.sk]

    config.disableDefaults = !!options?.disableDefaults
    config.customFunctions = claimFunctions
    originalConfig.customFunctions = claimFunctions
  }

  export class Instance extends VLMBase.Instance {
    kioskEntities: {
      topEntity?: Entity
      glassEntity?: Entity
      baseEntity?: Entity
      baseTopEntity?: Entity
      baseBottomEntity?: Entity
      buttonEntity?: Entity
      buttonHousingEntity?: Entity
      boothLightEntity?: Entity
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

      if (config.customRendering || !config.enabled || !this.enabled) {
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

      if (this.properties.enableKiosk && this.properties.enableSpin) {
        this.spinClaimItem()
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
          if (ecs.engine.getEntityState(entity) === EntityState.UsedEntity) {
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

      this.claimItemEntity = this.claimItemEntity || ecs.engine.addEntity()

      if (this.properties.type == ClaimPointType.MODEL && this.properties.modelSrc) {
        config.services.mesh.set(this.claimItemEntity, 'gltf', {
          src: `${getModelPath(this.properties.modelSrc)}`,
        })
        config.services.transform.set(this.claimItemEntity, {
          position: {
            x: 0,
            y: 0,
            z: 0,
          },
          scale: {
            x: 1,
            y: 1,
            z: 1,
          },
          rotation: { x: 0, y: 0, z: 0 },
          parent: this.entity,
        })
      } else if (this.properties.type == ClaimPointType.CUSTOM_IMAGE && this.properties.imgSrc) {
        const texture = Material.Texture.Common({ src: this.properties.imgSrc })
        config.services.mesh.set(this.claimItemEntity, 'plane')
        config.services.collider.set(this.claimItemEntity, 'plane', true, true)
        config.services.material.set(this.claimItemEntity, 'basic', {
          texture: texture,
          emissiveTexture: texture,
          albedoColor: Color4.White(),
          emissiveColor: Color4.White(),
          emissiveIntensity: 2,
        })
      }

      if (!this.properties.enableKiosk && this.properties.type == ClaimPointType.CUSTOM_IMAGE) {
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
      }

      if (!this.properties.enableKiosk || !this.properties.enableButton) {
        config.services.clickEvent.setCustomDown(this.claimItemEntity, { hoverText }, async () => {
          await config.claim()
        })
      } else {
        config.services.clickEvent.clearAll(this.claimItemEntity)
      }
    }

    spinClaimItem: CallableFunction = () => {
      if (!this.claimItemEntity) {
        return
      }
      ecs.Tween.createOrReplace(this.claimItemEntity, {
        mode: Tween.Mode.Rotate({
          start: Quaternion.fromEulerDegrees(0, 0, 0),
          end: Quaternion.fromEulerDegrees(0, 180, 0),
        }),
        duration: 3000,
        easingFunction: EasingFunction.EF_LINEAR,
      })
      ecs.TweenSequence.createOrReplace(this.claimItemEntity, {
        loop: TweenLoop.TL_RESTART,
        sequence: [
          {
            mode: Tween.Mode.Rotate({
              start: Quaternion.fromEulerDegrees(0, 180, 0),
              end: Quaternion.fromEulerDegrees(0, 360, 0),
            }),
            duration: 3000,
            easingFunction: EasingFunction.EF_LINEAR,
          },
        ],
      })
    }

    generateStandardBooth: CallableFunction = () => {
      const objThis = this,
        config = configs[this.configId]

      const { color1, color2, color3, hoverText } = this.properties,
        primaryColor = color1 ? Color4.create(color1.r / 255, color1.g / 255, color1.b / 255, color1.a) : Color4.White(),
        secondaryColor = color2 ? Color4.create(color2.r / 255, color2.g / 255, color2.b / 255, color2.a) : Color4.White(),
        glassColor = color3 ? Color4.create(color3.r / 255, color3.g / 255, color3.b / 255, color3.a) : Color4.White()

      this.kioskEntities.baseEntity = this.kioskEntities.baseEntity || ecs.engine.addEntity()
      this.kioskEntities.topEntity = this.kioskEntities.topEntity || ecs.engine.addEntity()
      this.kioskEntities.baseTopEntity = this.kioskEntities.baseTopEntity || ecs.engine.addEntity()
      this.kioskEntities.baseBottomEntity = this.kioskEntities.baseBottomEntity || ecs.engine.addEntity()
      this.kioskEntities.glassEntity = this.kioskEntities.glassEntity || ecs.engine.addEntity()

      if (this.properties.enableButton) {
        this.generateClaimButton()
      }
      if (this.properties.enableLight || true) {
        this.generateBoothLight()
      }

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
        scale: Vector3.create(-0.85, 1, 0.85),
        rotation: { x: 0, y: 90, z: 0 },
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

      const baseTexture = objThis.properties?.kioskImgSrc && Material.Texture.Common({ src: objThis.properties.kioskImgSrc })
      config.services.material.set(this.kioskEntities.baseEntity, 'pbr', {
        texture: baseTexture,
        emissiveTexture: baseTexture,
        emissiveColor: Color3.create(primaryColor.r, primaryColor.g, primaryColor.b),
        albedoColor: primaryColor,
        // emissiveIntensity: 1.75,
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
        emissiveColor: Color3.create(glassColor.r, glassColor.g, glassColor.b),
        reflectivityColor: Color3.White(),
        specularIntensity: 10,
        metallic: 1,
        roughness: 0.05,
        emissiveIntensity: 0.1,
      })

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

      if (!this.properties.enableButton) {
        config.services.clickEvent.setCustomDown(this.kioskEntities.baseEntity, { hoverText }, async () => {
          await config.claim()
        })

        config.services.clickEvent.setCustomDown(this.kioskEntities.baseTopEntity, { hoverText }, async () => {
          await config.claim()
        })

        config.services.clickEvent.setCustomDown(this.kioskEntities.glassEntity, { hoverText }, async () => {
          await config.claim()
        })
      } else {
        config.services.clickEvent.clearAll(this.claimItemEntity)
      }
    }

    generateClaimButton: CallableFunction = () => {
      const objThis = this,
        config = configs[this.configId],
        { color2, color4, hoverText } = objThis.properties,
        secondaryColor = color2 ? Color4.create(color2.r / 255, color2.g / 255, color2.b / 255, color2.a) : Color4.White(),
        buttonColor = color4 ? Color4.create(color4.r / 255, color4.g / 255, color4.b / 255, color4.a) : Color4.Red()

      this.kioskEntities.buttonHousingEntity = this.kioskEntities.buttonHousingEntity || ecs.engine.addEntity()
      this.kioskEntities.buttonEntity = this.kioskEntities.buttonEntity || ecs.engine.addEntity()

      config.services.mesh.set(this.kioskEntities.buttonHousingEntity, 'box')
      config.services.mesh.set(this.kioskEntities.buttonEntity, 'box')
      config.services.collider.set(this.kioskEntities.buttonEntity, 'box', false, true)

      config.services.transform.set(this.kioskEntities.buttonHousingEntity, {
        position: Vector3.create(0, 0.98, -0.43),
        scale: Vector3.create(0.15, 0.25, 0.15),
        rotation: { x: -45, y: 0, z: 0 },
        parent: this.entity,
      })
      config.services.transform.set(this.kioskEntities.buttonEntity, {
        position: Vector3.create(0, 0.98, -0.43),
        scale: Vector3.create(0.1, 0.3, 0.1),
        rotation: { x: -45, y: 0, z: 0 },
        parent: this.entity,
      })

      config.services.material.set(this.kioskEntities.buttonHousingEntity, 'pbr', {
        albedoColor: secondaryColor,
        reflectivityColor: Color3.create(secondaryColor.r, secondaryColor.g, secondaryColor.b),
        specularIntensity: 0,
        emissiveIntensity: 0,
      })

      config.services.material.set(this.kioskEntities.buttonEntity, 'pbr', {
        albedoColor: buttonColor,
        emissiveColor: Color3.create(buttonColor.r, buttonColor.g, buttonColor.b),
        reflectivityColor: Color3.create(buttonColor.r, buttonColor.g, buttonColor.b),
        emissiveIntensity: 0.5,
      })

      config.services.clickEvent.setCustomDown(this.kioskEntities.buttonEntity, { hoverText }, async () => {
        objThis.pressButton()
        await config.claim()
      })
    }

    generateBoothLight: CallableFunction = () => {
      const objThis = this,
        config = configs[this.configId],
        { color2, color4, color5, hoverText } = objThis.properties,
        secondaryColor = color2 ? Color4.create(color2.r / 255, color2.g / 255, color2.b / 255, color2.a) : Color4.White(),
        buttonColor = color4 ? Color4.create(color4.r / 255, color4.g / 255, color4.b / 255, color4.a) : Color4.Red(),
        lightColor = color5 ? Color4.create(color5.r / 255, color5.g / 255, color5.b / 255, color5.a) : Color4.create(1, 1, 1, 0.25)

      this.kioskEntities.boothLightEntity = this.kioskEntities.boothLightEntity || ecs.engine.addEntity()

      config.services.mesh.set(this.kioskEntities.boothLightEntity, 'cylinder', { radiusTop: 0.35, radiusBottom: 0.15 })

      config.services.transform.set(this.kioskEntities.boothLightEntity, {
        position: Vector3.create(0, 1.5, 0),
        scale: Vector3.create(1, 2, 1),
        rotation: { x: 0, y: 0, z: 0 },
        parent: this.entity,
      })

      const lightTexture = Material.Texture.Common({ src: boothLightImageBase64 })

      config.services.material.set(this.kioskEntities.boothLightEntity, 'pbr', {
        texture: lightTexture,
        emissiveTexture: lightTexture,
        alphaTexture: lightTexture,
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND,
        albedoColor: lightColor,
        emissiveColor: Color3.create(lightColor.r, lightColor.g, lightColor.b),
        emissiveIntensity: 2,
      })
    }

    pressButton: CallableFunction = () => {
      ecs.Tween.createOrReplace(this.kioskEntities.buttonEntity, {
        mode: Tween.Mode.Scale({
          start: Vector3.create(0.1, 0.3, 0.1),
          end: Vector3.create(0.1, 0.255, 0.1),
        }),
        duration: 200,
        easingFunction: EasingFunction.EF_LINEAR,
      })

      ecs.TweenSequence.createOrReplace(this.kioskEntities.buttonEntity, {
        sequence: [
          {
            duration: 200,
            easingFunction: EasingFunction.EF_LINEAR,
            mode: Tween.Mode.Scale({
              start: Vector3.create(0.1, 0.255, 0.1),
              end: Vector3.create(0.1, 0.3, 0.1),
            }),
          },
        ],
      })
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

  export enum ClaimStatus {
    PENDING = 'pending',
    QUEUED = 'queued',
    IN_PROGRESS = 'in_progress',
    COMPLETE = 'complete',
  }

  export enum ClaimRejection {
    PAUSED = 'paused',
    BEFORE_EVENT_START = 'before_event_start',
    AFTER_EVENT_END = 'after_event_end',
    EXISTING_WALLET_CLAIM = 'existing_wallet_claim',
    CLAIM_COMPLETE = 'claim_complete',
    SUPPLY_DEPLETED = 'supply_depleted',
    INAUTHENTIC = 'inauthentic',
    SUSPICIOUS = 'suspicious',
    NO_LINKED_EVENTS = 'no_linked_events',
    OVER_IP_LIMIT = 'over_ip_limit',
    OVER_DAILY_LIMIT = 'over_daily_limit',
    OVER_WEEKLY_LIMIT = 'over_weekly_limit',
    OVER_MONTHLY_LIMIT = 'over_monthly_limit',
    OVER_YEARLY_LIMIT = 'over_yearly_limit',
    OVER_LIMIT = 'over_limit',
  }

  export enum ClaimResponseType {
    CLAIM_ACCEPTED = 'claim_accepted',
    CLAIM_DENIED = 'claim_denied',
    CLAIM_IN_PROGRESS = 'claim_in_progress',
    CLAIM_SERVER_ERROR = 'claim_server_error',
  }

  export interface ClaimPointProperties {
    enableKiosk?: boolean
    enableSpin?: boolean
    enableButton?: boolean
    enableLight?: boolean
    type?: ClaimPointType
    imgSrc?: string
    modelSrc?: string
    mannequinType?: MannequinType
    hoverText?: string
    color1?: { r: number; g: number; b: number; a: number }
    color2?: { r: number; g: number; b: number; a: number }
    color3?: { r: number; g: number; b: number; a: number }
    color4?: { r: number; g: number; b: number; a: number }
    color5?: { r: number; g: number; b: number; a: number }
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

  export type CustomFunctions = {
    // Message displayed when the user has no wallet connected
    noWallet: CallableFunction

    // Message displayed while the claim is being processed:
    claimSubmitted: CallableFunction

    // Message displayed while the claim is being processed:
    claimInProgress: CallableFunction

    // Message displayed after a successful claim:
    successfulClaim: CallableFunction

    // Message displayed if the current time is before the event starts:
    beforeEventTime: CallableFunction

    // Message displayed if the event has ended:
    afterEventTime: CallableFunction

    // Message displayed if someone tries to hit claim again after already making a claim:
    existingClaim: CallableFunction

    // Message displayed if someone tries to hit claim again after their wearable was already delivered:
    claimComplete: CallableFunction

    // Message displayed if a daily limit has been reached:
    dailyLimitReached: CallableFunction

    // Message displayed if a daily limit has been reached:
    otherLimitReached: CallableFunction

    // Message displayed if someone has reached the limit for claims from one IP address:
    ipLimitReached: CallableFunction

    // Message displayed if all items have been claimed:
    noSupply: CallableFunction

    // Message displayed if the server detects a VPN connection or other ways to circumvent the IP limit:
    inauthenticConnection: CallableFunction

    // Message displayed if the server cannot find a linked event for the giveaway:
    noLinkedEvents: CallableFunction

    // Message displayed if the giveaway is paused:
    paused: CallableFunction

    // Generic default message displayed if the server rejects the claim for some other reason:
    claimDenied: CallableFunction

    // Message displayed when some sort of error occurs on the back end:
    errorMessage: CallableFunction
  }
}
