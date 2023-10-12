import messages from "../messages/giveaway";
import { VLMNotificationManager } from "../logic/VLMNotification.logic";
import { VLMNotification } from "./VLMNotification.component";
import { VLMSessionManager } from "../logic/VLMSession.logic";
import { VLMClaimEvent } from "./VLMSystemEvents.component";
import { VLMEventManager } from "../logic/VLMSystemEvents.logic";

export namespace VLMGiveaway {
  export type ClaimResponse = {
    sk?: string;
    headline?: string;
    message?: string;
    messageOptions?: VLMNotification.MessageOptions;
    type: ClaimResponseType;
    reason?: ClaimRejection;
  };

  export enum ClaimRejection {
    BEFORE_EVENT_START,
    AFTER_EVENT_END,
    EXISTING_WALLET_CLAIM,
    OVER_IP_LIMIT,
    SUPPLY_DEPLETED,
    INAUTHENTIC,
    SUSPICIOUS,
  }

  export enum ClaimResponseType {
    CLAIM_ACCEPTED,
    CLAIM_DENIED,
    CLAIM_IN_PROGRESS,
  }

  export const showMessage: CallableFunction = (response: any, messageOptions: VLMNotification.MessageOptions) => {
    if (response.error) {
      VLMNotificationManager.addMessage(messages.errorMessage, messageOptions);
    } else if (response.reason === ClaimDeniedReason.BEFORE_EVENT) {
      VLMNotificationManager.addMessage(messages.beforeEventTime, messageOptions);
    } else if (response.reason === ClaimDeniedReason.AFTER_EVENT) {
      VLMNotificationManager.addMessage(messages.afterEventTime, messageOptions);
    } else if (response.reason === ClaimDeniedReason.EXISTING_CLAIM) {
      VLMNotificationManager.addMessage(messages.existingClaim, messageOptions);
    } else if (response.reason === ClaimDeniedReason.IP_LIMIT) {
      VLMNotificationManager.addMessage(messages.ipLimitReached, messageOptions);
    } else if (response.reason === ClaimDeniedReason.NO_SUPPLY) {
      VLMNotificationManager.addMessage(messages.noSupply, messageOptions);
    } else if (response.reason === ClaimDeniedReason.INAUTHENTIC) {
      VLMNotificationManager.addMessage(messages.inauthenticConnection, messageOptions);
    } else if (response.success) {
      VLMNotificationManager.addMessage(messages.successfulClaim, messageOptions);
    }
  };

  export class ClaimPoint {
    sk?: string;
    itemId: string;
    position: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    glb?: string;
    image?: string;
    clickDistance?: number;
    rotation?: number;
    hoverText?: string;
    messageOptions?: VLMNotification.MessageOptions;
    messageColor?: string;
    messageFontSize?: number;
    requestInProgress: boolean = false;

    constructor(config: Partial<ClaimPoint> | null, giveawayConfig: DCLConfig) {
      const objThis = this;
      this.sk = giveawayConfig?.sk;
      this.position = config?.position;
      this.scale = config?.scale;
      this.glb = config?.glb;
      this.image = config?.image;
      this.clickDistance = config?.clickDistance;
      this.rotation = config?.rotation;
      this.hoverText = config?.hoverText;
      this.messageOptions = giveawayConfig?.messageOptions;
      this.messageColor = this.messageOptions?.color;
      this.messageFontSize = this.messageOptions?.fontSize;
      this.requestInProgress = false;
      const claimEntity = new Entity("Giveaway Trigger");
      engine.addEntity(claimEntity);
      if (this.glb) {
        claimEntity.addComponent(new GLTFShape(this.glb || "../models/VLM-Sign.glb"));
      } else if (this.image) {
        const plane = new PlaneShape();
        plane.uvs = [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1];
        claimEntity.addComponent(plane);
        const claimImageMat = new Material();
        const claimImageTexture = new Texture(this.image);
        claimImageMat.albedoTexture = claimImageTexture;
        claimImageMat.emissiveTexture = claimImageTexture;
        claimImageMat.emissiveIntensity = 1;
        claimImageMat.emissiveColor = Color3.White();
        claimImageMat.transparencyMode = TransparencyMode.ALPHA_TEST;
        claimEntity.addComponentOrReplace(claimImageMat);
      } else {
        this.generateSdkClaimPoint(this)
      }

      const claimEntityTransform = new Transform({
        position: new Vector3(this.position?.x || 8, this.position?.y || 1, this.position?.z || 8),
        rotation: Quaternion.Euler(0, this.rotation || 0, 0),
        scale: new Vector3(this.scale?.x || 1, this.scale?.y || 1, this.scale?.z || 1),
      });
      claimEntity.addComponentOrReplace(claimEntityTransform);
      claimEntity.addComponent(
        new OnPointerDown(
          async function () {
            await objThis.claim(objThis.sk, this.messageOptions);
          },
          {
            button: ActionButton.POINTER,
            hoverText: objThis.hoverText || "Claim Item",
            distance: objThis.clickDistance || 5,
          }
        )
      );
    }

