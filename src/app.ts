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

  public static storage = this.Storage;
}

export type VLMStorage = {
  video: {
    configs: VLMVideo.DCLConfig[],
    instances: VLMVideo.DCLInstanceConfig,
    systems: VLMVideo.VLMVideoSystem
  },
  image: {
    configs: VLMImage.DCLConfig[],
    instances: VLMImage.DCLInstanceConfig
  },
  nft: {
    configs: VLMNFT.DCLConfig[],
    instances: VLMNFT.DCLInstanceConfig
  },
  sound: {
    configs: VLMSound.DCLConfig[],
    instances: VLMSound.DCLInstanceConfig[],
    systems: VLMSound.DCLSoundSystem[]
  },
  widget: {
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
  modelFolder?: string;
  soundFolder?: string;
};