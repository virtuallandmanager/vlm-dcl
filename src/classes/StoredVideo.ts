import {
  sdkImageFlippedDimension,
  sdkImagesAreFlipped,
  sdkImagesFace,
  sdkVideoFlippedDimension,
  sdkVideosAreFlipped,
  sdkVideosFace,
  vlmImagesFace,
  vlmVideosFace
} from "../helpers/defaults";
import { getEntityByName } from "../helpers/entity";
import { IEmission, IPlayer, IPlaylist, ITexture, IVolume, ITransform } from "../interfaces/index";
import { videoInstances, videoMaterials, videoSystems } from "../storage";
import { EVideoSourceTypes, TClickEvent, TTransform, TVideoInstanceConfig, TVideoMaterialConfig } from "../types/index";
import { StoredEntityInstance, StoredEntityMaterial } from "./StoredEntity";

export class StoredVideoMaterial extends StoredEntityMaterial implements ITexture, IEmission, IVolume, IPlaylist, IPlayer {
  id: string;
  parent?: string;
  show: boolean;
  customRendering: boolean;
  instanceIds: string[] | any = [];
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
  withCollisions: boolean;
  videoClipId?: string;
  public emissiveIntensity: number;
  public offType: EVideoSourceTypes;
  public offImageLink?: string;

  constructor(_config: TVideoMaterialConfig) {
    super(_config);
    this.id = _config.id;
    this.customId = _config.customId;
    this.parent = _config.parent;
    this.show = _config.show;
    this.enableLiveStream = _config.enableLiveStream;
    this.liveLink = _config.liveLink;
    this.offType = _config.offType;
    this.offImageLink = _config.offImageLink;
    this.customRendering = !!_config.customRendering;
    this.emissiveIntensity = _config.emission || 1;
    this.volume = _config.volume;
    this.playlist = _config.playlist;
    this.withCollisions = _config.withCollisions;
    this.textureMode = this.enableLiveStream ? EVideoSourceTypes.LIVE : null;
    this.updateTexture(this.liveLink);
    videoMaterials[this.id] = this;

    if (this.customId) {
      videoMaterials[this.customId] = videoMaterials[this.id];
    }

    if (this.customRendering) {
      return;
    }

    _config.instances.forEach((instance: TVideoInstanceConfig) => {
      this.createInstance(instance);
    });

    new StoredVideoCheckSystem(this);
  }

  remove: CallableFunction = () => {
    [...this.instanceIds].forEach((instanceId: string) => {
      videoInstances[instanceId].remove();
    });
  };

  delete: CallableFunction = () => {
    engine.removeSystem(videoSystems[this.id]);
    delete videoSystems[this.id];
    delete videoMaterials[this.id];
    [...this.instanceIds].forEach((instanceId: string) => {
      videoInstances[instanceId].delete();
    });
  };

  showAll: CallableFunction = () => {
    [...this.instanceIds].forEach((instanceId: string) => {
      const visible = videoInstances[instanceId].show,
        parent = videoInstances[instanceId].parent || this.parent;

      if (!visible) {
        return;
      } else if (parent) {
        videoInstances[instanceId].updateParent(parent);
      } else {
        videoInstances[instanceId].add();
      }
    });
  };

  createInstance: CallableFunction = (_config: TVideoInstanceConfig) => {
    this.instanceIds.push(_config.id);
    videoInstances[_config.id] = new StoredVideoInstance(this, _config);
    if (_config.customId) {
      videoInstances[_config.customId] = videoInstances[_config.id];
    }
  };

  removeInstance: CallableFunction = (instanceId: string) => {
    videoInstances[instanceId].remove();
  };

  deleteInstance: CallableFunction = (instanceId: string) => {
    this.instanceIds = this.instanceIds.filter((id: string) => id !== instanceId);
    videoInstances[instanceId].delete();
  };

  addInstance: CallableFunction = (instanceId: string) => {
    videoInstances[instanceId].add();
  };

  updateParent: CallableFunction = (parent: string) => {
    [...this.instanceIds].forEach((instanceId: string) => {
      if (videoInstances[instanceId].parent === this.parent) {
        videoInstances[instanceId].updateParent(parent);
      }
    });
    this.parent = parent;
  };

  updateCustomId: CallableFunction = (customId: string) => {
    if (this.customId && videoMaterials[this.customId]) {
      delete videoMaterials[this.customId];
    }
    videoMaterials[customId] = videoMaterials[this.id];
    this.customId = customId;
  };

  updateOffImage: CallableFunction = (offImageLink: string) => {
    this.offImageLink = offImageLink;
    this.updateTexture(this.offImageLink);
  };

