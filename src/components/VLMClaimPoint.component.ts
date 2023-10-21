import messages from "../messages/giveaway";
import { VLMNotificationManager } from "../logic/VLMNotification.logic";
import { VLMNotification } from "./VLMNotification.component";
import { VLMSessionManager } from "../logic/VLMSession.logic";
import { VLMClaimEvent } from "./VLMSystemEvents.component";
import { VLMEventManager } from "../logic/VLMSystemEvents.logic";
import { SimpleTransform } from "../shared/interfaces";
import { getEntityByName } from "../shared/entity";
import { getModelPath } from "../shared/paths";

export namespace VLMClaimPoint {
  export const configs: { [uuid: string]: VLMClaimPoint.DCLConfig } = {};
  export class DCLConfig extends Entity {
    sk?: string;
    enabled?: boolean = true;
    itemId?: string;
    customId?: string;
    customRendering?: boolean;
    parent?: string;
    properties?: ClaimPointProperties = {};
    position: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    modelSrc?: string;
    imgSrc?: string;
    hoverText?: string;
    messageColor?: string;
    messageFontSize?: number;
    requestInProgress: boolean = false;
    giveawayId?: string;
    messageOptions?: VLMNotification.MessageOptions;
    claimItemEntity?: Entity = new Entity("Giveaway Item");
    kioskEntities: { [uuid: string]: Entity } = {};

    constructor(config: Partial<VLMConfig>) {
      super(config.name || "Claim Point");
      log("Claim Point Config", config)
      this.sk = config?.sk;
      this.init(config);
    }

    init: CallableFunction = (config: Partial<VLMConfig>) => {
      this.sk = config?.sk;
      this.enabled = config?.enabled;
      this.customId = config?.customId;
      this.customRendering = config?.customRendering;
      this.messageOptions = config?.messageOptions || { color: "white", fontSize: 12, delay: 5 };
      this.parent = config?.parent;
      this.properties = config?.properties;
      this.position = config?.position;
      this.scale = config?.scale;
      this.rotation = config?.rotation;
      this.giveawayId = config?.giveawayId;
      this.modelSrc = config?.modelSrc;
      this.imgSrc = config?.imgSrc;
      this.hoverText = config?.hoverText;
      this.requestInProgress = false;

      this.add();

      this.generateClaimItem();

      if (this.properties.enableKiosk && this.properties.type < ClaimPointType.MANNEQUIN) {
        this.generateStandardBooth();
      } else {
        this.generateMannequinBooth();
      }

      this.updateTransform(config.position, config.scale, config.rotation);

      configs[this.sk] = this;

      if (this.customId) {
        configs[this.customId] = configs[this.sk];
      }

    }

    add: CallableFunction = () => {
      try {
        if (this.isAddedToEngine()) {
          return;
        } else if (this.parent) {
          this.updateParent(this.parent);
        } else {
          engine.addEntity(this);
        }
      } catch (error) {
        throw error;
      }
    };

    updateParent: CallableFunction = (parent: string) => {
      try {
        if (parent) {
          this.parent = parent;
          const instanceParent = configs[parent] || getEntityByName(parent);
          this.setParent(instanceParent); //// SDK SPECIFIC ////
        } else {
          this.setParent(null); //// SDK SPECIFIC ////
        }
      } catch (error) {
        throw error;
      }
    };

    delete: CallableFunction = () => {
      try {
        this.remove();
        delete configs[this.sk];
        if (this.customId) {
          delete configs[this.customId];
        }
      } catch (error) {
        throw error;
      }
    };

    remove: CallableFunction = () => {
      try {
        if (this.isAddedToEngine()) {
          engine.removeEntity(this);
        }
      } catch (error) {
        throw error;
      }
    };

    updateCustomId: CallableFunction = (customId: string) => {
      try {
        if (this.customId && configs[this.customId]) {
          delete configs[this.customId];
        }
        this.customId = customId;
        this.init(this);

      } catch (error) {
        throw error;
      }
    };

    updateCustomRendering: CallableFunction = (customRendering: boolean) => {
      try {
        this.customRendering = customRendering;

        if (customRendering) {
          this.remove();
        } else {
          this.add();
        }
      } catch (error) {
        throw error;
      }
    };

