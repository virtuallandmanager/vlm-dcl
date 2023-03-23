import { isPreviewMode } from "@decentraland/EnvironmentAPI";

export abstract class AppEnvironment {
  static devMode: boolean;
  private static wssUrls = {
    dev: "ws://localhost:3010",
    staging: "wss://staging-api.dcl-vlm.io",
    prod: "wss://api.dcl-vlm.io",
  };

  private static apiUrls = {
    dev: "http://localhost:3010",
    staging: "https://staging-api.dcl-vlm.io",
    prod: "https://api.dcl-vlm.io",
  };

  static apiUrl: string = "https://api.dcl-vlm.io";
  static wssUrl: string = "wss://api.dcl-vlm.io";

  static init: CallableFunction = async (env: string) => {
    this.devMode = await isPreviewMode();
    if (!env || (env !== "prod" && !this.devMode)) {
      env = "prod";
    }

    log(`VLM: Initializing ${env} environment`);
    this.wssUrl = this.wssUrls[env];
    log("VLM: WebSocket Server set to " + this.wssUrl);
    log(env)
    this.apiUrl = this.apiUrls[env];
    log("VLM: HTTPS Server set to " + this.apiUrl);
  };
}
