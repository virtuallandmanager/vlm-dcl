import { VLMSceneInitEvent, VLMSceneMessage } from "../components/VLMSystemEvents.component";
import { VLMGiveaway } from "../components/VLMGiveaway.component";
import { VLMImage } from "../components/VLMImage.component";
import { VLMNFT } from "../components/VLMNFT.component";
import { VLMSound } from "../components/VLMSound.component";
import { VLMVideo } from "../components/VLMVideo.component";
import { VLMImageManager } from "./VLMImage.logic";
import { VLMVideoManager } from "./VLMVideo.logic";
import { VLMNFTManager } from "./VLMNFT.logic";
import { VLMSoundManager } from "./VLMSound.logic";
import { VLMWidgetManager } from "./VLMWidget.logic";
import { VLMScene } from "../components/VLMScene.component";
import { VLMModerationManager } from "./VLMModeration.logic";
import { VLMEventManager } from "./VLMSystemEvents.logic";

export type VLMSceneElement = VLMGiveaway.VLMConfig | VLMImage.VLMConfig | VLMNFT.VLMConfig | VLMSound.VLMConfig | VLMVideo.VLMConfig;
export type VLMSceneElementInstance = VLMGiveaway.ClaimPoint | VLMImage.VLMInstanceConfig | VLMNFT.VLMInstanceConfig | VLMSound.VLMInstanceConfig | VLMVideo.VLMInstanceConfig;
export abstract class VLMSceneManager {
  static sceneId: string;
  static store: { [uuid: string]: VLMSceneElement } = {};
  static scenePreset: VLMScene.Preset;

  static initScenePreset: CallableFunction = (message: VLMSceneMessage) => {
    try {
      const scenePreset = message.scenePreset;
      const sceneSettings = message.settingsData;
      VLMImageManager.init(scenePreset.images);
      VLMVideoManager.init(scenePreset.videos);
      VLMNFTManager.init(scenePreset.nfts);
      VLMSoundManager.init(scenePreset.sounds);

      if (scenePreset?.widgets?.length) {
        // set initial widget states
        VLMWidgetManager.setState(scenePreset.widgets);
        VLMWidgetManager.init(scenePreset.widgets);
        // inform event listeners that widgets are ready to be configured
      }

      if (sceneSettings?.moderation) {
        this.updateSceneSetting({ settings: "moderation", settingsData: sceneSettings.moderation });
      }

      VLMEventManager.events.fireEvent(new VLMSceneInitEvent());
    } catch (error) {
      throw error;
    }
  };

  static updateScenePreset: CallableFunction = (message: VLMSceneMessage) => {
    this.scenePreset = message.scenePreset;
  };

  static createSceneElement: CallableFunction = (message: VLMSceneMessage) => {
    try {
      if (message.instance) {
        return this.createSceneElementInstance(message);
      }
      switch (message.element) {
        case "image":
          VLMImageManager.create(message.elementData);
          break;
        case "nft":
          VLMNFTManager.create(message.elementData);
          break;
        case "video":
          VLMVideoManager.create(message.elementData);
          break;
        case "sound":
          VLMSoundManager.create(message.elementData);
          break;
        case "widget":
          VLMWidgetManager.create(message.elementData);
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  static createSceneElementInstance: CallableFunction = (message: VLMSceneMessage) => {
    try {
      switch (message.element) {
        case "image":
          VLMImageManager.createInstance(message.elementData, message.instanceData);
          break;
        case "nft":
          VLMNFTManager.createInstance(message.elementData, message.instanceData);
          break;
        case "video":
          VLMVideoManager.createInstance(message.elementData, message.instanceData);
          break;
        case "sound":
          VLMSoundManager.createInstance(message.elementData);
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  static updateSceneElement: CallableFunction = (message: VLMSceneMessage) => {
    try {
      if (message.instance) {
        return this.updateSceneElementInstance(message);
      } else if (message.setting) {
        return this.updateSceneSetting(message);
      }
      switch (message.element) {
        case "image":
          VLMImageManager.update(message.elementData, message.property, message.id);
          break;
        case "nft":
          VLMNFTManager.update(message.elementData, message.property, message.id);
          break;
        case "video":
          VLMVideoManager.update(message.elementData, message.property, message.id);
          break;
        case "sound":
          VLMSoundManager.update(message.elementData, message.property, message.id);
          break;
        case "widget":
          VLMWidgetManager.update(message.elementData, message.user);
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  static updateSceneSetting: CallableFunction = (message: VLMSceneMessage) => {
    try {
      if (message.settingsData === undefined) return;
      switch (message.setting) {
        case "localization":
          // TODO: add localization code
          break;
        case "moderation":
          VLMModerationManager.updateSettings(message.sceneSettings.moderation);
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  static updateSceneElementInstance: CallableFunction = (message: VLMSceneMessage) => {
    try {
      switch (message.element) {
        case "image":
          VLMImageManager.updateInstance(message.instanceData, message.property, message.id);
          break;
        case "nft":
          VLMNFTManager.updateInstance(message.instanceData, message.property, message.id);
          break;
        case "video":
          VLMVideoManager.updateInstance(message.instanceData, message.property, message.id);
          break;
        case "sound":
          VLMSoundManager.updateInstance(message.elementData, message.property, message.id);
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  static deleteSceneElement: CallableFunction = (message: VLMSceneMessage) => {
    try {
      if (message.instance) {
        return this.deleteSceneElementInstance(message);
      }

      const id = message.elementData.sk || message.id;
      switch (message.element) {
        case "image":
          VLMImageManager.delete(id);
          break;
        case "nft":
          VLMNFTManager.delete(id);
          break;
        case "video":
          VLMVideoManager.delete(id);
          break;
        case "sound":
          VLMSoundManager.delete(id);
          break;
        case "widget":
          VLMWidgetManager.delete(id);
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  static deleteSceneElementInstance: CallableFunction = (message: VLMSceneMessage) => {
    try {
      const id = message.instanceData.sk || message.id;
      switch (message.element) {
        case "image":
          VLMImageManager.deleteInstance(id);
          break;
        case "nft":
          VLMNFTManager.deleteInstance(id);
          break;
        case "video":
          VLMVideoManager.deleteInstance(id);
          break;
        case "sound":
          VLMSoundManager.deleteInstance(id);
          break;
      }
    } catch (error) {
      throw error;
    }
  };
}