    updateTransform: CallableFunction = (position: SimpleTransform, scale: SimpleTransform, rotation: SimpleTransform, propertiesConfig: ClaimPointProperties) => {
      try {
        const properties = propertiesConfig || this.properties;
        this.claimItemEntity.addComponentOrReplace(
          new Transform({
            scale: new Vector3(scale.x, scale.y, scale.z),
          }));

        const parentScale = properties.enableKiosk ? new Vector3(1, 1, 1) : new Vector3(scale.x, scale.y, scale.z);
        this.addComponentOrReplace(
          new Transform({
            position: new Vector3(position.x, position.y, position.z),
            scale: parentScale,
            rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z),
          }));

        const claimItemHeight = properties.enableKiosk ? 1.5 + properties.itemYOffset : 0;

        this.claimItemEntity.addComponentOrReplace(
          new Transform({
            position: new Vector3(0, claimItemHeight, 0),
            scale: new Vector3(properties.itemScale || 1, properties.itemScale || 1, properties.itemScale || 1),
            rotation: Quaternion.Euler(0, 180, 0),
          }));

      } catch (error) {
        throw error;
      }
    };

    updateProperties: CallableFunction = (properties: ClaimPointProperties) => {
      try {
        this.properties = properties;
        this.init(this);
      } catch (error) {
        throw error;
      }
    }

    generateClaimItem: CallableFunction = () => {
      const objThis = this;
      this.claimItemEntity.setParent(objThis);
      if (this.properties.type == ClaimPointType.MODEL && this.properties.modelSrc) {
        this.claimItemEntity.addComponentOrReplace(new GLTFShape(`${getModelPath()}${this.properties.modelSrc}`));
      } else if (this.properties.type == ClaimPointType.CUSTOM_IMAGE && this.properties.imgSrc) {
        const plane = new PlaneShape();
        plane.uvs = [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1];
        this.claimItemEntity.addComponentOrReplace(plane);
        const claimImageMat = new Material();
        const claimImageTexture = new Texture(this.properties.imgSrc);
        claimImageMat.albedoTexture = claimImageTexture;
        claimImageMat.emissiveTexture = claimImageTexture;
        claimImageMat.emissiveIntensity = 1;
        claimImageMat.emissiveColor = Color3.White();
        claimImageMat.transparencyMode = TransparencyMode.ALPHA_TEST;
        this.claimItemEntity.addComponentOrReplace(claimImageMat);
      }

      this.claimItemEntity.addComponentOrReplace(
        new OnPointerDown(
          async function () {
            await objThis.claim();
          },
          {
            button: ActionButton.POINTER,
            hoverText: objThis.hoverText || "Claim Item",
            distance: 5,
          }
        )
      );
    };

