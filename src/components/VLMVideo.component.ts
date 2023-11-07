import { sdkImagesAreFlipped } from "../shared/defaults";
import { getEntityByName } from "../shared/entity";
import { VLMBase } from "./VLMBaseConfig.component";
import { VLMClickEvent } from "./VLMClickEvent.component";
import { Audible, Emissive, HasHybridTexture, HasPlaylist, Playable, SimpleTransform, Transformable } from "../shared/interfaces";
import { VLMEnvironment } from "../environment";
import { includes } from "../utils";

export namespace VLMVideo {
  export const configs: { [uuid: string]: DCLConfig } = {};
  export const instances: { [uuid: string]: DCLInstanceConfig } = {};
  export const systems: { [uuid: string]: VLMVideoPlaylistSystem } = {};

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
    liveSrc: string = "";
    playlist: string[] = [];
    isLive: boolean = false;
    enableLiveStream?: boolean;
    clickEvent?: VLMClickEvent.DCLConfig;
    withCollisions: boolean;
    videoClipId?: string;
    emissiveIntensity: number;
    offType: SourceTypes;
    offImageSrc: string = "";
    uvsFlipped: boolean = false;

    constructor(config: VLMConfig) {
      super(config);
      this.init(config);
    }

    init: CallableFunction = (config: VLMConfig) => {
      try {
        this.sk = config?.sk;
        this.customId = config?.customId;
        this.parent = config?.parent;
        this.enabled = config?.enabled;
        this.enableLiveStream = config?.enableLiveStream;
        this.isLive = config?.isLive;
        this.liveSrc = config?.liveSrc;
        this.offType = config?.offType;
        this.offImageSrc = config?.offImageSrc;
        this.customRendering = !!config?.customRendering;
        this.emissiveIntensity = config?.emissiveIntensity || 1;
        this.clickEvent = config?.clickEvent;
        this.volume = config?.volume || 1;
        this.playlist = config?.playlist || this.playlist;
        this.withCollisions = config?.withCollisions;

        this.textureMode = this.isLive && this.enableLiveStream ? SourceTypes.LIVE : this.offType;

        configs[this.sk] = this;
        if (this.customId) {
          configs[this.customId] = configs[this.sk];
        }

        this.updateClickEvent(this.clickEvent);
        this.setVideoType();

        if (this.customRendering || !config?.instances || config?.instances.length < 1) {
          return;
        }

        config.instances?.forEach((instance: VLMInstanceConfig) => {
          this.createInstance(instance);
        });

      } catch (error) {
        throw error;
      }
    }

    remove: CallableFunction = () => {
      this.stop();
      if (systems[this.sk]) {
        systems[this.sk].kill();
      }
      this.instanceIds?.forEach((instanceId: string) => {
        try {
          instances[instanceId].remove();
        } catch (error) {
          throw error
        }
      });
    };

    delete: CallableFunction = () => {
      if (systems[this.sk]) {
        engine.removeSystem(systems[this.sk]);
        delete systems[this.sk];
      }
      delete configs[this.sk];
      this.instanceIds?.forEach((instanceId: string) => {
        instances[instanceId].delete();
      });
    };

