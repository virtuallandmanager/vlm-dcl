import { sdkImagesAreFlipped, sdkVideosAreFlipped } from "src/shared/defaults";
import { getEntityByName } from "../shared/entity";
import { VLMBase } from "./VLMBaseConfig.component";
import { VLMClickEvent } from "./VLMClickEvent.component";
import { Audible, Emissive, HasHybridTexture, HasPlaylist, Playable, SimpleTransform, Transformable } from "src/shared/interfaces";

export namespace VLMVideo {
  export const configs: { [uuid: string]: DCLConfig } = {};
  export const instances: { [uuid: string]: DCLInstanceConfig } = {};
  export const systems: { [uuid: string]: System } = {};

  export enum SourceTypes {
    NONE,
    IMAGE,
    PLAYLIST,
    LIVE,
  }

  export enum StreamState {
    NOT_FOUND,
    INACTIVE,
    STATIC,
    LIVE,
  }

  export class DCLConfig extends VLMBase.MaterialConfig implements HasHybridTexture, Emissive, Audible, HasPlaylist, Playable {
    sk: string;
    parent?: string;
    enabled: boolean;
    customRendering: boolean;
    instanceIds: string[] | any = [];
    textureMode: SourceTypes;
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
    isLive: boolean = false;
    enableLiveStream?: boolean;
    clickEvent?: VLMClickEvent.DCLConfig;
    withCollisions: boolean;
    videoClipId?: string;
    emissiveIntensity: number;
    offType: SourceTypes;
    offImageSrc?: string;

    constructor(config: VLMConfig) {
      super(config);
      this.sk = config.sk;
      this.customId = config.customId;
      this.parent = config.parent;
      this.enabled = config.enabled;
      this.enableLiveStream = config.enableLiveStream;
      this.isLive = config.isLive;
      this.liveLink = config.liveLink;
      this.offType = config.offType;
      this.offImageSrc = config.offImageSrc;
      this.customRendering = !!config.customRendering;
      this.emissiveIntensity = config.emissiveIntensity || 1;
      this.volume = config.volume;
      this.playlist = config.playlist;
      this.withCollisions = config.withCollisions;
      this.textureMode = this.enableLiveStream ? SourceTypes.LIVE : this.offType;
      this.updateTexture();
      configs[this.sk] = this;

      if (this.customId) {
        configs[this.customId] = configs[this.sk];
      }

      if (this.customRendering) {
        return;
      }

      config.instances.forEach((instance: VLMInstanceConfig) => {
        this.createInstance(instance);
      });

      new System(this);
    }

    remove: CallableFunction = () => {
      [...this.instanceIds].forEach((instanceId: string) => {
        instances[instanceId].remove();
      });
    };

    delete: CallableFunction = () => {
      engine.removeSystem(systems[this.sk]);
      delete systems[this.sk];
      delete configs[this.sk];
      [...this.instanceIds].forEach((instanceId: string) => {
        instances[instanceId].delete();
      });
    };

    showAll: CallableFunction = () => {
      [...this.instanceIds].forEach((instanceId: string) => {
        const visible = instances[instanceId].enabled,
          parent = instances[instanceId].parent || this.parent;

        if (!visible) {
          return;
        } else if (parent) {
          instances[instanceId].updateParent(parent);
        } else {
          instances[instanceId].add();
        }
      });
    };

    createInstance: CallableFunction = (config: VLMInstanceConfig) => {
      this.instanceIds.push(config.sk);
      instances[config.sk] = new DCLInstanceConfig(this, config);
      if (config.customId) {
        instances[config.customId] = instances[config.sk];
      }
    };

    removeInstance: CallableFunction = (instanceId: string) => {
      instances[instanceId].remove();
    };

    deleteInstance: CallableFunction = (instanceId: string) => {
      this.instanceIds = this.instanceIds.filter((id: string) => id !== instanceId);
      instances[instanceId].delete();
    };

    addInstance: CallableFunction = (instanceId: string) => {
      instances[instanceId].add();
    };