    generateStandardBooth: CallableFunction = () => {
      const objThis = this;
      this.kioskEntities.topEntity = this.kioskEntities.topEntity || new Entity("Claim Point Top");
      this.kioskEntities.glassEntity = this.kioskEntities.glassEntity || new Entity("Claim Point Glass");
      this.kioskEntities.baseEntity = this.kioskEntities.baseEntity || new Entity("Claim Point Mid Section");
      this.kioskEntities.baseTopEntity = this.kioskEntities.baseTopEntity || new Entity("Claim Point Base");
      this.kioskEntities.baseBottomEntity = this.kioskEntities.baseBottomEntity || new Entity("Claim Point Base");
      const { color1, color2, color3 } = this.properties;

      this.kioskEntities.topEntity.setParent(objThis);
      this.kioskEntities.glassEntity.setParent(objThis);
      this.kioskEntities.baseEntity.setParent(objThis);
      this.kioskEntities.baseTopEntity.setParent(objThis);
      this.kioskEntities.baseBottomEntity.setParent(objThis);

      const cylinder = new CylinderShape();

      this.kioskEntities.topEntity.addComponentOrReplace(new CylinderShape());
      this.kioskEntities.glassEntity.addComponentOrReplace(new CylinderShape());
      this.kioskEntities.baseEntity.addComponentOrReplace(cylinder);
      this.kioskEntities.baseTopEntity.addComponentOrReplace(new CylinderShape());
      this.kioskEntities.baseBottomEntity.addComponentOrReplace(new CylinderShape());

      this.kioskEntities.glassEntity.addComponentOrReplace(
        new OnPointerDown(
          async function () {
            await objThis.claim();
          },
          {
            button: ActionButton.POINTER,
            hoverText: objThis.hoverText || "Claim Item",
            distance: 5,
          }
        )
      );

      const color1Material = new Material();
      if (objThis.properties?.kioskImgSrc) {
        const kioskImgTexture = new Texture(objThis.properties?.kioskImgSrc);
        color1Material.albedoTexture = kioskImgTexture;
        color1Material.emissiveTexture = kioskImgTexture;
        color1Material.emissiveIntensity = 1;
        color1Material.emissiveColor = Color3.White();
        color1Material.transparencyMode = TransparencyMode.AUTO;
      } else {
        color1Material.albedoColor = new Color4(color1.r / 255, color1.g / 255, color1.b / 255, color1.a);
        color1Material.transparencyMode = TransparencyMode.AUTO;
      }

      const color2Material = new Material();
      color2Material.albedoColor = new Color4(color2.r / 255, color2.g / 255, color2.b / 255, color2.a);
      color2Material.transparencyMode = TransparencyMode.AUTO;

      const glassMaterial = new Material();
      glassMaterial.albedoColor = new Color4(color3.r / 255, color3.g / 255, color3.b / 255, color3.a);
      glassMaterial.transparencyMode = TransparencyMode.AUTO;

      this.kioskEntities.baseEntity.addComponentOrReplace(color1Material);
      this.kioskEntities.baseTopEntity.addComponentOrReplace(color2Material);
      this.kioskEntities.baseBottomEntity.addComponentOrReplace(color2Material);
      this.kioskEntities.topEntity.addComponentOrReplace(color2Material);
      this.kioskEntities.glassEntity.addComponentOrReplace(glassMaterial);

      this.kioskEntities.topEntity.addComponentOrReplace(
        new Transform({
          position: new Vector3(0, 2.5, 0),
          scale: new Vector3(0.6, 0.05, 0.6),
        })
      );

      this.kioskEntities.glassEntity.addComponentOrReplace(
        new Transform({
          position: new Vector3(0, 1.75, 0),
          scale: new Vector3(0.5, 0.75, 0.5),
        })
      );

      this.kioskEntities.baseEntity.addComponentOrReplace(
        new Transform({
          position: new Vector3(0, 0.5, 0),
          scale: new Vector3(-0.5, 0.5, 0.5),
          rotation: Quaternion.Euler(0, 90, 0),
        })
      );

      this.kioskEntities.baseTopEntity.addComponentOrReplace(
        new Transform({
          position: new Vector3(0, 1, 0),
          scale: new Vector3(0.6, 0.05, 0.6),
        })
      );

      this.kioskEntities.baseBottomEntity.addComponentOrReplace(
        new Transform({
          position: new Vector3(0, 0, 0),
          scale: new Vector3(0.6, 0.05, 0.6),
        })
      );

      objThis.addComponentOrReplace(
        new OnPointerDown(
          async function () {
            await objThis.claim();
          },
          {
            button: ActionButton.POINTER,
            hoverText: objThis.properties.hoverText || "Claim Item",
            distance: 5,
          }
        )
      );
    };

    generateMannequinBooth: CallableFunction = () => {
      //TODO: Build out mannequin booth
    };

    claim: CallableFunction = async () => {
      const sk = this.sk
      const giveawayId = this.giveawayId;
      log(sk, giveawayId);
      if (!VLMSessionManager.sessionUser.hasConnectedWeb3) {
        VLMNotificationManager.addMessage(messages.noWallet);
        return;
      } else if (this.requestInProgress) {
        VLMNotificationManager.addMessage(messages.claimInProgress);
        return;
      }
      this.requestInProgress = true;

      VLMNotificationManager.addMessage(messages.claimSubmitted);
      log(sk, giveawayId)
      VLMEventManager.events.fireEvent(new VLMClaimEvent({ action: "giveaway_claim", giveawayId, sk: sk || "" }));
    };
  }

  export class VLMConfig extends DCLConfig { }

  export interface ClaimResponse {
    sk?: string;
    giveawayId?: string;
    responseType?: ClaimResponseType;
    reason?: ClaimRejection;
  };

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
    enableKiosk?: boolean;
    enableSpin?: boolean;
    type?: ClaimPointType;
    imgSrc?: string;
    modelSrc?: string;
    mannequinType?: MannequinType;
    hoverText?: string;
    color1?: { r: number, g: number, b: number, a: number };
    color2?: { r: number, g: number, b: number, a: number };
    color3?: { r: number, g: number, b: number, a: number };
    kioskImgSrc?: string;
    itemYOffset?: number;
    itemScale?: number;
  }
  export enum ClaimPointType {
    MARKETPLACE_IMAGE,
    CUSTOM_IMAGE,
    MODEL,
    MANNEQUIN,
  };

  export enum MannequinType {
    MALE,
    FEMALE,
    MATCH_PLAYER
  };

}
