import { VLMSceneElement, VLMSceneElementInstance } from "../logic/VLMScene.logic";
import { PathPoint } from "../logic/VLMPath.logic";
import { VLMModeration } from "./VLMModeration.component";
import { VLMScene } from "./VLMScene.component";
import { VLMSession } from "./VLMSession.component";
import { VLMVideo } from "./VLMVideo.component";
import { VLMWidget } from "./VLMWidget.component";
import { VLMClaimPoint } from "./VLMClaimPoint.component";
import { VLMSound } from "./VLMSound.component";
export declare class VLMSystemEvent {
    action: "init" | "create" | "update" | "delete" | "trigger";
    element: "image" | "imageInstance" | "video" | "videoInstance" | "nft" | "nftInstance" | "sound" | "soundInstance" | "widget";
    data: any;
    constructor(config: VLMSystemEvent);
}
export declare class VLMUserMessage {
    id: string;
    type: "inbound" | "outbound" | "setState" | "getState";
    data: unknown | CallableFunction;
    sessionToken?: string;
    constructor(config: VLMUserMessage);
}
export declare class VLMPlayerPosition {
    positionData: PathPoint;
    userId: string;
    constructor(config: VLMPlayerPosition);
}
export declare class VLMWidgetInitEvent {
    configs: VLMWidget.VLMConfig[];
    constructor(configs: VLMWidget.VLMConfig[]);
}
export declare class VLMPathClientEvent {
    action: "path_start" | "path_segments_add" | "path_end";
    pathId?: string;
    pathSegments?: VLMSession.Path.Segment[];
    sessionToken?: string;
    constructor(config: VLMPathClientEvent);
}
export declare class VLMPathServerEvent {
    action: "path_started" | "path_segments_added";
    pathId?: string;
    added: number;
    total?: number;
    constructor(config: VLMPathServerEvent);
}
export declare class VLMSessionEvent {
    session: VLMSession.Config;
    user: VLMSession.User;
    constructor(config: VLMSessionEvent);
}
export declare class VLMSoundStateEvent {
    action: "scene_sound_locators";
    elementData: VLMSound.Config;
    instanceData: VLMSound.Instance;
    showLocators: boolean;
    userId: string;
    constructor(config: VLMSoundStateEvent);
}
export declare class VLMSessionAction {
    action: string;
    metadata?: string;
    sessionToken?: string;
    constructor(action: string, metadata?: any);
}
export declare class VLMEmoteAction {
    emote: string;
    constructor(emote: string);
}
export declare class VLMWitnessedAction {
    action: string;
    witnessed: boolean;
    metadata?: string;
    constructor(action: string, metadata?: any);
}
export declare class VLMClaimEvent implements VLMClaimPoint.ClaimResponse {
    action: "giveaway_claim" | "giveaway_claim_response";
    giveawayId: string;
    sk: string;
    sessionToken?: string;
    constructor(config: VLMClaimEvent);
}
export declare class VLMVideoStatusEvent {
    action: "scene_video_status";
    sceneId?: string;
    status?: VLMVideo.StreamState;
    url?: string;
    sk?: string;
    constructor(config: VLMVideoStatusEvent);
}
export declare class VLMSettingsEvent {
    action: "scene_settings_update";
    settingData: {
        settingValue: VLMModeration.VLMConfig;
    };
    constructor(config: VLMSettingsEvent);
}
type ElementName = "image" | "video" | "nft" | "sound" | "model" | "widget" | "claimpoint";
type Action = "init" | "create" | "update" | "delete" | "trigger";
type Setting = "localization" | "moderation" | "interoperability";
type Property = "enabled" | "liveSrc" | "imageSrc" | "nftData" | "enableLiveStream" | "playlist" | "volume" | "emission" | "offType" | "offImage" | "transform" | "collider" | "parent" | "customId" | "clickEvent" | "transparency";
export declare class VLMSceneMessage {
    action: Action;
    property?: Property;
    id?: string;
    element?: ElementName;
    instance?: boolean;
    setting?: Setting;
    elementData?: VLMSceneElement;
    instanceData?: VLMSceneElementInstance;
    settingData?: {
        settingValue: VLMModeration.VLMConfig;
    };
    scenePreset?: VLMScene.Preset;
    sceneSettings?: {
        moderation: VLMModeration.VLMConfig;
    };
    user?: {
        sk: string;
        connectedWallet: string;
        displayName: string;
    };
    constructor(message: VLMSceneMessage);
}
export declare class VLMSceneInitEvent {
    constructor();
}
export {};
