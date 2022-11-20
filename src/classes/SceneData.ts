import { TImageMaterialConfig, TNFTConfig, TVideoMaterialConfig } from "../types";
import { TDialogConfig } from "../types/Dialog";
import { TEventConfig } from "../types/Event";
import { TFeatureConfig } from "../types/Feature";
import { TModerationConfig } from "../types/Moderation";

export class SceneData {
  images: TImageMaterialConfig[] = [];
  imageTextures: TImageMaterialConfig[] = [];
  videoScreens: TVideoMaterialConfig[] = [];
  videoSystems: TVideoMaterialConfig[] = [];
  nfts: TNFTConfig[] = [];
  moderation: TModerationConfig = {};
  events: TEventConfig[] = [];
  features: TFeatureConfig[] = [];
  dialogs: TDialogConfig[] = [];
}

export class SceneFeatures {
  analytics: boolean = false;
  customizations: boolean = false;
  dialogs: boolean = false;
  entityPlacement: boolean = false;
  moderation: boolean = false;
}
