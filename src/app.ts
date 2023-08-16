import { UserData } from "@decentraland/Identity";
import { VLMEnvironment } from "./environment";
import { VLMSessionManager } from "./logic/VLMSession.logic";
import { VLMEventListeners } from "./logic/VLMSystemListeners.logic";
import { VLMLogManager } from "./logic/VLMLogging";
import { VLMWidget } from "./components/VLMWidget.component";
import { VLMWidgetManager } from "./logic/VLMWidget.logic";
import { VLMVideo } from "./components/VLMVideo.component";
import { VLMImage } from "./components/VLMImage.component";
import { VLMNFT } from "./components/VLMNFT.component";
import { VLMSound } from "./components/VLMSound.component";
import { VLMNotificationManager } from "./logic";
import { VLMEventManager } from "./logic/VLMSystemEvents.logic";
import { VLMSceneInitEvent } from "./components/VLMSystemEvents.component";

/**
 * The main entry point for the VLM library.
 * @public
 */
export abstract class VLM {
  public static version: string = "0.0.1";

  public static activeServer: string;

  public static uiCanvas: UICanvas = new UICanvas();

  public static user: UserData;

  /**
   * Initializes the VLM library with the given configuration.
   * @param config - The VLM initialization options.
   * @public
   */
  public static init: CallableFunction = async (config?: VLMInitConfig) => {

    return new Promise(async (resolve, reject) => {
      try {
        if (config?.widgets) {
          await VLMWidgetManager.configureWidgets(config.widgets);
        }
        await VLMEnvironment.init(config?.env || "prod");
        await VLMNotificationManager.init();
        await VLMSessionManager.start(VLM.version);
        await VLMEventListeners.init();
        VLMEventManager.events.addListener(VLMSceneInitEvent, null, () => {
          resolve(VLM.storage);
        });
      } catch (error) {
        VLMLogManager.logError(error, { ...config, message: "VLM INIT ERROR", version: VLM.version, env: config?.env || "prod", });
        reject(error);
      }
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

  public static storage = {
    videos: {
      configs: VLMVideo.configs,
      instances: VLMVideo.instances,
      systems: VLMVideo.systems
    },
    images: {
      configs: VLMImage.configs,
      instances: VLMImage.instances
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
    widgets: {
      configs: VLMWidget.configs
    }
  };
}

type VLMStorage = {
  videos: {
    configs: VLMVideo.DCLConfig[],
    instances: VLMVideo.DCLInstanceConfig,
    systems: VLMVideo.System
  },
  images: {
    configs: VLMImage.DCLConfig[],
    instances: VLMImage.DCLInstanceConfig
  },
  nfts: {
    configs: VLMNFT.DCLConfig[],
    instances: VLMNFT.DCLInstanceConfig
  },
  sounds: {
    configs: VLMSound.DCLConfig[],
    instances: VLMSound.DCLInstanceConfig[],
    systems: VLMSound.DCLSoundSystem[]
  },
  widgets: {
    configs: VLMWidget.DCLConfig[];
  }
};

/**
 * Environment initialization options. Allow you to choose which server to connect to.
 * @public
 */
type VLMInitConfig = {
  env: "dev" | "staging" | "prod";
  widgets?: VLMWidget.DCLConfig[];
};