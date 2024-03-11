import { VLMSessionManager } from "../logic/VLMSession.logic";
import { VLMSceneElement, VLMSceneElementInstance } from "../logic/VLMScene.logic";
import { PathPoint } from "../logic/VLMPath.logic";
import { VLMModeration } from "./VLMModeration.component";
// import { VLMNotification } from "./VLMNotification.component";
import { VLMScene } from "./VLMScene.component";
import { VLMSession } from "./VLMSession.component";
// import { VLMSound } from "./VLMSound.component";
import { VLMVideo } from "./VLMVideo.component";
import { VLMWidget } from "./VLMWidget.component";
// import { VLMClaimPoint } from "./VLMClaimPoint.component";
import { VLMSound } from "./VLMSound.component";
import { StreamState } from "../shared/interfaces";
import { VLMClaimPoint } from "./VLMClaimPoint.component";
import { VLMNotification } from "./VLMNotification.component";
// import { VLMClaimPoint } from "./VLMClaimPoint.component";


export class VLMSystemEvent {
  action: "init" | "create" | "update" | "delete" | "trigger";
  element: "image" | "imageInstance" | "video" | "videoInstance" | "nft" | "nftInstance" | "sound" | "soundInstance" | "widget";
  data: any;
  constructor(config: VLMSystemEvent) {
    this.action = config.action;
    this.element = config.element;
    this.data = config.data;
  }
}


export class VLMUserMessage {
  id: string;
  type: "inbound" | "outbound" | "setState" | "getState";
  data: unknown | CallableFunction;
  sessionToken?: string;
  constructor(config: VLMUserMessage) {
    this.id = config.id;
    this.type = config.type;
    this.data = config.data;
    this.sessionToken = VLMSessionManager.sessionData?.sessionToken;
  }
}


export class VLMPlayerPosition {
  positionData: PathPoint;
  userId: string;
  constructor(config: VLMPlayerPosition) {
    this.positionData = config.positionData;
    this.userId = config.userId;
  }
}


export class VLMWidgetInitEvent {
  configs: VLMWidget.VLMConfig[];
  constructor(configs: VLMWidget.VLMConfig[]) {
    this.configs = configs;
  }
}


export class VLMPathClientEvent {
  action: "path_start" | "path_movement_started" | "path_segments_add" | "path_end";
  pathId?: string;
  pathSegments?: VLMSession.Path.Segment[];
  sessionToken?: string;
  constructor(config: VLMPathClientEvent) {
    this.action = config.action;
    this.pathId = config.pathId;
    this.pathSegments = config.pathSegments;
    this.sessionToken = VLMSessionManager.sessionData?.sessionToken;
  }
}


export class VLMPathServerEvent {
  action: "path_started" | "path_segments_added";
  pathId?: string;
  added: number = 0;
  total?: number;
  constructor(config: VLMPathServerEvent) {
    this.action = config.action;
    this.pathId = config.pathId;
    this.added = config.added || 0;
    this.total = config.total;
  }
}


export class VLMSessionEvent {
  session: VLMSession.Config;
  user: VLMSession.User;
  constructor(config: VLMSessionEvent) {
    this.session = config.session;
    this.user = config.user;
  }
}


export class VLMSoundStateEvent {
  action: "scene_sound_locators" = "scene_sound_locators";
  elementData: VLMSound.Config;
  instanceData: VLMSound.Instance;
  showLocators: boolean;
  userId: string;
  constructor(config: VLMSoundStateEvent) {
    this.elementData = config.elementData;
    this.instanceData = config.instanceData;
    this.showLocators = config.showLocators;
    this.userId = config.userId;
  }
}


export class VLMSessionAction {
  action: string;
  metadata?: string;
  sessionToken?: string;
  constructor(action: string, metadata?: any) {
    this.action = action;
    this.metadata = metadata;
    this.sessionToken = VLMSessionManager.sessionData?.sessionToken;
  }
}


export class VLMEmoteAction {
  emote: string;
  constructor(emote: string) {
    this.emote = emote;
  }
}


export class VLMWitnessedAction {
  action: string;
  witnessed: boolean;
  metadata?: string;
  constructor(action: string, metadata?: any) {
    this.witnessed = true;
    this.action = action;
    this.metadata = metadata;
  }
}

export class VLMClaimEvent implements VLMClaimPoint.ClaimResponse {
  action: "giveaway_claim" | "giveaway_claim_response";
  giveawayId: string;
  sk: string;
  messageOptions?: VLMNotification.MessageOptions;
  type?: VLMClaimPoint.ClaimResponseType;
  reason?: VLMClaimPoint.ClaimRejection;
  sessionToken?: string;
  constructor(config: VLMClaimEvent) {
    this.sk = config.sk;
    this.action = config.action;
    this.giveawayId = config.giveawayId;
    this.reason = config.reason;
    this.messageOptions = config.messageOptions;
    this.sessionToken = VLMSessionManager.sessionData?.sessionToken;
  }
}


export class VLMVideoStatusEvent {
  action: "scene_video_status" = "scene_video_status";
  sceneId?: string;
  status?: StreamState;
  url?: string;
  sk?: string;
  constructor(config: VLMVideoStatusEvent) {
    this.sceneId = config.sceneId;
    this.status = config.status;
    this.url = config.url;
    this.sk = config.sk;
  }
}


export class VLMSettingsEvent {
  action: "scene_settings_update" = "scene_settings_update";
  settingData: { settingValue: VLMModeration.VLMConfig };
  constructor(config: VLMSettingsEvent) {
    this.settingData = config.settingData;
  }
}

type ElementName = "image" | "video" | "nft" | "sound" | "model" | "widget" | "claimpoint";
type Action = "init" | "create" | "update" | "delete" | "trigger";
type Setting = "localization" | "moderation" | "interoperability";
type Property = "enabled" | "liveSrc" | "imageSrc" | "nftData" | "enableLiveStream" | "playlist" | "volume" | "emission" | "offType" | "offImage" | "transform" | "collider" | "parent" | "customId" | "clickEvent" | "transparency";


export class VLMSceneMessage {
  action: Action;
  property?: Property;
  id?: string;
  element?: ElementName;
  instance?: boolean;
  setting?: Setting;
  elementData?: VLMSceneElement;
  instanceData?: VLMSceneElementInstance;
  settingData?: { settingValue: VLMModeration.VLMConfig };
  scenePreset?: VLMScene.Preset;
  sceneSettings?: { moderation: VLMModeration.VLMConfig };
  user?: { sk: string, connectedWallet: string, displayName: string };

  constructor(message: VLMSceneMessage) {
    this.action = message?.action;
    this.property = message?.property;
    this.id = message?.id;
    this.element = message?.element;
    this.instance = message?.instance;
    this.setting = message?.setting;
    this.elementData = message?.elementData;
    this.instanceData = message?.instanceData;
    this.settingData = message?.settingData;
    this.sceneSettings = message?.sceneSettings;
    this.scenePreset = message?.scenePreset;
    this.user = message?.user;
  }
}