    updateParent: CallableFunction = (parent: string) => {
      [...this.instanceIds].forEach((instanceId: string) => {
        if (instances[instanceId].parent === this.parent) {
          instances[instanceId].updateParent(parent);
        }
      });
      this.parent = parent;
    };

    updateCustomId: CallableFunction = (customId: string) => {
      if (this.customId && configs[this.customId]) {
        delete configs[this.customId];
      }
      configs[customId] = configs[this.sk];
      this.customId = customId;
    };

    updateCustomRendering: CallableFunction = (customRendering: boolean) => {
      this.customRendering = customRendering;
      if (customRendering) {
        this.remove();
      } else {
        this.showAll();
      }
    };

    updateOffImage: CallableFunction = (offImageSrc: string) => {
      this.offImageSrc = offImageSrc;
      this.updateTexture(this.offImageSrc);
    };

    updateTexture: CallableFunction = (src: string) => {
      if (this.textureMode == SourceTypes.IMAGE) {
        const url = this.offImageSrc;
        this.stop();
        this.textureMode = SourceTypes.IMAGE;
        const texture = new Texture(url, { hasAlpha: true });
        this.imageTexture = texture;
        this.albedoTexture = texture;
        this.emissiveTexture = texture;
      } else {
        const url = src || this.liveLink;
        const videoClip = new VideoClip(url);
        const texture = new VideoTexture(videoClip);
        this.stop();
        this.videoTexture = texture;
        this.albedoTexture = texture;
        this.emissiveTexture = texture;
      }
    };

