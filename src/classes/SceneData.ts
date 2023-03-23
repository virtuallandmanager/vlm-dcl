import {
  TCustomizationConfig,
  TImageMaterialConfig,
  TNFTConfig,
  TVideoMaterialConfig,
} from "../types/index";
import { TDialogConfig } from "../types/Dialog";
import { TEventConfig } from "../types/Event";
import { TFeatureConfig } from "../types/Feature";
import { TModerationConfig } from "../types/Moderation";
import { TSceneFeatures } from "../types/SceneData";

export class SceneData {
  images: TImageMaterialConfig[] = [];
  videoScreens: TVideoMaterialConfig[] = [];
  nfts: TNFTConfig[] = [];
  moderation: TModerationConfig = {};
  events: TEventConfig[] = [];
  features: TFeatureConfig[] = [];
  dialogs: TDialogConfig[] = [];
  customizations: TCustomizationConfig[] = []
}

export class SceneFeatures {
  analytics: boolean = false;
  customizations: boolean = false;
  dialogs: boolean = false;
  entityPlacement: boolean = false;
  moderation: boolean = false;
  constructor(config?: TSceneFeatures) {
    if (config) {
      this.analytics = config.analytics || false;
      this.customizations = config.customizations || false;
      this.dialogs = config.dialogs || false;
      this.entityPlacement = config.entityPlacement || false;
      this.moderation = config.moderation || false;
    }
  }
}
