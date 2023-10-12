import { VLMGiveaway } from "../components";
import { VLMSceneMessage } from "../components/VLMSystemEvents.component";

export abstract class VLMGiveawayManager {
  static store: { [uuid: string]: VLMGiveaway.ClaimPoint } = {};
  static initGiveaways: CallableFunction = (message: VLMSceneMessage) => {
    try {
      log(`VLM - GIVEAWAYS - ${message.giveaways}`)
      if (!message.giveaways?.length) {
        return;
      }
      message.giveaways.forEach((giveaway: VLMGiveaway.VLMConfig) => {
        new VLMGiveaway.DCLConfig(giveaway);
      });
    } catch (error) {
      throw error;
    }
  };
}