  updateTexture: CallableFunction = (url: string) => {
    if (this.textureMode == EVideoSourceTypes.IMAGE) {
      this.stop();
      this.textureMode = EVideoSourceTypes.IMAGE;
      const texture = new Texture(url, { hasAlpha: true });
      this.imageTexture = texture;
      this.albedoTexture = texture;
      this.emissiveTexture = texture;
      this.instanceIds.forEach((instanceId: string) => {
        videoInstances[instanceId].updateTransform();
      });
    } else {
      const videoClip = new VideoClip(url);
      const texture = new VideoTexture(videoClip);
      this.stop();
      this.videoTexture = texture;
      this.albedoTexture = texture;
      this.emissiveTexture = texture;
    }

    if (sdkImagesAreFlipped || sdkVideosAreFlipped) {
      this.updateAllTransforms();
    }
  };

  updateAllTransforms: CallableFunction = (newPosition?: TTransform, newScale?: TTransform, newRotation?: TTransform) => {
    this.instanceIds.forEach((instanceId: string) => {
      videoInstances[instanceId].updateTransform(newPosition, newScale, newRotation);
    });
  };

  updateVolume: CallableFunction = (volume: number) => {
    this.volume = volume;
    const position = this.videoTexture!.position;
    this.videoTexture!.volume = volume;
    this.videoTexture!.seekTime(position);
  };

  updatePlaylist: CallableFunction = (playlist: string[] | any) => {
    const currentlyPlayingVideo = this.playlist[this.playlistIndex];
    // Currently playing video is in newly updated playlist
    this.playlist = playlist;

    if (this.textureMode == EVideoSourceTypes.PLAYLIST && !playlist.includes(currentlyPlayingVideo)) {
      this.startPlaylist();
    }
  };

  start: CallableFunction = () => {
    if (this.textureMode == EVideoSourceTypes.LIVE) {
      this.startLive();
    } else if (this.textureMode == EVideoSourceTypes.PLAYLIST) {
      this.startPlaylist();
    }
  };

  startLive: CallableFunction = () => {
    this.textureMode = EVideoSourceTypes.LIVE;
    this.stop();
    this.updateTexture(this.liveLink);
    this.videoTexture.play();
    this.showAll();
  };

  startPlaylist: CallableFunction = () => {
    this.textureMode = EVideoSourceTypes.PLAYLIST;
    this.playlistIndex = 0;
    this.updateTexture(this.playlist[this.playlistIndex]);
    if (this.playlist.length > 1) {
      this.videoTexture.loop = true;
    }
    this.videoTexture.play();
    this.showAll();
  };

  showImage: CallableFunction = () => {
    this.textureMode = EVideoSourceTypes.IMAGE;
    this.stop();
    this.updateTexture(this.offImageLink);
    this.showAll();
  };

  playNextVideo: CallableFunction = () => {
    this.playlistIndex += 1;
    if (this.playlistIndex >= this.playlist.length - 1) {
      this.playlistIndex = 0;
    }
    this.stop();
    this.updateTexture(this.playlist[this.playlistIndex]);
    this.videoTexture.play();
  };

  stop: CallableFunction = () => {
    if (this.videoTexture) {
      this.videoTexture.pause();
      this.videoTexture.reset();
    }
  };
}

export class StoredVideoInstance extends StoredEntityInstance implements ITransform {
  id: string;
  materialId: string;
  parent?: string;
  position: TTransform;
  scale: TTransform;
  rotation: TTransform;
  modifiedTransform: { position: TTransform; scale: TTransform; rotation: TTransform };
  withCollisions: boolean;

  constructor(_material: StoredVideoMaterial, _instance: TVideoInstanceConfig) {
    super(_material, _instance);
    this.id = _instance.id;
    this.parent = _instance.parent || _material.parent;
    this.position = _instance.position;
    this.scale = _instance.scale;
    this.rotation = _instance.rotation;
    this.materialId = _material.id;
    const shape = new PlaneShape();
    shape.withCollisions = _instance.withCollisions;
    this.addComponent(shape);
    this.addComponent(_material);
    this.updateTransform(this.position, this.scale, this.rotation);
  }

  add: CallableFunction = () => {
    const parent = this.parent || videoMaterials[this.materialId].parent;
    if (parent) {
      this.updateParent(parent);
    } else {
      engine.addEntity(this);
    }
  };

  delete: CallableFunction = () => {
    delete videoInstances[this.id];
    if (this.customId) {
      delete videoInstances[this.customId];
    }
    this.remove();
  };

  remove: CallableFunction = () => {
    engine.removeEntity(this);
  };

  updateParent: CallableFunction = (parent: string) => {
    if (parent) {
      this.parent = parent;
      const instanceParent = getEntityByName(parent);
      this.setParent(instanceParent);
    } else {
      this.setParent(null);
    }
  };

  updateCustomId: CallableFunction = (customId: string) => {
    if (this.customId && videoInstances[this.customId]) {
      delete videoInstances[this.customId];
    }
    videoInstances[customId] = videoInstances[this.id];
    this.customId = customId;
  };

