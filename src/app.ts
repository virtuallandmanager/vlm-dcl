import { getParcel, SceneJsonData } from "@decentraland/ParcelIdentity";
import { getUserData, UserData } from "@decentraland/Identity";
import Colyseus from "colyseus.js";
import { DCLSession } from "./session";
import { AppEnvironment } from "./environment";

export class VLM {
  static activeServer: string;
  static multiplayerRoom: Colyseus.Room;
  static userData: UserData;
  static sceneJsonData: VLMSceneJsonData;
  static uiCanvas: UICanvas = new UICanvas();

  constructor(options: VLMInitConfig) {
    VLM.init(options);
  }

  private static init: CallableFunction = async (options: VLMInitConfig) => {
    this.userData = await getUserData();
    this.sceneJsonData = await (await getParcel()).land.sceneJsonData;
    onSceneReadyObservable.addOnce(async () => {
      await AppEnvironment.init(options.env);
      await new DCLSession().start();
    });
  };
}

type VLMInitConfig = {
  env: "dev" | "staging" | "prod";
};

export type VLMSceneJsonData = SceneJsonData & {
  vlmScene?: {
    [sceneId: string]: string;
  };
};
