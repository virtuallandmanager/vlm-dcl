// import * as ui from "@dcl/ui-scene-utils";
import { signedFetch } from "@decentraland/SignedFetch";
import { VLM } from "src/app";
import { AppEnvironment } from "src/environment";
import { TMessageOptions, UIMessageSystem } from "src/systems";
import messages from "../messages/giveaway";

enum ClaimDenied {
  BEFORE_EVENT,
  AFTER_EVENT,
  EXISTING_CLAIM,
  IP_LIMIT,
  NO_SUPPLY,
  MANIPULATION,
  INAUTHENTIC,
}

export class Giveaway {
  claimAction: string;
  requestInProgress: boolean;
  messageOptions: TMessageOptions;

  constructor(_claimAction: string, _messageOptions: TMessageOptions) {
    this.claimAction = _claimAction;
    this.messageOptions = _messageOptions;
  }

  claim: CallableFunction = async () => {
    try {
      if (!VLM.userData.hasConnectedWeb3) {
        UIMessageSystem.show(messages.noWallet);
        return;
      } else if (this.requestInProgress) {
        return;
      }

      this.requestInProgress = true;
      let response = await signedFetch(`${AppEnvironment.apiUrl}/nft`, {
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

  private showMessage: CallableFunction = (
    response: any,
    messageOptions: TMessageOptions
  ) => {
    if (response.error) {
      UIMessageSystem.show(messages.errorMessage, messageOptions);
    } else if (response.reason === ClaimDenied.BEFORE_EVENT) {
      UIMessageSystem.show(messages.beforeEventTime, messageOptions);
    } else if (response.reason === ClaimDenied.AFTER_EVENT) {
      UIMessageSystem.show(messages.afterEventTime, messageOptions);
    } else if (response.reason === ClaimDenied.EXISTING_CLAIM) {
      UIMessageSystem.show(messages.existingClaim, messageOptions);
    } else if (response.reason === ClaimDenied.IP_LIMIT) {
      UIMessageSystem.show(messages.ipLimitReached, messageOptions);
    } else if (response.reason === ClaimDenied.NO_SUPPLY) {
      UIMessageSystem.show(messages.noSupply, messageOptions);
    } else if (response.reason === ClaimDenied.INAUTHENTIC) {
      UIMessageSystem.show(messages.inauthenticConnection, messageOptions);
    } else if (response.success) {
      UIMessageSystem.show(messages.successfulClaim, messageOptions);
    }
  };
}
