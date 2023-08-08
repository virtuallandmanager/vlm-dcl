import { FlatFetchInit, signedFetch } from "@decentraland/SignedFetch";
import { VLMSessionManager } from "./VLMSession.logic";

export abstract class VLMLogManager {
  static logError: CallableFunction = async (error: any, metadata: any) => {
    try {
      const platformData = await VLMSessionManager.getPlatformData();
      const payload: FlatFetchInit = {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ error, metadata: { ...platformData, ...metadata, ts: Date.now() } }),
      };

      const config = await signedFetch("https://api.vlm.gg/log/error", payload);
      if (config.ok) {
        return config.json;
      }
    } catch (error) {
      this.reportOutage();
    }
  };

  static reportOutage: CallableFunction = async () => {
    try {
      const platformData = await VLMSessionManager.getPlatformData();
      const payload: FlatFetchInit = {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ error: "Connection to the server could not be established.", metadata: { ...platformData, ts: Date.now() } }),
      };
      log("VLM: Connection error. Attempting to report to server.");
      await signedFetch("https://alerts.vlm.gg/report/outage", payload);
      log("VLM: Message successfully sent to inform VLM of outage.");
    } catch (error) {
      log("VLM: Could not connect to VLM's alert service either. Internet outage likely.");
    }
  };
}
