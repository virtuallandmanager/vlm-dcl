import { movePlayerTo } from "@decentraland/RestrictedActions";
import {
  sdkImageFlippedDimension,
  sdkImagesAreFlipped,
  sdkVideoFlippedDimension,
  sdkVideosAreFlipped,
} from "../helpers/defaults";
import { getEntityByName } from "../helpers/entity";
import {
  IEmission,
  IPlayer,
  IPlaylist,
  ITexture,
  IVolume,
  ITransform,
} from "../interfaces/index";
import {
  EClickEventType,
  EVideoSourceTypes,
  TClickEvent,
  TEntityInstanceConfig,
  TEntityMaterialConfig,
  TTransform,
  TVideoInstanceConfig,
  TVideoMaterialConfig,
} from "../types/index";
import { Sound, Stream } from "./Sound";
import { StoredImageInstance } from "./StoredImage";
import { StoredVideoInstance } from "./StoredVideo";

export class StoredEntityMaterial
  extends Material
  implements ITexture, IEmission
{
  id: string;
  customId?: string;
  parent?: string;
  show: boolean;
  customRendering: boolean;
  albedoTexture?: VideoTexture | Texture;
  emissiveTexture?: VideoTexture | Texture;
  roughness = 1.0;
  specularIntensity = 0;
  metallic = 0;
  emissiveColor = Color3.White();
  emissiveIntensity: number;
  clickEvent?: TClickEvent;

  constructor(_config: TEntityMaterialConfig) {
    super();
    this.id = _config.id;
    this.parent = _config.parent;
    this.show = _config.show || true;
    this.customRendering = !!_config.customRendering;
    this.emissiveIntensity = _config.emission || 0;
    this.clickEvent = _config.clickEvent;
  }

  updateTexture: CallableFunction = (_url: string) => {
    const texture = new Texture(_url, { hasAlpha: true });
    this.albedoTexture = texture;
    this.emissiveTexture = texture;
  };

  updateBrightness: CallableFunction = (_brightness: number) => {
    this.emissiveIntensity = _brightness;
  };
}

export class StoredEntityShape extends Shape {
  id: string;
  customId?: string;
  parent?: string;
  show: boolean;

  constructor(_config: TEntityMaterialConfig) {
    super();
    this.id = _config.id;
    this.parent = _config.parent;
    this.show = _config.show || true;
  }
}

export class StoredEntityConfig {
  id: string;
  customId?: string;
  parent?: string;
  show: boolean;

  constructor(_config: TEntityMaterialConfig) {
    this.id = _config.id;
    this.parent = _config.parent;
    this.show = _config.show || true;
  }
}

export class StoredEntityInstance extends Entity {
  id: string;
  show: boolean;
  name: string;
  customId?: string;
  customRendering?: boolean;
  materialId: string;
  parent?: string;
  position: TTransform;
  scale: TTransform;
  rotation: TTransform;
  clickEvent?: TClickEvent;
  defaultClickEvent?: TClickEvent;
  modifiedTransform: {
    position: TTransform;
    scale: TTransform;
    rotation: TTransform;
  };

  constructor(
    _material: StoredEntityMaterial | StoredEntityConfig,
    _instance: TEntityInstanceConfig
  ) {
    const id = _instance.id;
    super(`${_instance.name} - ${id}`);
    this.id = id;
    this.customId = _instance.customId;
    this.name = _instance.name;
    this.show = _instance.show;
    this.parent = _instance.parent;
    this.position = _instance.position;
    this.scale = _instance.scale;
    this.rotation = _instance.rotation;
    this.modifiedTransform = {
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
    };
    this.materialId = _material.id;
    this.clickEvent = _instance.clickEvent;
  }
}
