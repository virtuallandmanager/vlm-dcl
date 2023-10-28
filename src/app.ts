import { UserData } from "@decentraland/Identity";
import { VLMEnvironment } from "./environment";
import { VLMSessionManager } from "./logic/VLMSession.logic";
import { VLMEventListeners } from "./logic/VLMSystemListeners.logic";
import { VLMLogManager } from "./logic/VLMLogging";
import { VLMWidgetManager } from "./logic/VLMWidget.logic";
import { VLMNotificationManager } from "./logic/VLMNotification.logic";
import { VLMEventManager } from "./logic/VLMSystemEvents.logic";
import { VLMWidget } from "./components/VLMWidget.component";
import { VLMVideo } from "./components/VLMVideo.component";
import { VLMImage } from "./components/VLMImage.component";
import { VLMNFT } from "./components/VLMNFT.component";
import { VLMSound } from "./components/VLMSound.component";
import { VLMSceneInitEvent } from "./components/VLMSystemEvents.component";
import { VLMModel } from "./components/VLMModel.component";
import { VLMClaimPoint } from "./components/VLMClaimPoint.component";
import { configurePaths } from "./shared/paths";

/**
 * The main entry point for the VLM library.
 * @public
 */
export abstract class VLM {
  public static version: string = __VERSION__;

  public static activeServer: string;

  public static uiCanvas: UICanvas = new UICanvas();

  public static user: UserData;

  /**
   * Initializes the VLM library with the given configuration.
   * @param config - The VLM initialization options.
   * @public
   */
  public static init: CallableFunction = async (config?: VLMInitConfig) => {
    log("VLM - Initializing", config)
    return new Promise(async (resolve, reject) => {
      onSceneReadyObservable.addOnce(async () => {
        try {
          if (config?.modelFolder || config?.soundFolder) {
            configurePaths({ modelFolder: config?.modelFolder, soundFolder: config?.soundFolder })
          }
          VLMEventManager.events.addListener(VLMSceneInitEvent, null, () => {
            resolve(VLM.storage);
          });
          if (config?.widgets) {
            await VLMWidgetManager.configureWidgets(config.widgets);
          }
          await VLMEnvironment.init(config?.env || "prod");
          await VLMNotificationManager.init();
          const session = await VLMSessionManager.start(VLM.version);
          if (!session?.sceneRoom) {
            log("VLM INIT ERROR: Failed to connect to the scene server. This may be due to a missing sceneId in the scene.json file.")
            resolve({ error: "Failed to connect to the scene server. This may be due to a missing sceneId in the scene.json file." });
            return;
          }
          await VLMEventListeners.init();
        } catch (error) {
          VLMLogManager.logError(error, { ...config, message: "VLM INIT ERROR", version: VLM.version, env: config?.env || "prod", });
          reject(error);
        }
      });
    });
  };

  public static configureWidgets: CallableFunction = async (options: VLMWidget.DCLConfig[]) => {
    return VLMWidgetManager.configureWidgets(options);
  };

  public static sendMessage: CallableFunction = async (id: string, data?: unknown) => {
    VLMEventListeners.sendMessage(id, data);
  }

  public static onMessage: CallableFunction = async (id: string, callback: CallableFunction) => {
    VLMEventListeners.onMessage(id, callback);
  }

  public static setState: CallableFunction = async (id: string, value: CallableFunction) => {
    VLMEventListeners.setState(id, value);
  }

  public static getState: CallableFunction = async (id: string) => {
    VLMEventListeners.getState(id);
  }

  public static recordAction: CallableFunction = async (id: string, data?: unknown) => {
    VLMEventListeners.recordAction(id, data);
  }

  public static Storage = {
    videos: {
      configs: VLMVideo.configs,
      instances: VLMVideo.instances,
      systems: VLMVideo.systems
    },
    images: {
      configs: VLMImage.configs,
      instances: VLMImage.instances
    },
    models: {
      configs: VLMModel.configs,
      instances: VLMModel.instances
    },
    nfts: {
      configs: VLMNFT.configs,
      instances: VLMNFT.instances
    },
    sounds: {
      configs: VLMSound.configs,
      instances: VLMSound.instances,
      systems: VLMSound.systems
    },
    claimPoints: {
      configs: VLMClaimPoint.configs,
    },
    widgets: {
      configs: VLMWidget.configs
    }
  };

  public static storage = this.Storage;
}

export type VLMStorage = {
  video: {
    configs: { [customId: string]: VLMVideo.DCLConfig },
    instances: { [customId: string]: VLMVideo.DCLInstanceConfig },
    systems: { [customId: string]: VLMVideo.VLMVideoPlaylistSystem }
  },
  image: {
    configs: { [customId: string]: VLMImage.DCLConfig },
    instances: { [customId: string]: VLMImage.DCLInstanceConfig }
  },
  models: {
    configs: { [customId: string]: VLMModel.DCLConfig },
    instances: { [customId: string]: VLMModel.DCLInstanceConfig }
  },
  nft: {
    configs: { [customId: string]: VLMNFT.DCLConfig },
    instances: { [customId: string]: VLMNFT.DCLInstanceConfig }
  },
  sound: {
    configs: { [customId: string]: VLMSound.DCLConfig },
    instances: { [customId: string]: VLMSound.DCLInstanceConfig },
    systems: { [customId: string]: VLMSound.DCLSoundSystem }
  },
  widget: {
    configs: { [customId: string]: VLMWidget.DCLConfig };
  }
};

/**
 * Environment initialization options. Allow you to choose which server to connect to.
 * @public
 */
type VLMInitConfig = {
  env: "dev" | "staging" | "prod";
  widgets?: VLMWidget.DCLConfig[];
  modelFolder?: string;
  soundFolder?: string;
};