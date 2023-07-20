import { signedFetch } from "@decentraland/SignedFetch";
import { VLMEnvironment } from "../environment";
import messages from "../messages/giveaway";
import { VLMNotificationManager } from "src/logic/VLMNotification.logic";
import { VLMNotification } from "./VLMNotification.component";
import { VLMSessionManager } from "src/logic/VLMSession.logic";
import { VLMClaimEvent } from "./VLMSystemEvents.component";

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

  export class ClaimPoint {
    actionId: string;
    position: { x: number; y: number; z: number };
    scale?: { x: number; y: number; z: number };
    glb?: string;
    image?: string;
    clickDistance?: number;
    rotation?: number;
    hoverText?: string;
    messageColor?: string;
    messageFontSize?: number;
    requestInProgress: boolean;

    constructor(config: ClaimPoint, _messageOptions: VLMNotification.MessageOptions) {
      const actionId = config.actionId,
        position = config.position,
        scale = config.scale,
        glb = config.glb,
        image = config.image,
        clickDistance = config.clickDistance,
        rotation = config.rotation,
        hoverText = config.hoverText;
      this.messageColor = _messageOptions.color;
      this.messageFontSize = _messageOptions.fontSize;
      const claimEntity = new Entity("Giveaway Trigger");
      engine.addEntity(claimEntity);
      if (glb) {
        claimEntity.addComponent(new GLTFShape(glb || "src/vlm-giveaway/VLM-Sign.glb"));
      } else if (image) {
        const plane = new PlaneShape();
        plane.uvs = [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1];
        claimEntity.addComponent(plane);
        const claimImageMat = new Material();
        const claimImageTexture = new Texture(image);
        claimImageMat.albedoTexture = claimImageTexture;
        claimImageMat.emissiveTexture = claimImageTexture;
        claimImageMat.emissiveIntensity = 1;
        claimImageMat.emissiveColor = Color3.White();
        claimImageMat.transparencyMode = TransparencyMode.ALPHA_TEST;
        claimEntity.addComponentOrReplace(claimImageMat);
      } else {
        claimEntity.addComponent(new BoxShape());
      }

      const claimEntityTransform = new Transform({
        position: new Vector3(position.x || 8, position.y || 8, position.z || 8),
        rotation: Quaternion.Euler(0, rotation || 0, 0),
        scale: new Vector3(scale?.x || 1, scale?.y || 1, scale?.z || 1),
      });
      claimEntity.addComponentOrReplace(claimEntityTransform);
      claimEntity.addComponent(
        new OnPointerDown(
          async function () {
            await this.claim(actionId);
          },
          {
            button: ActionButton.POINTER,
            hoverText: hoverText || "Claim Item",
            distance: clickDistance || 5,
          }
        )
      );
    }

    claim: CallableFunction = async (claimAction: string, messageOptions: VLMNotification.MessageOptions) => {
      // try {
      if (!VLMSessionManager.sessionUser.hasConnectedWeb3) {
        VLMNotificationManager.addMessage(messages.noWallet);
        return;
      } else if (this.requestInProgress) {
        return;
      }
      if (VLMNotificationManager.running) {
        VLMNotificationManager.init();
      }
      VLMSessionManager.events.fireEvent(new VLMClaimEvent({ action: "claim", claimAction, messageOptions }));
    };
  }

  export class DCLConfig {
    sk: string;
    claimAction: string;
    requestInProgress: boolean;
    messageOptions: VLMNotification.MessageOptions;

    constructor(_claimAction: string, _messageOptions: VLMNotification.MessageOptions) {
      this.claimAction = _claimAction;
      this.messageOptions = _messageOptions;
    }

    claim: CallableFunction = async () => {
      try {
        if (!VLMSessionManager.sessionUser.hasConnectedWeb3) {
          VLMNotificationManager.addMessage(messages.noWallet);
          return;
        } else if (this.requestInProgress) {
          return;
        }

        this.requestInProgress = true;
        let response = await signedFetch(`${VLMEnvironment.apiUrl}/nft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ claimAction: this.claimAction }),
        });

        let json;
        if (!response.text) return;

        json = JSON.parse(response.text);
        this.showMessage(json, this.messageOptions);
        return json;
      } catch (error) {
        let response = {
          error: true,
          message: error,
        };
        this.showMessage(response, this.messageOptions);
        return response;
      }
    };
    private showMessage: CallableFunction = (response: any, messageOptions: VLMNotification.MessageOptions) => {
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
  }

  export class VLMConfig extends DCLConfig {}

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
