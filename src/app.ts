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
   * @param options - The VLM initialization options.
   * @public
   */
  public static init: CallableFunction = async (options?: VLMInitConfig) => {
    onSceneReadyObservable.addOnce(async () => {
      try {
        await VLMEnvironment.init(options?.env || "prod");
        await VLMSessionManager.start(VLM.version);
        VLMEventListeners.init();
      } catch (e) {
        VLMLogManager.logError(e, { message: "VLM INIT ERROR", version: VLM.version, env: options?.env || "prod", ...options });
      }
    });
  };
  public static configureWidgets: CallableFunction = async (options: VLMWidget.DCLConfig[]) => {
    return VLMWidgetManager.configureWidgets(options);
  };
}

/**
 * Environment initialization options. Allow you to choose which server to connect to.
 * @public
 */
type VLMInitConfig = {
  env: "dev" | "staging" | "prod";
};
