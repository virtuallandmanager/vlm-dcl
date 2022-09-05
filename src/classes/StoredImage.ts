import { getEntityByName, getId } from "../helpers/entity";
import { IEmission, ITexture, ITransform } from "../interfaces";
import { TEntityInstanceConfig, TEntityMaterialConfig } from "../types";
import { TTransform } from "../types/Transform";
import { EVideoSourceTypes } from "../types/VideoScreen";

export class StoredImageMaterial extends Material implements ITexture, IEmission {
  public id: string;
  public parent: string;
  public customRendering: boolean;
  public videoTexture: VideoTexture;
  public imageTexture: Texture;
  albedoTexture: VideoTexture | Texture;
  emissiveTexture: VideoTexture | Texture;
  roughness = 1.0;
  specularIntensity = 0;
  metallic = 0;
  emissiveColor = Color3.White();
  emissiveIntensity: number;
  volume: number;
  public offType: EVideoSourceTypes;
  public liveLink: string;
  public playlist: string[];
  public offImage?: string;
  enableLiveStream?: boolean;
  public textureMode: EVideoSourceTypes;

  constructor(_config: TEntityMaterialConfig) {
    super();
    this.id = getId(_config);
    this.customRendering = _config.customRendering;
    this.emissiveIntensity = _config.emission;
  }

  updateTexture: CallableFunction = (_url: string) => {
    if (this.textureMode == EVideoSourceTypes.IMAGE) {
      const texture = new Texture(_url, { hasAlpha: true });
      this.imageTexture = texture;
      this.albedoTexture = texture;
      this.emissiveTexture = texture;
    } else {
      const texture = new VideoTexture(new VideoClip(_url));
      this.videoTexture = texture;
      this.albedoTexture = texture;
      this.emissiveTexture = texture;
    }
  };

  updateBrightness: CallableFunction = (_brightness: number) => {
    this.emissiveIntensity = _brightness;
  };

  updateVolume: CallableFunction = (_volume: number) => {
    this.volume = _volume;
    this.videoTexture.volume = _volume;
  };

  updatePlaylist: CallableFunction = (_playlist: string[]) => {
    this.playlist = _playlist;
  };

  startLive: CallableFunction = () => {
    this.textureMode = EVideoSourceTypes.LIVE;
    this.updateTexture(this.liveLink);
    this.videoTexture.play();
  };

  startLoop: CallableFunction = () => {
    this.textureMode = EVideoSourceTypes.PLAYLIST;
    this.updateTexture(this.playlist[0]);
    this.videoTexture.play();
  };

  showImage: CallableFunction = () => {
    this.textureMode = EVideoSourceTypes.IMAGE;
    this.updateTexture(this.offImage);
  };

  stop: CallableFunction = () => {
    this.videoTexture.pause();
    this.videoTexture.reset();
  };
}

export class StoredImageInstance extends Entity implements ITransform {
  id: string;
  materialId: string;
  parent: string;
  position: TTransform;
  scale: TTransform;
  rotation: TTransform;

  constructor(_instance: TEntityInstanceConfig, _materialId: string) {
    super(_instance.name);
    this.id = getId(_instance);
    this.position = _instance.position;
    this.scale = _instance.scale;
    this.rotation = _instance.rotation;
    this.materialId = _materialId;
    this.addComponent(new PlaneShape());

    // const material = videoMaterials[this.materialId];
    // this.addComponent(material);
  }

  updateParent: CallableFunction = (_parent: string) => {
    const instanceParent = getEntityByName(_parent);
    this.setParent(instanceParent);
  };

  updateTransform: CallableFunction = (_transform: TranformConstructorArgs) => {
    this.addComponentOrReplace(new Transform(_transform));
  };
}
