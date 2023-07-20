import { VLMSceneElement, VLMSceneElementInstance } from "../logic/VLMScene.logic";
import { VLMModeration } from "./VLMModeration.component";
import { VLMNotification } from "./VLMNotification.component";
import { VLMScene } from "./VLMScene.component";
import { VLMSession } from "./VLMSession.component";
import { VLMSound } from "./VLMSound.component";
import { VLMVideo } from "./VLMVideo.component";

@EventConstructor()
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

@EventConstructor()
export class VLMPathClientEvent {
  action: "path_start" | "path_segments_add" | "path_end";
  pathId?: string;
  pathSegments?: VLMSession.Path.Segment[];
  constructor(config: VLMPathClientEvent) {
    this.action = config.action;
    this.pathId = config.pathId;
    this.pathSegments = config.pathSegments;
  }
}

@EventConstructor()
export class VLMPathServerEvent {
  action: "path_started" | "path_segments_added";
  pathId?: string;
  added?: number;
  total?: number;
  constructor(config: VLMPathServerEvent) {
    this.action = config.action;
    this.pathId = config.pathId;
    this.added = config.added;
    this.total = config.total;
  }
}

@EventConstructor()
export class VLMSessionEvent {
  session: VLMSession.Config;
  constructor(config: VLMSessionEvent) {
    this.session = config.session;
  }
}

@EventConstructor()
export class VLMSoundStateEvent {
  action: "scene_sound_locators";
  elementData: VLMSound.DCLConfig;
  instanceData: VLMSound.DCLInstanceConfig;
  showLocators: boolean;
  userId: string;
  constructor(config: VLMSoundStateEvent) {
    this.elementData = config.elementData;
    this.instanceData = config.instanceData;
    this.showLocators = config.showLocators;
    this.userId = config.userId;
  }
}

@EventConstructor()
export class VLMSessionAction {
  action: string;
  metadata?: string;
  constructor(action: string, metadata?: any) {
    this.action = action;
    this.metadata = metadata;
  }
}

@EventConstructor()
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

@EventConstructor()
export class VLMClaimEvent {
  action: "claim" | "claim_received" | "claim_update" | "claim_error";
  claimAction: string;
  messageOptions?: VLMNotification.MessageOptions;
  constructor(config: VLMClaimEvent) {
    this.action = config.action;
    this.claimAction = config.claimAction;
    this.messageOptions = config.messageOptions;
  }
}

@EventConstructor()
export class VLMVideoStatusEvent {
  action: "scene_video_status";
  sceneId?: string;
  status?: VLMVideo.StreamState;
  url?: string;
  sk?: string;
  constructor(config: VLMVideoStatusEvent) {
    this.sceneId = config.sceneId;
    this.status = config.status;
    this.url = config.url;
    this.sk = config.sk;
  }
}

type ElementName = "image" | "video" | "nft" | "sound" | "widget";
type Action = "init" | "create" | "update" | "delete" | "trigger";
type Settings = "moderation";
type Property = "enabled" | "liveLink" | "imageLink" | "nftData" | "enableLiveStream" | "playlist" | "volume" | "emission" | "offType" | "offImage" | "transform" | "collider" | "parent" | "customId" | "clickEvent" | "transparency";

@EventConstructor()
export class VLMSceneMessage {
  action: Action;
  property?: Property;
  id?: string;
  element: ElementName;
  instance: boolean;
  settings: Settings;
  elementData?: VLMSceneElement;
  instanceData?: VLMSceneElementInstance;
  settingsData?: VLMModeration.VLMConfig;
  scenePreset: VLMScene.Preset;

  constructor(message: VLMSceneMessage) {
    this.action = message?.action;
    this.property = message?.property;
    this.id = message?.id;
    this.element = message?.element;
    this.instance = message?.instance;
    this.settings = message?.settings;
    this.elementData = message?.elementData;
    this.instanceData = message?.instanceData;
    this.settingsData = message?.settingsData;
    this.scenePreset = message?.scenePreset;
  }
}