    flipUvs: CallableFunction = () => {
      log(this.instanceIds);
      this.instanceIds.forEach((instanceId: string) => {
        instances[instanceId].flipUvs();
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

      if (this.textureMode == SourceTypes.PLAYLIST && !playlist.includes(currentlyPlayingVideo)) {
        this.startPlaylist();
      }
    };

    start: CallableFunction = () => {
      if (this.textureMode == SourceTypes.LIVE) {
        this.startLive();
      } else if (this.textureMode == SourceTypes.PLAYLIST) {
        this.startPlaylist();
      }
    };

    startLive: CallableFunction = () => {
      this.textureMode = SourceTypes.LIVE;
      this.stop();
      this.updateTexture(this.liveLink);
      if (this.videoTexture) {
        this.videoTexture.play();
      }
      this.showAll();
    };

    startPlaylist: CallableFunction = () => {
      this.textureMode = SourceTypes.PLAYLIST;
      this.playlistIndex = 0;
      this.updateTexture(this.playlist[this.playlistIndex]);
      if (!this.videoTexture) {
        return;
      } else if (this.playlist.length > 1) {
        this.videoTexture.loop = true;
      }
      this.videoTexture.play();
      this.showAll();
    };

    showImage: CallableFunction = () => {
      this.textureMode = SourceTypes.IMAGE;
      this.stop();
      this.flipUvs();
      this.updateTexture(this.offImageSrc);
      this.showAll();
    };

    setLiveState: CallableFunction = (liveState: boolean) => {
      this.isLive = liveState;
      VLMVideo.systems[this.sk].setLiveState(this.isLive);
    };

    playNextVideo: CallableFunction = () => {
      this.playlistIndex += 1;
      if (this.playlistIndex >= this.playlist.length - 1) {
        this.playlistIndex = 0;
      }
      this.stop();
      this.updateTexture(this.playlist[this.playlistIndex]);
      if (this.videoTexture) {
        this.videoTexture.play();
      }
    };

    stop: CallableFunction = () => {
      if (this.videoTexture) {
        this.videoTexture.pause();
        this.videoTexture.reset();
      }
    };
  }

  export class VLMConfig extends DCLConfig {
    instances?: VLMInstanceConfig[];
    emission?: number;
  }

  export class DCLInstanceConfig extends VLMBase.Instance implements Transformable {
    sk: string;
    configId: string;
    parent?: string;
    enabled: boolean;
    position: SimpleTransform;
    scale: SimpleTransform;
    rotation: SimpleTransform;
    withCollisions: boolean;
    correctUvs: boolean = sdkImagesAreFlipped;

    constructor(material: DCLConfig, instance: VLMInstanceConfig) {
      super(material, instance);
      this.sk = instance.sk;
      this.parent = instance.parent || material.parent;
      this.enabled = material.enabled ? instance.enabled : false;
      this.position = instance.position;
      this.scale = instance.scale;
      this.rotation = instance.rotation;
      this.withCollisions = instance.withCollisions;
      this.configId = material.sk;
      const shape = new PlaneShape();
      shape.withCollisions = this.withCollisions;
      this.addComponent(shape);
      if (material.textureMode == SourceTypes.IMAGE && this.correctUvs) {
        this.flipUvs();
      }
      this.addComponent(material);
      this.updateTransform(this.position, this.scale, this.rotation);

      if (this.enabled) {
        this.add();
      }
    }

    add: CallableFunction = () => {
      const parent = this.parent || configs[this.configId].parent;
      if (parent) {
        this.updateParent(parent);
      } else {
        engine.addEntity(this);
      }
    };

    delete: CallableFunction = () => {
      delete instances[this.sk];
      if (this.customId) {
        delete instances[this.customId];
      }
      this.remove();
    };

    remove: CallableFunction = () => {
      engine.removeEntity(this);
    };
    flipUvs: CallableFunction = () => {
      const plane = this.getComponentOrNull(PlaneShape);
      log("before flip uvs", plane.uvs);
      if (this.correctUvs) {
        plane.uvs = [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1];
      }
      log("after uvs", plane.uvs);
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
      if (this.customId && instances[this.customId]) {
        delete instances[this.customId];
      }
      instances[customId] = instances[this.sk];
      this.customId = customId;
    };

    updateCustomRendering: CallableFunction = (customRendering: boolean) => {
      this.customRendering = customRendering;
      if (customRendering) {
        this.remove();
      } else {
        this.add();
      }
    };

    updateTransform: CallableFunction = (newPosition?: SimpleTransform, newScale?: SimpleTransform, newRotation?: SimpleTransform) => {
      const newTransform = { position: newPosition || this.position, scale: newScale || this.scale, rotation: newRotation || this.rotation },
        { position, scale, rotation } = newTransform;
      log("VLM New Position: ", position, scale, rotation);
      this.addComponentOrReplace(
        new Transform({
          position: new Vector3(position.x, position.y, position.z),
          scale: new Vector3(scale.x, scale.y, scale.z),
          rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z),
        })
      );
    };

    updateCollider: CallableFunction = (withCollisions: boolean) => {
      this.withCollisions = withCollisions;
      const shape = new PlaneShape();
      shape.withCollisions = this.withCollisions;
      this.addComponentOrReplace(shape);
    };

    textureModeIs: CallableFunction = (mode: SourceTypes) => {
      return configs[this.configId].textureMode == mode;
    };
  }

  export class VLMInstanceConfig extends DCLInstanceConfig {}

  export class System implements ISystem {
    sk: string;
    customId?: string;
    timer: number = 0;
    dtDelay: number = 0;
    video: DCLConfig;
    videoLength: number = 0;
    videoStatus: number = 0;
    checkingStatus: boolean = true;
    live: boolean = false;
    playing: boolean = true;
    instancesHidden: boolean = false;
    stopped: boolean = false;
    observer: any;

