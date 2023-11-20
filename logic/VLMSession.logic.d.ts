/// <reference types="@dcl/js-runtime" />
import { UserData } from "~system/UserIdentity";
import { VLMSession } from "../components/VLMSession.component";
import { Client, Room } from "colyseus.js";
import { EnvironmentRealm } from "~system/EnvironmentApi";
export declare abstract class VLMSessionManager {
    static dclUserData: UserData;
    static sessionUser: VLMSession.User;
    static sessionData: VLMSession.Config;
    static client: Client;
    static playerPathId?: string;
    static sceneRoom: Room;
    static platformData: PlatformData;
    static connected: boolean;
    static connecting: boolean;
    static start: CallableFunction;
    static end: CallableFunction;
    static requestToken: CallableFunction;
    static joinRelayRoom: CallableFunction;
    static reconnect: CallableFunction;
    static getPlatformData: CallableFunction;
}
export type VLMSceneJsonData = {
    vlm?: {
        sceneId?: string;
    };
};
export type PlatformData = {
    user?: UserData;
    baseParcel?: string;
    sceneJsonData?: VLMSceneJsonData;
    sceneId?: string;
    subPlatform?: string;
    world?: string;
    environment?: string;
    location?: {
        world: string;
        location?: string;
        coordinates?: string[] | number[];
        parcels?: string[];
        realm?: EnvironmentRealm;
        integrationData?: IntegrationData;
    };
};
export type IntegrationData = {
    sdkVersion?: string;
    packageVersion?: string;
};
