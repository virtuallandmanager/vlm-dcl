import { isPreviewMode } from "@decentraland/EnvironmentAPI";

export abstract class VLMEnvironment {
  static devMode: boolean;
  private static wssUrls: { [env: string]: string } = {
    dev: "ws://localhost:3010",
    staging: "wss://staging-api.vlm.gg",
    production: "wss://api.vlm.gg",
  };

  private static apiUrls: { [env: string]: string } = {
    dev: "http://localhost:3010",
    staging: "https://staging-api.vlm.gg",
    prod: "https://api.vlm.gg",
  };

  static apiUrl: string = "https://api.vlm.gg";
  static wssUrl: string = "wss://api.vlm.gg";

  static init: CallableFunction = async (env: string) => {
    this.devMode = await isPreviewMode();
    if (!env || (env !== "prod" && !this.devMode)) {
      env = "prod";
    }

    log(`VLM: Initializing ${env} environment`);
    this.apiUrl = this.apiUrls[env];
    log("VLM: HTTPS Server set to " + this.apiUrl);
    this.wssUrl = this.wssUrls[env];
    log("VLM: WebSocket Server set to " + this.wssUrl);
  };
}