    constructor(config: DCLConfig) {
      this.video = configs[config.sk];
      this.sk = config.sk;
      systems[config.sk] = this;
      if (config.customId) {
        this.customId = config.customId;
        systems[this.customId] = this;
      }
      engine.addSystem(systems[config.sk]);

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
      if (!this.video || this.dtDelay > 1) {
        this.dtDelay = 0;
        return;
      } else if (this.dtDelay > 0) {
        this.dtDelay += dt;
        return;
      } else if (this.dtDelay == 0) {
        this.dtDelay += dt;
      }

      if (this.checkingStatus || this.stopped) {
        return;
      }

      const playListBlank = this.video.offType == SourceTypes.PLAYLIST && this.video.playlist && !this.video.playlist.filter((x) => x).length,
        imageBlank = this.video.offType == SourceTypes.IMAGE && !this.video.offImageSrc;

      if (this.video.enableLiveStream && this.live && !this.instancesHidden) {
        // If live stream is enabled and is live, skip the block for removing the video when "NONE" is the off type
      } else if (this.video.offType === SourceTypes.NONE && !this.instancesHidden) {
        // If off type is NONE, stop everything and hide instances.
        this.video.stop();
        this.video.remove();
        this.instancesHidden = true;
        this.playing = false;
        return;
      } else if ((!this.video.enableLiveStream || !this.live) && this.video.offType === SourceTypes.NONE) {
        return;
      } else if (this.instancesHidden) {
        this.instancesHidden = false;
        this.video.showAll();
        return;
      }

      if (!this.video.enableLiveStream && (imageBlank || playListBlank)) {
        this.video.offType = SourceTypes.NONE;
        return;
      }

      ///////////////////////////////////////////////
      // We are NOT in NONE mode beyond this point.//
      ///////////////////////////////////////////////

      if (this.video.enableLiveStream && this.live && this.video.textureMode !== SourceTypes.LIVE) {
        this.video.startLive();
        this.playing = true;
        return;
      }

      if (this.video.offType !== SourceTypes.IMAGE) {
        // If off type is not image, ignore this condition set and move on
      } else if (this.video.textureMode !== SourceTypes.IMAGE && (!this.video.enableLiveStream || !this.live) && this.video.offImageSrc) {
        this.video.showImage();
        this.playing = false;
        return;
      }
      ////////////////////////////////////////////////
      // We are NOT in IMAGE mode beyond this point.//
      ////////////////////////////////////////////////

      if (this.video.textureMode !== SourceTypes.LIVE) {
        // If we ARE NOT in LIVE mode, skip this condition set
      } else if (!this.live) {
        // We ARE in LIVE mode.
        // If stream is DOWN, skip the next steps
        this.playing = false;
        return;
      } else if (this.video && this.video.videoTexture && !this.video.videoTexture.playing) {
        // We ARE in LIVE mode. Stream is LIVE.
        // If stream is live but not playing anything, start live video
        this.video.startLive();
        this.playing = true;
      } else if (this.video.enableLiveStream) {
        // We ARE in LIVE mode. Stream is LIVE. Video is PLAYING. Stream is ENABLED.
        // Do nothing else.
        return;
      } else if (this.video && this.video.videoTexture) {
        // We ARE in LIVE mode. Stream is LIVE. Video is PLAYING. Stream is DISABLED.
        // Move on to switch to playlist.
        this.video.videoTexture.playing = false;
      }

      ///////////////////////////////////////////////
      // We are NOT in LIVE mode beyond this point.//
      ///////////////////////////////////////////////

      //////////////////////////////////////////////////////////////
      //           Off type must now be PLAYLIST.                //
      //If not, we need to account for something that was added.//
      ///////////////////////////////////////////////////////////

      if (this.video && this.video.videoTexture && !this.video.videoTexture.playing) {
        // If video is not playing, start the playlist.
        this.video.startPlaylist();
        this.playing = true;
        return;
      } else {
        this.observer = onVideoEvent.add((data) => {
          if (this.video && this.video.videoTexture && this.video.textureMode !== SourceTypes.LIVE && data.videoClipId == this.video.videoTexture.videoClipId) {
            this.videoStatus = data.videoStatus;
            this.videoLength = Math.floor(data.totalVideoLength);
            this.timer = Math.ceil(data.currentOffset);
            // log(`VLM - this.video.textureMode == ${SourceTypes.LIVE}`);
            // log(`VLM - ${data.videoClipId}`);
            // log(`VLM - ${this.videoStatus} ${this.videoLength} ${this.timer}`);
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

    setLiveState: CallableFunction = (liveState: boolean) => {
      this.live = liveState;
      this.playing = liveState;
      this.checkingStatus = false;
      if (!liveState) {
        this.video.stop();
      }
      if (!this.live && this.video.textureMode == SourceTypes.LIVE) {
        this.video.textureMode = this.video.offType;
      }
    };
  }
}
