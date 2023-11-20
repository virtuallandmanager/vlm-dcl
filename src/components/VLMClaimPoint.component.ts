// import { Entity, Transform } from '@dcl/sdk/ecs'
// import { ecs } from '../environment'
// import messages from "../messages/giveaway";
// import { VLMNotificationManager } from "../logic/VLMNotification.logic";
// import { VLMNotification } from "./VLMNotification.component";
// import { VLMSessionManager } from "../logic/VLMSession.logic";
// import { VLMEventManager } from "../logic/VLMSystemEvents.logic";
// import { SimpleTransform } from "../shared/interfaces";
// import { getEntityByName } from "../shared/entity";
// import { getModelPath } from "../shared/paths";

// import { VLMNotification } from './VLMNotification.component'
// import { VLMBase } from './VLMBase.component'
// import { VLMBaseProperties, VLMInstanceProperties } from '../shared/interfaces'
// import { getModelPath } from '../shared/paths'

// export namespace VLMClaimPoint {
//   export const configs: { [uuid: string]: VLMClaimPoint.Config } = {}
//   export const instances: { [uuid: string]: VLMClaimPoint.Instance } = {}

//   export class Config extends VLMBase.Config {
//     sk: string
//     instanceIds: string[] = []

//     messageOptions?: VLMNotification.MessageOptions
//     public requestInProgress: boolean = false
//     constructor(config: VLMConfig) {
//       super(config)
//       this.sk = config.sk || ''
//     }

//     /**
//      * @public addAll
//      * Adds all of the config's instances to the engine
//      * @returns void
//      */

//     addAll: CallableFunction = () => {
//       try {
//         this.instanceIds.forEach((instanceId: string) => {
//           instances[instanceId].add()
//         })
//       } catch (error) {
//         throw error
//       }
//     }

//     /**
//      * @public remove
//      *  Removes the config's instances from the engine, keeps the config and instance records so we can bring stuff back
//      *  @returns void
//      */
//     remove: CallableFunction = () => {
//       try {
//         this.instanceIds.forEach((instanceId: string) => {
//           instances[instanceId].remove()
//         })
//       } catch (error) {
//         throw error
//       }
//     }

//     /**
//      * @public delete
//      * Deletes the config's material record AND removes the config's instances from the engine
//      * @returns void
//      */
//     delete: CallableFunction = () => {
//       try {
//         delete configs[this.sk]
//         this.instanceIds.forEach((instanceId: string) => {
//           instances[instanceId].delete()
//         })
//       } catch (error) {
//         throw error
//       }
//     }

//     /**
//      * @public createOrReplaceInstance
//      * Creates a new instance of the config
//      * @param config - the instance config
//      * @returns void
//      */
//     createOrReplaceInstance: CallableFunction = (config: VLMInstanceProperties) => {
//       if (!this.instanceIds.includes(config.sk)) {
//         this.instanceIds.push(config.sk)
//       }
//       //replace instance if it already exists
//       if (instances[config.sk]) {
//         ecs.engine.removeEntity(instances[config.sk].entity)
//         delete instances[config.sk]
//       }
//       new Instance(this, config)
//     }

//     /**
//      * @public createOrReplaceInstance
//      * Creates a new instance of the config
//      * @param config - the instance config
//      * @returns void
//      */
//     removeInstance: CallableFunction = (config: Instance) => {
//       //replace instance if it already exists
//       if (instances[config.sk]) {
//         ecs.removeEntity(instances[config.sk].entity)
//       }
//     }

//     /**
//      * @public deleteInstance
//      * Creates a new instance of the config
//      * @param config - the instance config
//      * @returns void
//      */
//     deleteInstance: CallableFunction = (config: Instance) => {
//       if (!this.instanceIds.includes(config.sk)) {
//         this.instanceIds = this.instanceIds.filter((instanceId: string) => instanceId !== config.sk)
//       }
//       //replace instance if it already exists
//       if (instances[config.sk]) {
//         ecs.engine.removeEntity(instances[config.sk].entity)
//         delete instances[config.sk]
//       }
//     }
//   }

//   export type VLMConfig = VLMBaseProperties

//   export class Instance extends VLMBase.Instance {
//     kioskEntities: {
//       topEntity?: Entity
//       glassEntity?: Entity
//       baseEntity?: Entity
//       baseTopEntity?: Entity
//       baseBottomEntity?: Entity
//     } = {}
//     claimItemEntity: Entity = ecs.engine.addEntity()
//     properties: ClaimPointProperties = {}

//     constructor(config: Config, instance: VLMInstanceProperties) {
//       super(config, instance)
//     }

//     /**
//      * @public init
//      * initializes the instance
//      * @returns void
//      */
//     init: CallableFunction = (config: Config, instanceConfig: Instance) => {
//       Object.assign(this, instanceConfig)

//       instances[this.sk] = this

//       if (this.customId) {
//         instances[this.customId] = instances[this.sk]
//       }
//     }
//     /**
//      * @public add
//      * Adds the instance to the engine
//      * @returns void
//      */

