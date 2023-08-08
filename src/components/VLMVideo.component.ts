import { sdkImagesAreFlipped, sdkVideosAreFlipped } from "../shared/defaults";
import { getEntityByName } from "../shared/entity";
import { VLMBase } from "./VLMBaseConfig.component";
import { VLMClickEvent } from "./VLMClickEvent.component";
import { Audible, Emissive, HasHybridTexture, HasPlaylist, Playable, SimpleTransform, Transformable } from "../shared/interfaces";
import { VLMEnvironment } from "../environment";
import { includes } from "../utils";

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
    public liveSrc: string = "";
    playlist: string[] = [];
    playlistIndex: number = 0;
    isLive: boolean = false;
    public enableLiveStream?: boolean;
    clickEvent?: VLMClickEvent.DCLConfig;
    public withCollisions: boolean;
    videoClipId?: string;
    emissiveIntensity: number;
    offType: SourceTypes;
    offImageSrc: string = "";
    uvsFlipped: boolean = false;

    constructor(config: VLMConfig) {
      super(config);
      this.sk = config.sk;
      this.customId = config.customId;
      this.parent = config.parent;
      this.enabled = config?.enabled;
      this.enableLiveStream = config?.enableLiveStream || false;
      this.isLive = config.isLive;
      this.liveSrc = config.liveSrc;
      this.offType = config.offType;
      this.offImageSrc = config.offImageSrc;
      this.customRendering = !!config.customRendering;
      this.emissiveIntensity = config.emissiveIntensity || 1;
      this.volume = config.volume || 1;
      this.playlist = config.playlist || this.playlist;
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

      if (this.textureMode === SourceTypes.IMAGE && !this.uvsFlipped) {
        this.flipUvs();
      }

      new System(this);
    }

    remove: CallableFunction = () => {
      [...this.instanceIds].forEach((instanceId: string) => {
        try {
          instances[instanceId].remove();
        } catch (e) {
          log(e);
          log(`VLM - Failed to remove instance ${instanceId}`);
        }
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
      if (!includes(this.instanceIds, config.sk)) {
        this.instanceIds.push(config.sk);
      }
      new DCLInstanceConfig(this, config);
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
      let texture;
      this.instanceIds.forEach((instanceId: string) => {
        if (instances[instanceId].getComponentOrNull(Material)) {
          instances[instanceId].removeComponent(Material)
          instances[instanceId].addComponentOrReplace(new BasicMaterial())
        }
      });
      if (this.textureMode == SourceTypes.IMAGE) {
        const url = this.offImageSrc;
        this.stop();
        this.textureMode = SourceTypes.IMAGE;
        texture = new Texture(url, { hasAlpha: true });
        this.imageTexture = texture;
        this.albedoTexture = texture;
        this.emissiveTexture = texture;
      } else {
        const url = src || this.liveSrc;
        const videoClip = new VideoClip(url);
        texture = new VideoTexture(videoClip);
        this.stop();
        this.videoTexture = texture;
        this.albedoTexture = texture;
        this.emissiveTexture = texture;
      }
      this.instanceIds.forEach((instanceId: string) => {
        instances[instanceId].addComponentOrReplace(this)
      });

      if ((this.textureMode == SourceTypes.IMAGE && !this.uvsFlipped) || (this.textureMode !== SourceTypes.IMAGE && this.uvsFlipped)) {
        this.flipUvs();
      }
    };

    flipUvs: CallableFunction = () => {
      log(this.instanceIds);
      this.uvsFlipped = !this.uvsFlipped;
      this.instanceIds.forEach((instanceId: string) => {
        instances[instanceId].flipUvs(this.uvsFlipped);
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

    updateClickEvent: CallableFunction = (clickEvent: VLMClickEvent.DCLConfig) => {
      this.clickEvent = clickEvent;
      [...this.instanceIds].forEach((instanceId: string) => {
        instances[instanceId].updateDefaultClickEvent(this.clickEvent);
      });
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
      this.updateTexture(this.liveSrc);

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
      this.updateTexture(this.offImageSrc);
      this.showAll();
    };

    setLiveState: CallableFunction = (liveState: boolean) => {
      this.isLive = liveState;
      if (!liveState) {
        this.stop();
      } else {
        this.startLive();
      }

      if (!this.isLive && this.textureMode === SourceTypes.LIVE) {
        this.textureMode = this.offType;
      }

      if (systems[this.sk] && !this.isLive && this.offType === SourceTypes.PLAYLIST) {
        systems[this.sk].start();
      } else if (systems[this.sk]) {
        systems[this.sk].kill();
      } else if (this.isLive) {
        new System(this);
      }

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
    instances: VLMInstanceConfig[];
    emission?: number;

    constructor(config: VLMConfig) {
      super(config);
      this.instances = config.instances;
      this.emission = config.emission;
    }
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
    uvsFlipped: boolean = false;
    defaultClickEvent: VLMClickEvent.DCLConfig;
    clickEvent: VLMClickEvent.DCLConfig;

    constructor(config: DCLConfig, instance: VLMInstanceConfig) {
      super(config, instance);
      this.sk = instance.sk;
      this.parent = instance.parent || config.parent;
      this.enabled = config.enabled ? instance.enabled : false;
      this.position = instance.position;
      this.scale = instance.scale;
      this.rotation = instance.rotation;
      this.withCollisions = instance.withCollisions;
      this.configId = config.sk;
      this.uvsFlipped = config.uvsFlipped || this.uvsFlipped;
      this.clickEvent = instance.clickEvent;
      this.defaultClickEvent = config.clickEvent;
      const shape = new PlaneShape();
      shape.withCollisions = this.withCollisions;
      this.addComponent(shape);
      this.addComponent(config);
      this.updateTransform(this.position, this.scale, this.rotation);
      instances[this.sk] = this;

      if (!systems[this.configId]) {
        new System(config);
      }

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

    flipUvs: CallableFunction = (flipped: boolean) => {
      const plane = this.getComponentOrNull(PlaneShape);
      if (!plane) {
        return;
      }
      log("before flip uvs", plane.uvs);
      if (flipped) {
        plane.uvs = [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1];
      } else {
        plane.uvs = null;
      }

      log("after flip uvs", plane.uvs);
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

    updateDefaultClickEvent: CallableFunction = (newDefaultClickEvent: VLMClickEvent.DCLConfig) => {
      try {
        this.defaultClickEvent = newDefaultClickEvent;
        this.updateClickEvent();
      } catch (error) {
        throw error;
      }
    };

    updateClickEvent: CallableFunction = (newClickEvent?: VLMClickEvent.DCLConfig) => {
      try {
        if (typeof newClickEvent !== "undefined") {
          this.clickEvent = newClickEvent;
        }

        if (this.clickEvent && this.clickEvent?.synced) {
          this.clickEvent = this.defaultClickEvent;
        }

        const clickEvent = this.clickEvent,
          storageRecord = instances[this.sk];

        if (!clickEvent || !storageRecord) {
          return;
        }

        const clickEventObj = new VLMClickEvent.DCLConfig(clickEvent, storageRecord);

        if (clickEventObj.pointerDownEvent) {
          instances[this.sk].addComponentOrReplace(clickEventObj.pointerDownEvent);
        }
      } catch (error) {
        throw error;
      }
    };

    textureModeIs: CallableFunction = (mode: SourceTypes) => {
      return configs[this.configId].textureMode == mode;
    };
  }

  export class VLMInstanceConfig extends DCLInstanceConfig { }

  export class System implements ISystem {
    enableDebugging: boolean = VLMEnvironment.devMode && true;
    sk: string;
    customId?: string;
    timer: number = 0;
    dtDelay: number = 0;
    video: DCLConfig;
    videoLength: number = 0;
    videoStatus: number = 0;
    checkingStatus: boolean = true;
    isLive: boolean = false;
    playing: boolean = true;
    instancesHidden: boolean = false;
    stopped: boolean = false;
    observer: any;

    constructor(config: DCLConfig) {
      this.video = configs[config.sk];
      this.sk = config.sk;
      this.isLive = config.isLive;
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
      this.stopped = false;
    };

    stop: CallableFunction = () => {
      this.stopped = true;
    };

    kill: CallableFunction = () => {
      this.stopped = true;
      engine.removeSystem(this);
    };

    update(dt: number) {
      if (this.stopped || configs[this.sk].instanceIds.length === 0) {
        return;
      }
      if (!this.video || this.dtDelay > 1) {
        this.dtDelay = 0;
        return;
      } else if (this.dtDelay > 0) {
        this.dtDelay += dt;
        return;
      } else if (this.dtDelay == 0) {
        this.dtDelay += dt;
      }

      const playListBlank = !this.video.playlist || !this.video.playlist.length || !this.video.playlist.filter((x) => x).length,
        imageBlank = !this.video.offImageSrc,
        enableLiveStream = configs[this.sk].enableLiveStream;

      if (enableLiveStream && this.isLive && !this.instancesHidden) {
        // If live stream is enabled and stream is live, skip the block for removing the video when "NONE" is the off type
      } else if (this.video.offType === SourceTypes.NONE && !this.instancesHidden) {
        // If off type is NONE, stop everything and hide the video instances.
        this.video.stop();
        this.video.remove();
        this.instancesHidden = true;
        this.playing = false;
        this.dbLog("VLM VIDEO SYSTEM - CHANGED STATE - INVISIBLE/NONE MODE");
        return;
      } else if ((!enableLiveStream || !this.isLive) && this.video.offType === SourceTypes.NONE) {
        this.dbLog("VLM VIDEO SYSTEM - IDLE STATE - INVISIBLE/NONE MODE");
        return;
      } else if (this.instancesHidden) {
        this.instancesHidden = false;
        this.video.showAll();
        return;
      }

      if (!enableLiveStream && imageBlank && playListBlank) {
        this.video.offType = SourceTypes.NONE;
        this.dbLog("VLM VIDEO SYSTEM - ERROR STATE - IMAGE AND PLAYLIST ARE BLANK, SET TO NONE");
        return;
      } else if (!enableLiveStream && this.video.offType == SourceTypes.PLAYLIST && playListBlank) {
        this.video.offType = SourceTypes.NONE;
        this.dbLog("VLM VIDEO SYSTEM - ERROR STATE - PLAYLIST IS BLANK, SET TO NONE");
        return;
      } else if (!enableLiveStream && this.video.offType == SourceTypes.IMAGE && imageBlank) {
        this.video.offType = SourceTypes.NONE;
        this.dbLog("VLM VIDEO SYSTEM - ERROR STATE - LIVE STREAM DISABLED, IMAGE SRC IS BLANK, SET TO NONE");
        return;
      }

      ///////////////////////////////////////////////
      // We are NOT in NONE mode beyond this point.//
      ///////////////////////////////////////////////

      if (enableLiveStream && this.isLive && this.video.textureMode !== SourceTypes.LIVE) {
        this.video.startLive();
        this.playing = true;
        this.dbLog("VLM VIDEO SYSTEM - STATE CHANGED - START LIVE STREAMING");
        return;
      }

      if (this.video.offType !== SourceTypes.IMAGE) {
        // If off type is not image, ignore this condition set and move on
      } else if (enableLiveStream && this.isLive) {
        // If off type is image, but the live stream is healthy and enabled, so skip the next steps
        this.dbLog("VLM VIDEO SYSTEM EXIT - OFFTYPE MODE, LIVE STREAM ENABLED");
        return;
      } else if (this.video.textureMode !== SourceTypes.IMAGE) {
        // If off type is image, but the live stream is disabled, and we are not in image mode, switch to image mode
        this.video.showImage();
        this.playing = false;
        this.dbLog("VLM VIDEO SYSTEM - STATE CHANGED - SHOW IMAGE");
        return;
      } else if (this.video.textureMode === SourceTypes.IMAGE) {
        // If off type is image, but the live stream is disabled, and we are in image mode, do nothing
        this.dbLog("VLM VIDEO SYSTEM - IDLE STATE - IMAGE MODE");
        return
      }

      ////////////////////////////////////////////////
      // We are NOT in IMAGE mode beyond this point.//
      ////////////////////////////////////////////////

      if (this.video.textureMode !== SourceTypes.LIVE) {
        // If we ARE NOT in LIVE mode, skip this condition set
      } else if (!this.isLive && this.video.offType === SourceTypes.IMAGE && !imageBlank) {
        // We ARE in LIVE mode.
        // If stream is DOWN and OFFTYPE is IMAGE, skip the next steps
        this.playing = false;
        this.dbLog("VLM VIDEO SYSTEM EXIT - SOURCETYPE = LIVE, LIVE STREAM DOWN");
        return;
      } else if (this.video && this.video.videoTexture && !this.video.videoTexture.playing) {
        // We ARE in LIVE mode. Stream is LIVE.
        // If stream is live but not playing anything, start live video
        this.video.startLive();
        this.playing = true;
      } else if (enableLiveStream) {
        // We ARE in LIVE mode. Stream is LIVE. Video is PLAYING. Stream is ENABLED.
        // Do nothing else.
        this.dbLog("VLM VIDEO SYSTEM - IDLE STATE - LIVE STREAM MODE");
        return;
      } else if (this.video && this.video.videoTexture) {
        // We ARE in LIVE mode. Stream is LIVE. Video is PLAYING. Stream is DISABLED.
        // Move on to switch to playlist.
      }

      ///////////////////////////////////////////////
      // We are NOT in LIVE mode beyond this point.//
      ///////////////////////////////////////////////

      //////////////////////////////////////////////////////////////
      //           Off type must now be PLAYLIST.                //
      //If not, we need to account for something that was added.//
      ///////////////////////////////////////////////////////////

      if (this.video?.videoTexture && !this.video.videoTexture.playing) {
        // If video is not playing, start the playlist.
        this.video.startPlaylist();
        this.playing = true;
        this.dbLog("VLM VIDEO SYSTEM - STATE CHANGE - START PLAYLIST");
        return;
      } else if (!this.observer) {
        this.observer = onVideoEvent.add((data) => {
          try {
            if (this.video && this.video.videoTexture && this.video.textureMode !== SourceTypes.LIVE && data.videoClipId == this.video.videoTexture.videoClipId) {
              this.videoStatus = data.videoStatus;
              this.videoLength = Math.floor(data.totalVideoLength);
              this.timer = Math.ceil(data.currentOffset);
            }

            if (this.videoStatus >= VideoStatus.READY && this.videoLength < 0 || this.timer < 0 || !this.videoStatus) {

              this.dbLog("VLM VIDEO SYSTEM EXIT - PLAYLIST VIDEO LENGTH, TIMER, OR STATUS IS NOT DEFINED");
              this.dbLog(`VLM VIDEO SYSTEM EXIT - OFFTYPE = ${this.video.offType} VIDEO LENGTH = ${this.videoLength} TIMER = ${this.timer} VIDEO STATUS = ${this.videoStatus}`);
              return;
            }

            if (this.video.playlist?.length > 1 && this.videoStatus > VideoStatus.READY && this.timer >= this.videoLength - dt) {
              onVideoEvent.remove(this.observer);
              this.observer = null
              this.video.playNextVideo();
              this.dbLog("VLM VIDEO SYSTEM - STATE CHANGE - NEXT PLAYLIST VIDEO");
              return;
            }

            if (this.observer && this.videoLength > this.timer && this.videoStatus === VideoStatus.PLAYING) {
              this.dbLog(`VLM VIDEO SYSTEM - IDLE STATE - PLAYLIST MODE - VIDEO PROGRESS - ${Math.floor(this.timer / this.videoLength * 100)}%`);
            }
          } catch (error) {
            throw error;
          }
        });
      }
    }

    private dbLog: CallableFunction = (message: string) => {
      if (this.enableDebugging) {
        log(message);
      }
    }
  }
}