    generateSdkClaimPoint: CallableFunction = (config: ClaimPoint) => {
      // make a tall cylinder on top of a thicker short cylinder
      const objThis = this;
      const parentEntity = new Entity("Giveaway Claim Point");
      const domeEntity = new Entity("Claim Point Dome");
      const baseEntity = new Entity("Claim Point Base");
      const avatarEntity = new Entity("Claim Point Avatar");
      engine.addEntity(parentEntity);
      engine.addEntity(avatarEntity);
      engine.addEntity(domeEntity);
      engine.addEntity(baseEntity);
      domeEntity.setParent(parentEntity);
      domeEntity.addComponent(new CylinderShape());
      domeEntity.addComponent(
        new OnPointerDown(
          async function () {
            await objThis.claim(config.sk, this.messageOptions);
          },
          {
            button: ActionButton.POINTER,
            hoverText: config.hoverText || "Claim Item",
            distance: config.clickDistance || 5,
          }
        )
      );
      const defaultWearables = [
        "urn:decentraland:off-chain:base-avatars:black_top",
        "urn:decentraland:off-chain:base-avatars:double_bun",
        "urn:decentraland:off-chain:base-avatars:f_eyes_00",
        "urn:decentraland:off-chain:base-avatars:f_eyebrows_00",
        "urn:decentraland:off-chain:base-avatars:f_mouth_00",
      ];
      // avatarEntity.setParent(parentEntity);
      baseEntity.setParent(parentEntity);
      const avatarShape = new AvatarShape();
      avatarShape.bodyShape = "urn:decentraland:off-chain:base-avatars:BaseFemale";
      avatarShape.wearables = defaultWearables;
      avatarShape.skinColor = new Color4(1.1, 1.1, 1.1, 1);
      avatarShape.hairColor = new Color4(1, 1, 1, 1);
      avatarEntity.addComponent(avatarShape);
      baseEntity.addComponent(new CylinderShape());
      const domeMaterial = new Material();
      domeMaterial.albedoColor = new Color4(1, 1, 1, 0.5)
      // domeMaterial.albedoColor = Color4.Blue();
      domeMaterial.emissiveIntensity = 1;
      domeMaterial.transparencyMode = TransparencyMode.ALPHA_BLEND;
      domeEntity.addComponentOrReplace(domeMaterial);
      const baseMaterial = new Material();
      baseMaterial.albedoColor = Color3.FromHexString("#fffff");
      baseMaterial.emissiveColor = Color3.FromHexString("#aaaaff");
      baseMaterial.emissiveIntensity = 1;
      baseMaterial.transparencyMode = TransparencyMode.ALPHA_TEST;
      baseEntity.addComponentOrReplace(baseMaterial);
      parentEntity.addComponent(
        new Transform({
          position: new Vector3(config.position?.x || 8, config.position?.y || 0, config.position?.z || 8),
          rotation: Quaternion.Euler(0, config.rotation || 0, 0),
          scale: new Vector3(config.scale?.x || 1, config.scale?.y || 1, config.scale?.z || 1),
        })
      );
      domeEntity.addComponent(
        new Transform({
          position: new Vector3(0, 0.75, 0),
          scale: new Vector3(0.59, 1.5, 0.59),
        })
      );
      baseEntity.addComponent(
        new Transform({
          position: new Vector3(0, 0, 0),
          scale: new Vector3(0.6, 0.1, 0.6),
        })
      );
      avatarEntity.addComponent(
        new Transform({
          position: new Vector3(8, 0.15, 8),
          scale: new Vector3(1, 1, 1)
        })
      );
      parentEntity.addComponent(
        new OnPointerDown(
          async function () {
            await objThis.claim(config.sk, this.messageOptions);
          },
          {
            button: ActionButton.POINTER,
            hoverText: config.hoverText || "Claim Item",
            distance: config.clickDistance || 5,
          }
        )
      );
    };

    claim: CallableFunction = async (giveawayId: string, messageOptions: VLMNotification.MessageOptions) => {
      if (VLMNotificationManager.running) {
        VLMNotificationManager.init();
      }
      if (!VLMSessionManager.sessionUser.hasConnectedWeb3) {
        VLMNotificationManager.addMessage(messages.noWallet);
        return;
      } else if (this.requestInProgress) {
        VLMNotificationManager.addMessage(messages.claimInProgress);
        return;
      }
      VLMNotificationManager.addMessage(messages.claimInProgress, messageOptions);
      this.requestInProgress = true;
      VLMEventManager.events.fireEvent(new VLMClaimEvent({ action: "claim", giveawayId, messageOptions }));
    };

    claimSuccess: CallableFunction = async (response: ClaimResponse, messageOptions: VLMNotification.MessageOptions) => {
      if (response.type === ClaimResponseType.CLAIM_ACCEPTED) {
        VLMNotificationManager.addMessage(response.message || messages.successfulClaim, messageOptions);
      } else if (response.type === ClaimResponseType.CLAIM_DENIED) {
        showMessage(response, messageOptions);
      } else if (response.type === ClaimResponseType.CLAIM_IN_PROGRESS) {
        VLMNotificationManager.addMessage(response.message || messages.claimInProgress, messageOptions);
      }
    };

    claimDenial: CallableFunction = async (response: ClaimDeniedReason, messageOptions: VLMNotification.MessageOptions) => {
      showMessage(response, messageOptions);
    };
  }

  export class DCLConfig {
    sk: string;
    giveawayId: string;
    requestInProgress: boolean;
    messageOptions: VLMNotification.MessageOptions = { color: "#ffffff", fontSize: 16, delay: 5000 };
    claimPoints: ClaimPoint[] = [];

    constructor(config: VLMConfig) {
      this.sk = config.sk;
      this.giveawayId = config.sk;
      this.messageOptions = config.messageOptions;
      this.requestInProgress = false;
      this.claimPoints = config.claimPoints || this.claimPoints;

      this.claimPoints.forEach((claimPoint) => {
        new ClaimPoint(claimPoint, this);
      });

      // if (VLMEnvironment.devMode) {
      // new ClaimPoint(null, this);

    }
  }

  export class VLMConfig extends DCLConfig { }

  enum ClaimDeniedReason {
    BEFORE_EVENT,
    AFTER_EVENT,
    EXISTING_CLAIM,
    IP_LIMIT,
    NO_SUPPLY,
    MANIPULATION,
    INAUTHENTIC,
  }
}