  updateTransform: CallableFunction = (newPosition?: TTransform, newScale?: TTransform, newRotation?: TTransform) => {
    this.applyCustomTransforms(newPosition, newScale, newRotation);

    const { position, scale, rotation } = this.modifiedTransform;

    this.addComponentOrReplace(
      new Transform({
        position: new Vector3(position.x, position.y, position.z),
        scale: new Vector3(scale.x, scale.y, scale.z),
        rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z)
      })
    );
  };

  updateCollider: CallableFunction = (withCollisions: boolean) => {
    this.withCollisions = withCollisions;
    const shape = new PlaneShape();
    shape.withCollisions = this.withCollisions;
    this.addComponentOrReplace(shape);
  };

  textureModeIs: CallableFunction = (mode: EVideoSourceTypes) => {
    return videoMaterials[this.materialId].textureMode == mode;
  };

  applyCustomTransforms: CallableFunction = (newPosition: TTransform, newScale: TTransform, newRotation: TTransform) => {
    const isImageTexture = this.textureModeIs(EVideoSourceTypes.IMAGE),
      isVideoTexture = this.textureModeIs(EVideoSourceTypes.LIVE) || this.textureModeIs(EVideoSourceTypes.PLAYLIST);

    this.position = newPosition || this.position;
    this.scale = newScale || this.scale;
    this.rotation = newRotation || this.rotation;

    this.modifiedTransform = { position: { ...this.position }, scale: { ...this.scale }, rotation: { ...this.rotation } };

    if (sdkImagesAreFlipped && isImageTexture) {
      this.modifiedTransform.rotation[sdkImageFlippedDimension] += 180;
    }

    if (sdkVideosAreFlipped && isVideoTexture) {
      this.modifiedTransform.rotation[sdkVideoFlippedDimension] += 180;
    }

    const imageRotationDegree = (vlmImagesFace - sdkImagesFace) * 90;
    const videoRotationDegree = (vlmVideosFace - sdkVideosFace) * 90;

    if (isImageTexture) {
      this.modifiedTransform.rotation.y += imageRotationDegree;
    } else if (isVideoTexture) {
      this.modifiedTransform.rotation.y += videoRotationDegree;
    }
  };
}

export class StoredVideoCheckSystem implements ISystem {
  id: string;
  customId?: string;
  timer: number = 0;
  dtDelay: number = 0;
  video: StoredVideoMaterial;
  videoLength: number = 0;
  videoStatus: number = 0;
  checkingStatus: boolean = false;
  live: boolean = true;
  playing: boolean = true;
  initialCheckComplete: boolean = false;
  instancesHidden: boolean = false;
  stopped: boolean = false;
  observer: any;
  raceConditionChecks: number[] = [];

  constructor(_storedVideoMaterial: StoredVideoMaterial) {
    this.video = videoMaterials[_storedVideoMaterial.id];
    this.id = _storedVideoMaterial.id;
    videoSystems[_storedVideoMaterial.id] = this;
    if (_storedVideoMaterial.customId) {
      this.customId = _storedVideoMaterial.customId;
      videoSystems[this.customId] = this;
    }
    engine.addSystem(videoSystems[_storedVideoMaterial.id]);

    if (this.video.customRendering) {
      this.stop();
    }
  }

  start: CallableFunction = () => {
    this.video.start();
    this.stopped = false;
  };

  stop: CallableFunction = () => {
    this.video.stop();
    this.stopped = true;
  };