//     add: CallableFunction = () => {
//       try {
//         if (instances[this.sk]) {
//           this.init(configs[this.configId], this)
//         }
//       } catch (error) {
//         throw error
//       }
//     }

//     /**
//      * @public remove
//      *  Removes the config's instances from the engine, keeps the config and instance records so we can bring stuff back
//      *  @returns void
//      */
//     remove: CallableFunction = () => {
//       try {
//         ecs.engine.removeEntity(this.entity)
//       } catch (error) {
//         throw error
//       }
//     }

//     /**
//      * @public delete
//      * Deletes the config's material record AND removes the config's instances from the engine
//      * @returns void
//      */
//     delete: CallableFunction = () => {
//       try {
//         ecs.engine.removeEntity(this.entity)
//         if (instances[this.sk]) {
//           delete instances[this.sk]
//         }
//       } catch (error) {
//         throw error
//       }
//     }

//     generateClaimItem: CallableFunction = () => {
//       const objThis = this
//       if (!objThis.enabled) {
//         return
//       }
//       this.claimItemEntity.setParent(objThis)
//       if (this.properties.type == ClaimPointType.MODEL && this.properties.modelSrc) {
//         this.claimItemEntity.addComponentOrReplace(new GLTFShape(`${getModelPath(this.properties.modelSrc)}`))
//       } else if (this.properties.type == ClaimPointType.CUSTOM_IMAGE && this.properties.imgSrc) {
//         const plane = new PlaneShape()
//         plane.uvs = [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1]
//         this.claimItemEntity.addComponentOrReplace(plane)
//         const claimImageMat = new Material()
//         const claimImageTexture = new Texture(this.properties.imgSrc)
//         claimImageMat.albedoTexture = claimImageTexture
//         claimImageMat.emissiveTexture = claimImageTexture
//         claimImageMat.emissiveIntensity = 1
//         claimImageMat.emissiveColor = Color3.White()
//         claimImageMat.transparencyMode = TransparencyMode.ALPHA_TEST
//         this.claimItemEntity.addComponentOrReplace(claimImageMat)
//       }

//       // this.claimItemEntity.addComponentOrReplace(
//       //   new OnPointerDown(
//       //     async function () {
//       //       await objThis.claim()
//       //     },
//       //     {
//       //       button: ActionButton.POINTER,
//       //       hoverText: objThis.hoverText || 'Claim Item',
//       //       distance: 5,
//       //     },
//       //   ),
//       // )
//     }

//     generateStandardBooth: CallableFunction = () => {
//       const objThis = this
//       if (!objThis.enabled) {
//         return
//       }
//       this.kioskEntities.topEntity = this.kioskEntities.topEntity || ecs.engine.addEntity()
//       this.kioskEntities.glassEntity = this.kioskEntities.glassEntity || ecs.engine.addEntity()
//       this.kioskEntities.baseEntity = this.kioskEntities.baseEntity || ecs.engine.addEntity()
//       this.kioskEntities.baseTopEntity = this.kioskEntities.baseTopEntity || ecs.engine.addEntity()
//       this.kioskEntities.baseBottomEntity = this.kioskEntities.baseBottomEntity || ecs.engine.addEntity()
//       const { color1, color2, color3 } = this.properties

//       this.kioskEntities.topEntity.setParent(objThis)
//       this.kioskEntities.glassEntity.setParent(objThis)
//       this.kioskEntities.baseEntity.setParent(objThis)
//       this.kioskEntities.baseTopEntity.setParent(objThis)
//       this.kioskEntities.baseBottomEntity.setParent(objThis)

//       const cylinder = new CylinderShape()

//       this.kioskEntities.topEntity.addComponentOrReplace(new CylinderShape())
//       this.kioskEntities.glassEntity.addComponentOrReplace(new CylinderShape())
//       this.kioskEntities.baseEntity.addComponentOrReplace(cylinder)
//       this.kioskEntities.baseTopEntity.addComponentOrReplace(new CylinderShape())
//       this.kioskEntities.baseBottomEntity.addComponentOrReplace(new CylinderShape())

//       this.kioskEntities.glassEntity.addComponentOrReplace(
//         new OnPointerDown(
//           async function () {
//             await objThis.claim()
//           },
//           {
//             button: ActionButton.POINTER,
//             hoverText: objThis.hoverText || 'Claim Item',
//             distance: 5,
//           },
//         ),
//       )

//       const color1Material = new Material()
//       if (objThis.properties?.kioskImgSrc) {
//         const kioskImgTexture = new Texture(objThis.properties?.kioskImgSrc)
//         color1Material.albedoTexture = kioskImgTexture
//         color1Material.emissiveTexture = kioskImgTexture
//         color1Material.emissiveIntensity = 1
//         color1Material.emissiveColor = Color3.White()
//         color1Material.transparencyMode = TransparencyMode.AUTO
//       } else {
//         color1Material.albedoColor = new Color4(color1.r / 255, color1.g / 255, color1.b / 255, color1.a)
//         color1Material.transparencyMode = TransparencyMode.AUTO
//       }