    showAll: CallableFunction = () => {
      this.instanceIds?.forEach((instanceId: string) => {
        const visible = this.enabled && instances[instanceId].enabled,
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
      if (!instances[config.sk]) {
        new DCLInstanceConfig(this, config);
      } else {
        instances[config.sk].init(this, config);
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
      this.instanceIds?.forEach((instanceId: string) => {
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
      this.init(this);
    };

    updateOffType: CallableFunction = (offType: SourceTypes) => {
      if (this.offType === offType) {
        return;
      }
      this.offType = offType;
      this.init(this);

    };

    updateOnAirState: CallableFunction = (enableLiveStream: boolean) => {
      this.enableLiveStream = enableLiveStream;
      this.init(this);
    };

    updateOffImage: CallableFunction = (offImageSrc: string) => {
      this.offImageSrc = offImageSrc;
      this.init(this);
    };

    updateTexture: CallableFunction = async (src?: string) => {
      let texture: Texture | VideoTexture;
      try {
        this.instanceIds?.forEach((instanceId: string) => {
          if (instances[instanceId].getComponentOrNull(Material) || instances[instanceId].getComponentOrNull(BasicMaterial)) {
            instances[instanceId].removeComponent(Material)
          }
        });
        if (this.textureMode === SourceTypes.IMAGE) {
          const url = src || this.offImageSrc;
          texture = new Texture(url, { hasAlpha: true });
          this.transparencyMode = TransparencyMode.AUTO;
          this.videoTexture = null;
          this.imageTexture = texture;
          this.albedoTexture = texture;
          this.emissiveTexture = texture;
        } else if (this.textureMode === SourceTypes.LIVE) {
          const url = src || this.liveSrc;
          const videoClip = new VideoClip(url);
          texture = new VideoTexture(videoClip);
          this.imageTexture = null;
          this.videoTexture = texture;
          this.albedoTexture = texture;
          this.emissiveTexture = texture;
          // this.stop();
        } else if (this.textureMode === SourceTypes.PLAYLIST) {
          const url = src || this.playlist[0];
          const videoClip = new VideoClip(url);
          texture = new VideoTexture(videoClip);
          this.imageTexture = null;
          this.videoTexture = texture;
          this.albedoTexture = texture;
          this.emissiveTexture = texture;
        }

        this.instanceIds?.forEach((instanceId: string) => {
          instances[instanceId].addComponentOrReplace(this)
        });
      } catch (error) {
        log("VLM - Error updating texture", error);
      }

      try {
        if (this.textureMode === SourceTypes.IMAGE) {
          await fetch(this.offImageSrc);
        }

        this.correctUvs();
      } catch (error) {
        log('VLM - Placeholder image not found')
        this.remove();
        return;
      }

    };

    correctUvs: CallableFunction = () => {
      this.uvsFlipped = this.textureMode === SourceTypes.IMAGE;
      this.instanceIds?.forEach((instanceId: string) => {
        instances[instanceId].correctUvs(this.uvsFlipped);
      });
    };

    updateVolume: CallableFunction = (volume: number) => {
      this.volume = volume;
      const position = this.videoTexture!.position;
      this.videoTexture!.volume = volume;
      this.videoTexture!.seekTime(position);
    };

    updatePlaylist: CallableFunction = (playlist: string[]) => {
      try {
        const videoSystem = systems[this.sk] || new VLMVideoPlaylistSystem(this);
        this.playlist = playlist;

        if (this.textureMode === SourceTypes.PLAYLIST && !includes(this.playlist, videoSystem.playlist[videoSystem.playlistIndex])) {
          videoSystem.playlistIndex = 0;
          this.startPlaylist();
        }
      } catch (error) {
        throw error
      }
    };

    updateClickEvent: CallableFunction = (clickEvent: VLMClickEvent.DCLConfig) => {
      this.clickEvent = clickEvent;
      this.instanceIds?.forEach((instanceId: string) => {
        instances[instanceId].updateDefaultClickEvent(this.clickEvent);
      });
    };

    start: CallableFunction = () => {
      if (this.textureMode == SourceTypes.LIVE) {
        this.playLiveStream();
      } else if (this.textureMode == SourceTypes.PLAYLIST) {
        this.startPlaylist();
      }
    };

    playLiveStream: CallableFunction = () => {
      try {
        if (systems[this.sk]) {
          log(systems[this.sk])
          systems[this.sk].kill();
        }
        this.textureMode = SourceTypes.LIVE;
        this.stop();
        this.updateTexture(this.liveSrc);

        if (this.videoTexture) {
          this.videoTexture.play();
        }
        this.showAll();
      } catch (error) {
        throw error;
      }
    };

    startPlaylist: CallableFunction = () => {
      this.textureMode = SourceTypes.PLAYLIST;
      this.updateTexture(this.playlist[0]);
      if (this.videoTexture) {
        this.videoTexture.play();
      }
      if (systems[this.sk]) {
        systems[this.sk].start();
        return;
      } else {
        new VLMVideoPlaylistSystem(this);
      }
    };

    showImage: CallableFunction = async () => {
      if (systems[this.sk]) {
        log(systems[this.sk])
        systems[this.sk].kill();
      }
      this.textureMode = SourceTypes.IMAGE;
      await this.updateTexture(this.offImageSrc);
    };

    setLiveState: CallableFunction = (liveState: boolean) => {
      try {
        this.isLive = liveState;
        log('VLM - VIDEO STATE OFF TYPE', this.offType)
        this.setVideoType();
      } catch (error) {
        throw error;
      }
    };

    setVideoType: CallableFunction = (videoType: SourceTypes) => {
      if (!this.enabled) {
        this.textureMode = SourceTypes.NONE;
        return;
      } else if (this.textureMode === SourceTypes.NONE && this.enableLiveStream && this.isLive && this.enabled) {
        videoType == SourceTypes.LIVE
        this.showAll();
      }


      if (videoType == SourceTypes.LIVE || this.isLive && this.enableLiveStream) {
        this.playLiveStream();
      } else if (videoType == SourceTypes.IMAGE || (!this.enableLiveStream || !this.isLive) && this.offType === SourceTypes.IMAGE) {
        this.showImage();
      } else if (videoType == SourceTypes.PLAYLIST || (!this.enableLiveStream || !this.isLive) && this.offType === SourceTypes.PLAYLIST) {
        this.startPlaylist();
      } else if (videoType == SourceTypes.NONE || (!this.enableLiveStream || !this.isLive) && this.offType === SourceTypes.NONE) {
        this.remove();
      }
    };

    playNextVideo: CallableFunction = () => {
      try {
        const videoSystem = systems[this.sk] || new VLMVideoPlaylistSystem(this);
        videoSystem.playlistIndex += 1;
        if (videoSystem.playlistIndex > this.playlist.length - 1) {
          videoSystem.playlistIndex = 0;
        }
        if (!this.playlist[videoSystem.playlistIndex]) {
          log("VLM - No video found in playlist")
          return this.playNextVideo()
        }
        this.updateTexture(this.playlist[videoSystem.playlistIndex]);
        if (this.videoTexture) {
          this.stop();
          this.videoTexture.play();
        }
      } catch (error) {
        throw error;
      }
    };

    stop: CallableFunction = () => {
      try {
        if (this.videoTexture) {
          this.videoTexture.pause();
          this.videoTexture.reset();
        }
      } catch (error) {
        throw error;
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
    flipUvs: boolean = sdkImagesAreFlipped;
    uvsFlipped: boolean = false;
    defaultClickEvent: VLMClickEvent.DCLConfig;
    clickEvent: VLMClickEvent.DCLConfig;

    constructor(config: DCLConfig, instance: VLMInstanceConfig) {
      super(config, instance);
      this.init(config, instance);
    }

    init(config: DCLConfig, instance: VLMInstanceConfig) {
      this.sk = instance.sk;
      this.parent = instance.parent || config.parent;
      this.enabled = config.enabled ? instance.enabled : false;
      this.position = instance.position;
      this.scale = instance.scale;
      this.rotation = instance.rotation;
      this.withCollisions = instance.withCollisions;
      this.configId = config?.sk;
      this.uvsFlipped = config.uvsFlipped || this.uvsFlipped;
      this.clickEvent = instance?.clickEvent;
      this.defaultClickEvent = config?.clickEvent;
      instances[this.sk] = this;

      if (config.textureMode === SourceTypes.NONE) {
        instances[this.sk].remove();
        return;
      }

      const shape = new PlaneShape(); //// SDK SPECIFIC ////
      shape.withCollisions = this.withCollisions; //// SDK SPECIFIC ////
      this.addComponentOrReplace(shape); //// SDK SPECIFIC ////
      this.addComponentOrReplace(config); //// SDK SPECIFIC ////
      this.updateTransform(this.position, this.scale, this.rotation);
      this.updateDefaultClickEvent(this.defaultClickEvent);
      this.correctUvs(config.textureMode === SourceTypes.IMAGE);


      this.add();
    }

    add: CallableFunction = () => {
      try {
        if (this.isAddedToEngine() || this.customRendering || !configs[this.configId].enabled || !this.enabled) {
          return;
        }

        if (this.parent) {
          this.updateParent(this.parent);
        } else {
          engine.addEntity(this);
        }
      } catch (error) {
        throw error;
      }
    };

    delete: CallableFunction = () => {
      try {
        this.remove();

        for (const key in instances) {
          if (instances[key].sk === this.sk) {
            delete instances[key];
          }
        }
      } catch (error) {
        throw error;
      }
    };

    remove: CallableFunction = () => {
      try {
        if (this.isAddedToEngine()) {
          engine.removeEntity(this);
        }
      } catch (error) {
        throw error;
      }
    };

    correctUvs: CallableFunction = (flipped: boolean) => {
      try {
        const plane = this.getComponentOrNull(PlaneShape); //// SDK SPECIFIC ////
        if (!plane) {
          return;
        }
        if (flipped) {
          plane.uvs = [0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1]; //// SDK SPECIFIC ////
        } else {
          plane.uvs = [0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0]; //// SDK SPECIFIC ////
        }
      } catch (error) {
        throw error;
      }
    };

    updateParent: CallableFunction = (parent: string) => {
      try {
        if (parent) {
          this.parent = parent;
          const instanceParent = getEntityByName(parent);
          this.setParent(instanceParent); //// SDK SPECIFIC ////
        } else {
          this.setParent(null); //// SDK SPECIFIC ////
        }
      } catch (error) {
        throw error;
      }
    };

    updateCustomId: CallableFunction = (customId: string) => {
      try {
        if (this.customId && instances[this.customId]) {
          delete instances[this.customId];
        }
        instances[customId] = instances[this.sk];
        this.customId = customId;
      } catch (error) {
        throw error;
      }
    };

    updateCustomRendering: CallableFunction = (customRendering: boolean) => {
      try {
        this.customRendering = customRendering;
        this.init(configs[this.configId], this);
      } catch (error) {
        throw error;
      }
    };

    updateTransform: CallableFunction = (newPosition?: SimpleTransform, newScale?: SimpleTransform, newRotation?: SimpleTransform) => {
      try {
        const newTransform = { position: newPosition || this.position, scale: newScale || this.scale, rotation: newRotation || this.rotation },
          { position, scale, rotation } = newTransform;

        this.addComponentOrReplace(
          new Transform({
            position: new Vector3(position.x, position.y, position.z),
            scale: new Vector3(scale.x, scale.y, scale.z),
            rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z),
          }) //// SDK SPECIFIC ////
        );
      } catch (error) {
        throw error;
      }
    };

    updateCollider: CallableFunction = (withCollisions: boolean) => {
      try {
        this.withCollisions = withCollisions;
        this.init(configs[this.configId], this)
      } catch (error) {
        throw error;
      }
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
        } else {
          return
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
        } else if (instances[this.sk].getComponentOrNull(OnPointerDown)) {
          instances[this.sk].removeComponent(OnPointerDown);
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

  export class VLMVideoPlaylistSystem implements ISystem {
    enableDebugging: boolean = VLMEnvironment.devMode && true;
    sk: string;
    customId?: string;
    timer: number = 0;
    dtDelay: number = 0;
    video: DCLConfig;
    playlistObservers: Observable<{
      componentId: string;
      videoClipId: string;
      videoStatus: number;
      currentOffset: number;
      totalVideoLength: number;
    }>[] = [];
    playlistData: Array<{
      componentId: string;
      videoClipId: string;
      videoStatus: number;
      currentOffset: number;
      totalVideoLength: number;
      observer?: Observer<{ componentId: string; videoClipId: string; videoStatus: number; currentOffset: number; totalVideoLength: number; }>
    }> = [];
    videoLength: number = 0;
    videoStatus: number = 0;
    videoProgress: number = 0;
    playing: boolean = true;
    playlist: string[] = [];
    playlistIndex: number = 0;
    stopped: boolean = false;
    initialized: boolean = false;

    constructor(config: DCLConfig) {
      this.video = configs[config?.sk];
      this.sk = config?.sk;
      this.playlist = config?.playlist;

      systems[this.sk] = this;
      if (config.customId) {
        this.customId = config.customId;
        systems[this.customId] = this;
      }

      engine.addSystem(systems[this.sk]);

      if (this.video?.customRendering) {
        this.stop();
      } else {
        this.start();
      }
      this.dbLog('VLM VIDEO PLAYLIST SYSTEM - INITIALIZED SYSTEM')
    }

    start: CallableFunction = () => {
      this.stopped = false;
      this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - STATE CHANGE - STARTED SYSTEM`);
    };

    stop: CallableFunction = () => {
      this.stopped = true;
      this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - STATE CHANGE - STOPPED SYSTEM`);
    };

    kill: CallableFunction = () => {
      this.stopped = true;
      engine.removeSystem(this); //// SDK SPECIFIC ////
      for (const key in systems) {
        if (systems[key].sk === this.sk) {
          delete systems[key];
        }
      }
      this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - STATE CHANGE - TERMINATED SYSTEM`);
    };

    update(dt: number) {
      if (this.stopped) {
        this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - STOPPED`);
        return;
      }
      if (!this.video) {
        this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - NO VIDEO FOUND`);
        return;
      } else if (this.dtDelay > 1) {
        this.dtDelay = 0;
      } else if (this.dtDelay >= 0) {
        this.dtDelay += dt;
        return;
      } else if (this.dtDelay === 0) {
        this.dtDelay += dt;
      }

      this.dbLog('VLM VIDEO PLAYLIST SYSTEM - START UPDATE')

      if (configs[this.sk] && !configs[this.sk].enabled) {
        this.removeVideoObserver();
        this.kill();
        return;
      }

      this.playlistLoop(dt);
      return;
    }

    reset: CallableFunction = () => {
      this.removeVideoObserver();
      this.dbLog("VLM VIDEO PLAYLIST SYSTEM - STATE CHANGE - START EMPTY STATE");
    }

    playlistLoop: CallableFunction = (dt: number) => {
      try {
        if (this.playlist[this.playlistIndex] && !this.playlistData[this.playlistIndex]) {
          this.playlistData[this.playlistIndex] = { videoClipId: null, componentId: null, totalVideoLength: null, videoStatus: null, currentOffset: null, observer: null };
          this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - PLAYLIST MODE - INITIALIZED PLAYLIST DATA`)
        } else if (!this.playlist[this.playlistIndex]) {
          return this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - PLAYLIST MODE - NO VIDEO FOUND IN PLAYLIST`)
        }

        this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - PLAYLIST MODE - PLAYING VIDEO ${this.playlistIndex} - ${this.playlist[this.playlistIndex]}`)
        if (!this.playlistData[this.playlistIndex].observer) {
          this.playlistData[this.playlistIndex].observer = onVideoEvent.add((data) => {
            this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - VIDEO EVENT LISTENER`);

            if (data.videoClipId && data.videoClipId !== this.video.videoTexture.videoClipId) {
              this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - VIDEO EVENT LISTENER - VIDEO CLIP ID MISMATCH - ${data.videoClipId} - ${this.video.videoTexture.videoClipId}`);
              this.removeVideoObserver();
              return
            }


            const offset = data.currentOffset,
              totalLength = data.totalVideoLength,
              currentPercentage = (offset / totalLength) * 100,
              finePercentage = Math.round(currentPercentage * 100) / 100;
            this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - PLAYLIST MODE - VIDEO PROGRESS - VIDEO ${this.playlistIndex} - ${this.videoProgress}% - ${finePercentage}%`);

            if (this.videoProgress === 0 && finePercentage > 0) {
              this.videoProgress = finePercentage
            } else if (this.videoProgress < finePercentage) {
              this.videoProgress = finePercentage;
            } else if (finePercentage > 99) {
              this.videoProgress = finePercentage;
            } else if (this.videoProgress > finePercentage) {
            } else {
              this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - PLAYLIST MODE - VIDEO PROGRESS - VIDEO ${this.playlistIndex} - ${this.videoProgress}% - ${finePercentage}%`);
              return;
            }

            const playlistIndex = this.playlistIndex;
            const playlistDataObj = { videoClipId: data.videoClipId, componentId: data.componentId, totalVideoLength: Math.floor(data.totalVideoLength), videoStatus: data.videoStatus, currentOffset: Math.ceil(data.currentOffset) };

            this.playlistData[playlistIndex] = { ...this.playlistData[playlistIndex], ...playlistDataObj };

            const videoFinished = playlistDataObj.totalVideoLength > 0 && playlistDataObj.currentOffset >= (playlistDataObj.totalVideoLength - dt);

            this.dbLog(`VLM VIDEO PLAYLIST SYSTEM - PLAYLIST MODE - IDLE STATE -  VIDEO PROGRESS - VIDEO ${this.playlistIndex} - ${this.videoProgress}% - ${finePercentage}%`);

            if (videoFinished) {
              this.videoProgress = 0;
              this.removeVideoObserver();
              this.video.playNextVideo();
              this.dbLog("VLM VIDEO PLAYLIST SYSTEM - STATE CHANGE - NEXT PLAYLIST VIDEO");
              return;
            }
          });
        }

        if (this.video.textureMode !== SourceTypes.PLAYLIST || !this.initialized) {
          this.playing = true;
          this.video.startPlaylist();
          this.initialized = true;
          this.dbLog("VLM VIDEO PLAYLIST SYSTEM - STATE CHANGE - START PLAYLIST");
        }
      } catch (error) {
        throw error
      }
    }

    removeVideoObserver: CallableFunction = () => {
      if (this.playlistData[this.playlistIndex] && this.playlistData[this.playlistIndex].observer) {
        onVideoEvent.remove(this.playlistData[this.playlistIndex].observer);
        this.playlistData[this.playlistIndex] = { videoClipId: null, componentId: null, totalVideoLength: null, videoStatus: null, currentOffset: null, observer: null };
      }
    }

    private dbLog: CallableFunction = (message: string) => {
      if (this.enableDebugging) {
        log(message);
      }
    }
  }
}
