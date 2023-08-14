import { UserData } from "@decentraland/Identity";
import { VLMEnvironment } from "./environment";
import { VLMSessionManager } from "./logic/VLMSession.logic";
import { VLMEventListeners } from "./logic/VLMSystemListeners.logic";
import { VLMLogManager } from "./logic/VLMLogging";
import { VLMWidget } from "./components/VLMWidget.component";
import { VLMWidgetManager } from "./logic/VLMWidget.logic";

/**
 * The main entry point for the VLM library.
 * @public
 */
export class VLM {
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
    onSceneReadyObservable.addOnce(async () => {
      try {
        if (config?.widgets) {
          VLMWidgetManager.configureWidgets(config.widgets);
        }
        await VLMEnvironment.init(config?.env || "prod");
        await VLMSessionManager.start(VLM.version);
        VLMEventListeners.init();
      } catch (error) {
        VLMLogManager.logError(error, { ...config, message: "VLM INIT ERROR", version: VLM.version, env: config?.env || "prod",  });
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
}

/**
 * Environment initialization options. Allow you to choose which server to connect to.
 * @public
 */
type VLMInitConfig = {
  env: "dev" | "staging" | "prod";
  widgets?: VLMWidget.DCLConfig[];
};