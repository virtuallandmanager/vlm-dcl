import { VLMClaimPoint, VLMNotification } from "../components";
import { VLMNotificationManager } from "./VLMNotification.logic";
import messages from "../messages/giveaway";


export abstract class VLMClaimPointManager {
  static init: CallableFunction = (claimPoints: VLMClaimPoint.VLMConfig[]) => {
    try {
      if (!claimPoints?.length) {
        return;
      }
      claimPoints.forEach((claimPoint: VLMClaimPoint.VLMConfig) => {
        new VLMClaimPoint.DCLConfig(claimPoint);
      });
    } catch (error) {
      throw error;
    }
  };

  static create: CallableFunction = (config: VLMClaimPoint.VLMConfig) => {
    try {
      if (!config.enabled) {
        return;
      }
      new VLMClaimPoint.DCLConfig(config);
    } catch (error) {
      throw error;
    }
  };

  static update: CallableFunction = (config: VLMClaimPoint.VLMConfig, property: string, id: string) => {
    try {
      const claimPoint = VLMClaimPoint.configs[config.sk];

      if (!claimPoint) {
        return;
      }

      const { position, scale, rotation } = config;

      switch (property) {
        case "enabled":
          if (!claimPoint.enabled) {
            claimPoint.remove(config.sk);
          } else if (claimPoint) {
            claimPoint.add(config.sk);
          } else {
            new VLMClaimPoint.DCLConfig(config);
          }
          break;
        case "transform":
          claimPoint.updateTransform(position, scale, rotation, config.properties);
          break;
        case "properties":
          claimPoint.updateProperties(config.properties);
          break;
        case "customId":
          claimPoint.updateCustomId(config.customId);
          break;
        case "customRendering":
          claimPoint.updateCustomRendering(config.customRendering);
          break;
        case "parent":
          claimPoint.updateParent(config.parent);
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  static showMessage: CallableFunction = (response: VLMClaimPoint.ClaimResponse) => {
    if (!VLMNotificationManager.initialized) {
      VLMNotificationManager.init();
    }
    log(response)
    const claimPoint = VLMClaimPoint.configs[response.sk],
      messageOptions = claimPoint.messageOptions || null;
    if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_ACCEPTED) {
      VLMNotificationManager.addMessage(messages.successfulClaim, messageOptions);
    } else if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_SERVER_ERROR) {
      VLMNotificationManager.addMessage(messages.errorMessage, messageOptions);
    } else if (response.reason === VLMClaimPoint.ClaimRejection.BEFORE_EVENT_START) {
      VLMNotificationManager.addMessage(messages.beforeEventTime, messageOptions);
    } else if (response.reason === VLMClaimPoint.ClaimRejection.AFTER_EVENT_END) {
      VLMNotificationManager.addMessage(messages.afterEventTime, messageOptions);
    } else if (response.reason === VLMClaimPoint.ClaimRejection.EXISTING_WALLET_CLAIM) {
      VLMNotificationManager.addMessage(messages.existingClaim, messageOptions);
    } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_IP_LIMIT) {
      VLMNotificationManager.addMessage(messages.ipLimitReached, messageOptions);
    } else if (response.reason === VLMClaimPoint.ClaimRejection.SUPPLY_DEPLETED) {
      VLMNotificationManager.addMessage(messages.noSupply, messageOptions);
    } else if (response.reason === VLMClaimPoint.ClaimRejection.INAUTHENTIC) {
      VLMNotificationManager.addMessage(messages.inauthenticConnection, messageOptions);
    } else if (response.reason === VLMClaimPoint.ClaimRejection.NO_LINKED_EVENTS) {
      VLMNotificationManager.addMessage(messages.noLinkedEvents, messageOptions);
    } else if (response.reason === VLMClaimPoint.ClaimRejection.PAUSED) {
      VLMNotificationManager.addMessage(messages.paused, messageOptions);
    } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_DAILY_LIMIT) {
      VLMNotificationManager.addMessage(messages.dailyLimitReached, messageOptions);
    } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_WEEKLY_LIMIT) {
      VLMNotificationManager.addMessage(messages.otherLimitReached, messageOptions);
    } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_MONTHLY_LIMIT) {
      VLMNotificationManager.addMessage(messages.otherLimitReached, messageOptions);
    } else if (response.reason === VLMClaimPoint.ClaimRejection.OVER_YEARLY_LIMIT) {
      VLMNotificationManager.addMessage(messages.otherLimitReached, messageOptions);
    } else if (response.responseType === VLMClaimPoint.ClaimResponseType.CLAIM_DENIED) {
      VLMNotificationManager.addMessage(messages.claimDenied, messageOptions);
    }
  };

  static delete: CallableFunction = (id: string) => {
    VLMClaimPoint.configs[id].delete();
  };

  static remove: CallableFunction = (id: string) => {
    VLMClaimPoint.configs[id].remove();
  };
}