  update(dt: number) {
    if (this.dtDelay > 30) {
      this.dtDelay = 0;
      return;
    } else if (this.dtDelay > 0) {
      this.dtDelay++;
      return;
    } else if (this.dtDelay == 0) {
      this.dtDelay++;
    }

    log(`VLM - Live Stream Enabled: ${this.video.enableLiveStream}`);

    if (this.checkingStatus || this.stopped) {
      return;
    }

    const playListBlank = this.video.offType == EVideoSourceTypes.PLAYLIST && this.video.playlist && !this.video.playlist.filter((x) => x).length,
      imageBlank = this.video.offType == EVideoSourceTypes.IMAGE && !this.video.offImageLink;

    // If live streaming is enabled, first check the status of the live stream
    if (this.video.enableLiveStream && !this.checkingStatus) {
      executeTask(async () => {
        this.checkStreamStatus();
      });
    }

    if (this.video.enableLiveStream && !this.initialCheckComplete) {
      return;
    }

    if (this.video.enableLiveStream && this.live && !this.instancesHidden) {
      // If live stream is enabled and is live, skip the block for removing the video when "NONE" is the off type
    } else if (this.video.offType === EVideoSourceTypes.NONE && !this.instancesHidden) {
      // If off type is NONE, stop everything and hide instances.
      this.video.stop();
      this.video.remove();
      this.instancesHidden = true;
      this.playing = false;
      return;
    } else if ((!this.video.enableLiveStream || !this.live) && this.video.offType === EVideoSourceTypes.NONE) {
      return;
    } else if (this.instancesHidden) {
      this.instancesHidden = false;
      this.video.showAll();
      return;
    }

    if (!this.video.enableLiveStream && (imageBlank || playListBlank)) {
      this.video.offType = EVideoSourceTypes.NONE;
      return;
    }

    ///////////////////////////////////////////////
    // We are NOT in NONE mode beyond this point.//
    ///////////////////////////////////////////////

    if (this.video.enableLiveStream && this.live && this.video.textureMode !== EVideoSourceTypes.LIVE) {
      this.video.startLive();
      this.playing = true;
      return;
    }

    if (this.video.offType !== EVideoSourceTypes.IMAGE) {
      // If off type is not image, ignore this condition set and move on
    } else if (this.video.textureMode == EVideoSourceTypes.IMAGE) {
      // Off type is image, and texture is an image. Do nothing else.
      return;
    } else if ((!this.video.enableLiveStream || !this.live) && this.video.offImageLink) {
      this.video.showImage();
      this.playing = false;
      return;
    }

    ////////////////////////////////////////////////
    // We are NOT in IMAGE mode beyond this point.//
    ////////////////////////////////////////////////

    if (this.video.textureMode !== EVideoSourceTypes.LIVE) {
      // If we ARE NOT in LIVE mode, skip this condition set
    } else if (!this.live) {
      // We ARE in LIVE mode.
      // If stream is DOWN, skip the next steps
      this.playing = false;
      return;
    } else if (!this.video.videoTexture.playing) {
      // We ARE in LIVE mode. Stream is LIVE.
      // If stream is live but not playing anything, start live video
      this.video.startLive();
      this.playing = true;
    } else if (this.video.enableLiveStream) {
      // We ARE in LIVE mode. Stream is LIVE. Video is PLAYING. Stream is ENABLED.
      // Do nothing else.
      return;
    } else {
      // We ARE in LIVE mode. Stream is LIVE. Video is PLAYING. Stream is DISABLED.
      // Move on to switch to playlist.
      this.video.videoTexture.playing = false
    }
    log("VLM - we out chea!");
    log(`VLM - ${this.video.videoTexture.playing}`);

    ///////////////////////////////////////////////
    // We are NOT in LIVE mode beyond this point.//
    ///////////////////////////////////////////////

    //////////////////////////////////////////////////////////////
    //           Off type must now be PLAYLIST.                //
    //If not, we need to account for something that was added.//
    ///////////////////////////////////////////////////////////

    if (!this.video.videoTexture.playing) {
      log('VLM - Starting Playlist')
      // If video is not playing, start the playlist.
      this.video.startPlaylist();
      this.playing = true;
      return;
    } else {
      this.observer = onVideoEvent.add((data) => {
        if (this.video.textureMode !== EVideoSourceTypes.LIVE && data.videoClipId == this.video.videoTexture.videoClipId) {
          this.videoStatus = data.videoStatus;
          this.videoLength = Math.floor(data.totalVideoLength);
          this.timer = Math.ceil(data.currentOffset);
          log(`VLM - this.video.textureMode == ${EVideoSourceTypes.LIVE}`);
          log(`VLM - ${data.videoClipId}`);
          log(`VLM - ${this.videoStatus} ${this.videoLength} ${this.timer}`);
        }
      });

      if (this.videoLength < 0 || this.timer < 0 || !this.videoStatus) {
        return;
      }
    }

    if (this.video.playlist.length > 1 && this.videoStatus > VideoStatus.READY && this.timer >= this.videoLength) {
      this.video.playNextVideo();
      this.observer.remove();
    }
  }

  statusCheckDelay: number = 0;

  checkStreamStatus: CallableFunction = async () => {
    log("VLM - Checking stream status");

    if (!this.video.liveLink) {
      this.setLiveState(false);
      return;
    }

    if (this.statusCheckDelay >= 500) {
      this.statusCheckDelay = 0;
      return;
    } else if (this.statusCheckDelay > 0) {
      this.statusCheckDelay++;
      return;
    }

    try {
      this.checkingStatus = true;
      let res = await fetch(this.video.liveLink, { method: "HEAD" });
      this.setLiveState(res.status == 200);
      // log(res.status);
    } catch (e) {
      log("VLM - video link issue!");
      this.setLiveState(false);
    }
  };

  setLiveState: CallableFunction = (liveState: boolean) => {
    if (this.live !== liveState) {
      this.video.stop();
    }
    this.live = liveState;
    this.playing = liveState;
    this.checkingStatus = false;
    this.initialCheckComplete = true;
  };
}
