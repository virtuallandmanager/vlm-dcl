import { getEntityByName, getId } from "../helpers/entity";
import { IEmission, IPlayer, IPlaylist, ITexture, IVolume, ITransform } from "../interfaces/index";
import { videoInstances, videoMaterials, videoSystems } from "../storage";
import { EVideoSourceTypes, TClickEvent, TTransform, TVideoInstanceConfig, TVideoMaterialConfig } from "../types/index";
import { StoredEntityInstance, StoredEntityMaterial } from "./StoredEntity";

export class StoredVideoMaterial extends StoredEntityMaterial implements ITexture, IEmission, IVolume, IPlaylist, IPlayer {
  id: string;
  parent?: string;
  show: boolean;
  customRendering: boolean;
  instanceIds: string[] = [];
  textureMode: EVideoSourceTypes;
  roughness = 1.0;
  specularIntensity = 0;
  metallic = 0;
  emissiveColor = Color3.White();
  volume: number;
  videoTexture?: VideoTexture;
  imageTexture?: Texture;
  albedoTexture?: VideoTexture | Texture;
  emissiveTexture?: VideoTexture | Texture;
  liveLink?: string;
  playlist: string[];
  playlistIndex: number = 0;
  enableLiveStream?: boolean;
  clickEvent?: TClickEvent;
  public emissiveIntensity: number;
  public offType: EVideoSourceTypes;
  public offImage?: string;

  constructor(_config: TVideoMaterialConfig) {
    super(_config);
    this.id = getId(_config);
    this.parent = _config.parent;
    this.show = _config.show;
    this.enableLiveStream = _config.enableLiveStream;
    this.liveLink = _config.liveLink;
    this.offType = _config.offType;
    this.customRendering = !!_config.customRendering;
    this.emissiveIntensity = _config.emission;
    this.volume = _config.volume;
    this.playlist = _config.playlist;
    this.textureMode = this.enableLiveStream ? EVideoSourceTypes.LIVE : this.offType;
    this.updateTexture(this.liveLink);
    videoMaterials[this.id] = this;
    new StoredVideoCheckSystem(this);

    _config.instances.forEach((instance: TVideoInstanceConfig) => {
      this.createInstance(instance);
    });
  }

  remove: CallableFunction = () => {
    engine.removeSystem(videoSystems[this.id]);
    delete videoMaterials[this.id];
    delete videoSystems[this.id];
    [...this.instanceIds].forEach((instanceId: string) => {
      log(instanceId);
      this.removeInstance(instanceId);
    });
  };

  createInstance: CallableFunction = (_config: TVideoInstanceConfig) => {
    const instanceId: string = getId(_config);
    this.instanceIds.push(instanceId);
    videoInstances[instanceId] = new StoredVideoInstance(this, _config);
    videoInstances[instanceId].add();
  };

  removeInstance: CallableFunction = (instanceId: string) => {
    const localIdIndex: number = this.instanceIds.findIndex((id: string) => id == instanceId);

    this.instanceIds.splice(localIdIndex, 1);
    videoInstances[instanceId].remove();
    delete videoInstances[instanceId];
  };

  updateParent: CallableFunction = (parent: string) => {
    this.parent = parent;
    [...this.instanceIds].forEach((instanceId: string) => {
      if (!videoInstances[instanceId].parent) {
        videoInstances[instanceId].updateParent(parent);
      }
    });
  };

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

  updateVolume: CallableFunction = (_volume: number) => {
    this.volume = _volume;
    this.videoTexture!.volume = _volume;
  };

  updatePlaylist: CallableFunction = (_playlist: string[]) => {
    const currentlyPlayingVideo = this.playlist[this.playlistIndex];
    // Currently playing video is in newly updated playlist
    this.playlist = _playlist;

    if (this.textureMode == EVideoSourceTypes.PLAYLIST && !_playlist.includes(currentlyPlayingVideo)) {
      this.startPlaylist();
    }
  };

  startLive: CallableFunction = () => {
    this.textureMode = EVideoSourceTypes.LIVE;
    this.stop();
    this.updateTexture(this.liveLink);
    this.videoTexture.play();
  };

  startPlaylist: CallableFunction = () => {
    this.textureMode = EVideoSourceTypes.PLAYLIST;
    this.playlistIndex = 0;
    this.updateTexture(this.playlist[this.playlistIndex]);
    if (this.playlist.length > 1) {
      this.videoTexture.loop = true;
    }
    this.videoTexture.play();
  };

  playNextVideo: CallableFunction = () => {
    this.playlistIndex += 1;

    if (this.playlistIndex >= this.playlist.length) {
      this.playlistIndex = 0;
    }

    this.stop();

    this.updateTexture(this.playlist[this.playlistIndex]);

    this.videoTexture.play();
  };

  showImage: CallableFunction = () => {
    this.textureMode = EVideoSourceTypes.IMAGE;
    this.updateTexture(this.offImage);
  };

  stop: CallableFunction = () => {
    this.videoTexture!.reset();
  };
}

export class StoredVideoInstance extends StoredEntityInstance implements ITransform {
  id: string;
  materialId: string;
  parent?: string;
  position: TTransform;
  scale: TTransform;
  rotation: TTransform;

