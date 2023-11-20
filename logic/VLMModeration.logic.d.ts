import { VLMModeration } from "../components/VLMModeration.component";
type ParcelBound = {
    x: number;
    z: number;
    n: number;
    e: number;
    s: number;
    w: number;
    nr: number;
    er: number;
    sr: number;
    wr: number;
    hasAdjacentNorth?: boolean;
    hasAdjacentEast?: boolean;
    hasAdjacentSouth?: boolean;
    hasAdjacentWest?: boolean;
};
export declare abstract class VLMModerationManager {
    static moderationSettings: VLMModeration.Config;
    static accessAllowed: boolean;
    static bannedUser: boolean;
    static bannedWearable: boolean;
    static initialized: boolean;
    static inScene: boolean;
    static parcels: string[];
    static baseParcel: {
        x: number;
        z: number;
    };
    static sceneHeight: number;
    static parcelBounds: ParcelBound[];
    static currentWallType: VLMModeration.BanWallType;
    static messages: {
        bannedUser: string;
        bannedWearable: string;
        accessRestricted: string;
    };
    static crashUser: boolean;
    static timer: number;
    static memoryHog: string[];
}
export {};