//       const color2Material = new Material()
//       color2Material.albedoColor = new Color4(color2.r / 255, color2.g / 255, color2.b / 255, color2.a)
//       color2Material.transparencyMode = TransparencyMode.AUTO

//       const glassMaterial = new Material()
//       glassMaterial.albedoColor = new Color4(color3.r / 255, color3.g / 255, color3.b / 255, color3.a)
//       glassMaterial.transparencyMode = TransparencyMode.AUTO

//       this.kioskEntities.baseEntity.addComponentOrReplace(color1Material)
//       this.kioskEntities.baseTopEntity.addComponentOrReplace(color2Material)
//       this.kioskEntities.baseBottomEntity.addComponentOrReplace(color2Material)
//       this.kioskEntities.topEntity.addComponentOrReplace(color2Material)
//       this.kioskEntities.glassEntity.addComponentOrReplace(glassMaterial)

//       this.kioskEntities.topEntity.addComponentOrReplace(
//         new Transform({
//           position: new Vector3(0, 2.5, 0),
//           scale: new Vector3(0.6, 0.05, 0.6),
//         }),
//       )

//       this.kioskEntities.glassEntity.addComponentOrReplace(
//         new Transform({
//           position: new Vector3(0, 1.75, 0),
//           scale: new Vector3(0.5, 0.75, 0.5),
//         }),
//       )

//       this.kioskEntities.baseEntity.addComponentOrReplace(
//         new Transform({
//           position: new Vector3(0, 0.5, 0),
//           scale: new Vector3(-0.5, 0.5, 0.5),
//           rotation: Quaternion.Euler(0, 90, 0),
//         }),
//       )

//       this.kioskEntities.baseTopEntity.addComponentOrReplace(
//         new Transform({
//           position: new Vector3(0, 1, 0),
//           scale: new Vector3(0.6, 0.05, 0.6),
//         }),
//       )

//       this.kioskEntities.baseBottomEntity.addComponentOrReplace(
//         new Transform({
//           position: new Vector3(0, 0, 0),
//           scale: new Vector3(0.6, 0.05, 0.6),
//         }),
//       )

//       objThis.addComponentOrReplace(
//         new OnPointerDown(
//           async function () {
//             await objThis.claim()
//           },
//           {
//             button: ActionButton.POINTER,
//             hoverText: objThis.properties.hoverText || 'Claim Item',
//             distance: 5,
//           },
//         ),
//       )
//     }

//     claim: CallableFunction = async () => {
//       const sk = this.sk
//       const giveawayId = this.giveawayId
//       log(sk, giveawayId)
//       if (!VLMSessionManager.sessionUser.hasConnectedWeb3) {
//         VLMNotificationManager.addMessage(messages.noWallet)
//         return
//       } else if (this.requestInProgress) {
//         VLMNotificationManager.addMessage(messages.claimInProgress)
//         return
//       }
//       this.requestInProgress = true

//       VLMNotificationManager.addMessage(messages.claimSubmitted)
//       log(sk, giveawayId)
//       VLMEventManager.events.fireEvent(new VLMClaimEvent({ action: 'giveaway_claim', giveawayId, sk: sk || '' }))
//     }
//   }

//   export interface ClaimResponse {
//     sk: string
//     giveawayId?: string
//     responseType?: ClaimResponseType
//     reason?: ClaimRejection
//   }

//   export enum ClaimRejection {
//     PAUSED,
//     BEFORE_EVENT_START,
//     AFTER_EVENT_END,
//     EXISTING_WALLET_CLAIM,
//     SUPPLY_DEPLETED,
//     INAUTHENTIC,
//     SUSPICIOUS,
//     NO_LINKED_EVENTS,
//     OVER_IP_LIMIT,
//     OVER_DAILY_LIMIT,
//     OVER_WEEKLY_LIMIT,
//     OVER_MONTHLY_LIMIT,
//     OVER_YEARLY_LIMIT,
//     OVER_LIMIT,
//   }

//   export enum ClaimResponseType {
//     CLAIM_ACCEPTED,
//     CLAIM_DENIED,
//     CLAIM_IN_PROGRESS,
//     CLAIM_SERVER_ERROR,
//   }

//   export interface ClaimPointProperties {
//     enableKiosk?: boolean
//     enableSpin?: boolean
//     type?: ClaimPointType
//     imgSrc?: string
//     modelSrc?: string
//     mannequinType?: MannequinType
//     hoverText?: string
//     color1?: { r: number; g: number; b: number; a: number }
//     color2?: { r: number; g: number; b: number; a: number }
//     color3?: { r: number; g: number; b: number; a: number }
//     kioskImgSrc?: string
//     itemYOffset?: number
//     itemScale?: number
//   }
//   export enum ClaimPointType {
//     MARKETPLACE_IMAGE,
//     CUSTOM_IMAGE,
//     MODEL,
//     MANNEQUIN,
//   }

//   export enum MannequinType {
//     MALE,
//     FEMALE,
//     MATCH_PLAYER,
//   }
// }