  constructor(_material: StoredVideoMaterial, _instance: TVideoInstanceConfig) {
    super(_material, _instance);
    this.id = getId(_instance);
    this.parent = _instance.parent;
    this.position = _instance.position;
    this.scale = _instance.scale;
    this.rotation = _instance.rotation;
    this.materialId = _material.id;
    this.addComponent(new PlaneShape());
    this.addComponent(_material);
    this.updateTransform(this.position, this.scale, this.rotation);

    if (this.parent) {
      this.updateParent(this.parent);
    } else {
      this.add();
    }
  }

  add: CallableFunction = () => {
    engine.addEntity(this);
  };

  remove: CallableFunction = () => {
    engine.removeEntity(this);
  };

  updateParent: CallableFunction = (parent: string) => {
    if (parent) {
      const instanceParent = getEntityByName(parent);
      this.setParent(instanceParent);
    } else {
      this.setParent(null);
    }
  };

  updateTransform: CallableFunction = (position: TTransform, scale: TTransform, rotation: TTransform) => {
    this.addComponentOrReplace(
      new Transform({
        position: new Vector3(position.x, position.y, position.z),
        scale: new Vector3(scale.x, scale.y, scale.z),
        rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z)
      })
    );
  };
}

export class StoredVideoCheckSystem implements ISystem {
  id: string;
  timer: number = 0;
  dtDelay: number = 0;
  video: StoredVideoMaterial;
  videoLength: number = 0;
  videoStatus: number = 0;
  checkingStatus: boolean = false;
  streamLive: boolean = false;
  initialCheckComplete: boolean = false;

  constructor(_storedVideoMaterial: StoredVideoMaterial) {
    this.video = videoMaterials[_storedVideoMaterial.id];
    this.id = getId(_storedVideoMaterial);
    videoSystems[_storedVideoMaterial.id] = this;
    engine.addSystem(videoSystems[_storedVideoMaterial.id]);
  }

  update(dt: number) {
    if (this.dtDelay > 10) {
      this.dtDelay = 0;
    } else {
      this.dtDelay++;
      return;
    }

    if (this.checkingStatus) {
      return;
    }

    // If live streaming is enabled, first check the status of the live stream
    if (this.video.enableLiveStream !== false) {
      executeTask(async () => {
        this.checkStreamStatus();
      });
    }

    if (!this.initialCheckComplete) {
      return;
    }

    if (this.video.enableLiveStream && this.streamLive && this.video.textureMode !== EVideoSourceTypes.LIVE) {
      this.video.startLive();
    }

    if (this.video.offType !== EVideoSourceTypes.IMAGE) {
      // If off type is not image, ignore this condition set and move on
    } else if (this.video.textureMode == EVideoSourceTypes.IMAGE) {
      // Off type is image, and texture is an image. Do nothing else.
      return;
    }

    ////////////////////////////////////////////////
    // We are NOT in IMAGE mode beyond this point.//
    ////////////////////////////////////////////////

    if (this.video.textureMode !== EVideoSourceTypes.LIVE) {
      // If we ARE NOT in LIVE mode, skip this condition set
    } else if (!this.streamLive) {
      // We ARE in LIVE mode.
      // If stream is DOWN, skip the next steps
    } else if (!this.video.videoTexture.playing) {
      // We ARE in LIVE mode. Stream is LIVE.
      // If stream is live but not playing anything, start live video
      this.video.startLive();
    } else {
      // We ARE in LIVE mode. Stream is LIVE. Video is PLAYING.
      // Do nothing else.
      return;
    }

    ///////////////////////////////////////////////
    // We are NOT in LIVE mode beyond this point.//
    ///////////////////////////////////////////////

    if (this.video.offType === EVideoSourceTypes.NONE) {
      // If off type is NONE, stop everything.
      this.video.stop();
      // TODO: REMOVE ALL INSTANCES
      return;
    }

    ///////////////////////////////////////////////
    // We are NOT in NONE mode beyond this point.//
    ///////////////////////////////////////////////

    //////////////////////////////////////////////////////////////
    //           Off type must now be PLAYLIST.                //
    //If not, we need to account for something that was added.//
    ///////////////////////////////////////////////////////////

    if (!this.video.videoTexture.playing) {
      // If video is not playing, start the playlist.
      this.video.startPlaylist();
    } else {
      onVideoEvent.add((data) => {
        this.videoStatus = data.videoStatus;
        this.videoLength = Math.floor(data.totalVideoLength);
        this.timer = Math.ceil(data.currentOffset);
      });

      if (this.videoLength < 0 || this.timer < 0 || !this.videoStatus) {
        return;
      }

      log(`Video ${this.video.playlistIndex + 1} in playlist | ${Math.round((this.timer / this.videoLength) * 100)}% Played | Video Status: ${VideoStatus[this.videoStatus]}`);
    }

    if (this.videoStatus > VideoStatus.READY && this.timer >= this.videoLength) {
      this.video.playNextVideo();
    }
  }

  checkStreamStatus: CallableFunction = async () => {
    if (!this.video.liveLink) {
      this.setLiveState(false);
      return;
    }

    try {
      this.checkingStatus = true;
      let res = await fetch(this.video.liveLink);
      this.setLiveState(res.status < 400);
    } catch (e) {
      log("video link issue!");
      this.setLiveState(false);
    }
  };

  setLiveState: CallableFunction = (liveState: boolean) => {
    if (this.streamLive !== liveState) {
      this.video.stop();
      log(`Change in live stream status! \n Stream is ${liveState ? "UP" : "DOWN"} | Stream URL: `, this.video.liveLink);
    }
    this.streamLive = liveState;
    this.checkingStatus = false;
    this.initialCheckComplete = true;
  };
}
