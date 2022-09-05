import { movePlayerTo } from "@decentraland/RestrictedActions";
import { getEntityByName, getId } from "../helpers/entity";
import { IEmission, IPlayer, IPlaylist, ITexture, IVolume, ITransform } from "../interfaces/index";
import {
  EClickEventType,
  EVideoSourceTypes,
  TClickEvent,
  TEntityInstanceConfig,
  TEntityMaterialConfig,
  TTransform,
  TVideoInstanceConfig,
  TVideoMaterialConfig
} from "../types/index";
import { Sound, Stream } from "./Sound";

export class StoredEntityMaterial extends Material implements ITexture, IEmission {
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

  constructor(_config: TVideoMaterialConfig) {
    super();
    this.id = getId(_config);
    this.parent = _config.parent;
    this.show = _config.show;
    this.customRendering = !!_config.customRendering;
    this.emissiveIntensity = _config.emission;
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

export class StoredEntityInstance extends Entity implements ITransform {
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

  constructor(_material: StoredEntityMaterial, _instance: TEntityInstanceConfig) {
    const id = getId(_instance);
    super(`${_instance.name} - ${id}`);
    this.id = id;
    this.show = _instance.show;
    this.parent = _instance.parent;
    this.position = _instance.position;
    this.scale = _instance.scale;
    this.rotation = _instance.rotation;
    this.materialId = _material.id;
  }

  updateParent: CallableFunction = (_parent: string) => {
    const instanceParent = getEntityByName(_parent);
    this.setParent(instanceParent);
  };

  updateTransform: CallableFunction = (_transform: TranformConstructorArgs) => {
    this.addComponentOrReplace(new Transform(_transform));
  };

  updateClickEvent: CallableFunction = (_clickEvent: TClickEvent) => {
    const clickEventType = _clickEvent.type,
      options = { showFeedback: _clickEvent.showFeedback, hoverText: _clickEvent.hoverText },
      hasClickEvent = this.getComponentOrNull(OnPointerDown);

    let clickAction;

    if (clickEventType == EClickEventType.NONE && hasClickEvent) {
      this.removeComponent(OnPointerDown);
    } else if (clickEventType == EClickEventType.EXTERNAL && _clickEvent.externalLink) {
      clickAction = openExternalURL(_clickEvent.externalLink);
    } else if (clickEventType == EClickEventType.MOVE && _clickEvent.moveTo) {
      clickAction = movePlayerTo(_clickEvent.moveTo.position, _clickEvent.moveTo.cameraTarget);
    } else if (clickEventType == EClickEventType.TELEPORT && _clickEvent.teleportTo) {
      clickAction = teleportTo(_clickEvent.teleportTo);
    } else if (clickEventType == EClickEventType.SOUND && _clickEvent.sound) {
      clickAction = new Sound(_clickEvent.sound);
    } else if (clickEventType == EClickEventType.STREAM && _clickEvent.sound) {
      clickAction = new Stream(_clickEvent.sound);
    }
  };
}
