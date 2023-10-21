import { VLMEnvironment } from "../environment";
import { signedFetch } from "@decentraland/SignedFetch";
import { getCurrentRealm, getPlatform } from "@decentraland/EnvironmentAPI";
import { UserData, getUserData } from "@decentraland/Identity";
import { VLMSession } from "../components/VLMSession.component";
import { SceneJsonData, getParcel } from "@decentraland/ParcelIdentity";
import { Client, Room } from "colyseus.js";
import { VLMNotificationManager } from "./VLMNotification.logic";

export abstract class VLMSessionManager {
  static dclUserData: UserData;
  static sessionUser: VLMSession.User;
  static sessionData: VLMSession.Config;
  static client: Client;
  static playerPathId?: string;
  static eventsBound: boolean = false;
  static sceneRoom: Room;
  static platformData: PlatformData = {};
  static connected: boolean;
  static connecting: boolean;
  static events: EventManager = new EventManager();

  static start: CallableFunction = async (version: string) => {
    try {
      await this.getPlatformData(version);
      if (!this.platformData?.sceneId) {
        return {};
      }
      const { session, user } = await this.requestToken();
      this.sessionData = session;
      this.sessionUser = user;

      if (this.sessionData) {
        this.sceneRoom = await this.joinRelayRoom(this.sessionData);
      }
      return { sceneRoom: this.sceneRoom, sessionData: this.sessionData };
    } catch (error) {
      log("VLM CONNECTION ERROR! :", error, this.sceneRoom);
      throw error;
    }
  };

  static end: CallableFunction = async () => {
    if (this.sceneRoom) {
      this.sceneRoom.send("session_end", {
        session: this.sessionData,
      });
      this.sceneRoom.leave(true);
    }
  };

  static requestToken: CallableFunction = async () => {
    let body = JSON.stringify({
      ...this.platformData,
    });

    try {
      let res = await signedFetch(`${VLMEnvironment.apiUrl}/auth/decentraland`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      let json;
      if (res.text) {
        json = JSON.parse(res.text);
      }
      return json;
    } catch (error) {
      VLMNotificationManager.addMessage("There was a problem loading this scene...please try to refresh. An error has been logged.");
      throw error;
    }
  };

  static joinRelayRoom: CallableFunction = async (session?: VLMSession.Config) => {
    try {
      this.client = new Client(VLMEnvironment.wssUrl);

      const sceneRoom = await this.client.joinOrCreate("vlm_scene", {
        ...this.platformData,
        ...session,
      });

      log("VLM Connected!", sceneRoom);
      log("VLM Session Data", this.sessionData)

      if (sceneRoom) {
        this.sceneRoom = sceneRoom;
        this.connected = true;
        this.connecting = false;
      }

      return sceneRoom;
    } catch (error) {
      VLMNotificationManager.addMessage("Virtual Land Manager could not load the scene...please try to refresh. An error has been logged.");
      throw error;
    }
  };

  static reconnect: CallableFunction = () => {
    try {
      this.connected = false;
    } catch (error) {
      throw error;
    }
  };

  static getPlatformData: CallableFunction = async (packageVersion: string) => {
    try {
      let [userData, parcel, platform, realm] = await Promise.all([getUserData(), getParcel(), getPlatform(), getCurrentRealm()]);

      const sceneJsonData = parcel.land.sceneJsonData as VLMSceneJsonData,
        baseParcel = sceneJsonData.scene.base,
        parcels = sceneJsonData.scene.parcels,
        sceneId = sceneJsonData?.vlm?.sceneId,
        user = userData ? (({ avatar, ...data }) => data)(userData) : {};

      const platformData = this.platformData;
      platformData.world = "decentraland";
      platformData.subPlatform = platform;
      platformData.sceneJsonData = sceneJsonData;
      platformData.baseParcel = baseParcel;
      platformData.sceneId = sceneId;
      platformData.user = user as UserData;
      platformData.location = {
        world: "decentraland",
        location: sceneJsonData?.display?.title,
        coordinates: baseParcel.split(","),
        parcels,
        realm,
        integrationData: { sdkVersion: "6.12.2", packageVersion }
      };
      platformData.environment = VLMEnvironment.devMode ? "dev" : "prod";
      this.dclUserData = userData as UserData;
      return { ...this.platformData, ...platformData };
    } catch (error) {
      throw error;
    }
  };
}

export type VLMSceneJsonData = SceneJsonData & {
  vlm?: { sceneId?: string };
};

export type RealmData = {
  serverName?: string;
  layer?: string;
  displayName?: string;
  domain?: string;
  layerId?: string;
  serverURL?: string;
  usersCount?: number;
  capacity?: number;
  maxUsers?: number;
  usersParcels?: string[];
  usersCountByLayer?: { [key: string]: number };
  usersParcelsByLayer?: { [key: string]: string[] };
};

export type PlatformData = {
  user?: UserData;
  baseParcel?: string;
  sceneJsonData?: VLMSceneJsonData;
  sceneId?: string;
  subPlatform?: string;
  world?: string;
  environment?: string;
  location?: { world: string; location?: string; coordinates?: string[] | number[], parcels?: string[], realm: RealmData, integrationData?: IntegrationData };
};

export type IntegrationData = {
  sdkVersion?: string;
  packageVersion?: string;
}