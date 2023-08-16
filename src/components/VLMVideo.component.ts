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
      this.enableLiveStream = config?.enableLiveStream;
      this.isLive = config.isLive;
      this.liveSrc = config.liveSrc;
      this.offType = config.offType;
      this.offImageSrc = config.offImageSrc;
      this.customRendering = !!config.customRendering;
      this.emissiveIntensity = config.emissiveIntensity || 1;
      this.clickEvent = config.clickEvent;
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

      new System(this);
    }

    remove: CallableFunction = () => {
      this.instanceIds.forEach((instanceId: string) => {
        try {
          instances[instanceId].remove();
        } catch (error) {
          throw error
        }
      });
    };

    delete: CallableFunction = () => {
      engine.removeSystem(systems[this.sk]);
      delete systems[this.sk];
      delete configs[this.sk];
      this.instanceIds.forEach((instanceId: string) => {
        instances[instanceId].delete();
      });
    };

    showAll: CallableFunction = () => {
      this.instanceIds.forEach((instanceId: string) => {
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
      this.instanceIds.forEach((instanceId: string) => {
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
    updateOffType: CallableFunction = (offType: SourceTypes) => {
      this.offType = offType;
      if (!systems[this.sk]) {
        new System(this);
      }
    };
    updateOnAirState: CallableFunction = (enableLiveStream: boolean) => {
      this.enableLiveStream = enableLiveStream;
      if (!systems[this.sk]) {
        new System(this);
      }
    };
    updateOffImage: CallableFunction = (offImageSrc: string) => {
      this.offImageSrc = offImageSrc;
      this.updateTexture(this.offImageSrc);
      this.showAll();
    };

    updateTexture: CallableFunction = (src: string) => {
      let texture;
      this.instanceIds.forEach((instanceId: string) => {
        if (instances[instanceId].getComponentOrNull(Material) || instances[instanceId].getComponentOrNull(BasicMaterial)) {
          instances[instanceId].removeComponent(Material)
        }
      });
      if (this.textureMode === SourceTypes.IMAGE) {
        const url = src || this.offImageSrc;
        texture = new Texture(url, { hasAlpha: true });
        this.videoTexture = null;
        this.imageTexture = texture;
        this.albedoTexture = texture;
        this.emissiveTexture = texture;
        this.stop();
      } else {
        const url = src || this.liveSrc;
        const videoClip = new VideoClip(url);
        texture = new VideoTexture(videoClip);
        this.imageTexture = null;
        this.videoTexture = texture;
        this.albedoTexture = texture;
        this.emissiveTexture = texture;
        this.stop();
      }

      this.instanceIds.forEach((instanceId: string) => {
        instances[instanceId].addComponentOrReplace(this)
      });

      this.correctUvs();

    };

    correctUvs: CallableFunction = () => {
      this.uvsFlipped = this.textureMode === SourceTypes.IMAGE;
      this.instanceIds.forEach((instanceId: string) => {
        instances[instanceId].correctUvs(this.uvsFlipped);
      });
    };

    updateVolume: CallableFunction = (volume: number) => {
      this.volume = volume;
      const position = this.videoTexture!.position;
      this.videoTexture!.volume = volume;
      this.videoTexture!.seekTime(position);
    };

    updatePlaylist: CallableFunction = (playlist: string[] | any) => {
      const currentlyPlayingVideo = `${this.playlist[this.playlistIndex]}`;

      this.playlist = playlist;

      if (this.playlist.length > 1) {
        this.videoTexture!.loop = true;
      } else {
        this.videoTexture!.loop = false;
      }

      if (this.textureMode == SourceTypes.PLAYLIST && this.videoTexture?.playing && !playlist.includes(currentlyPlayingVideo)) {
        // Currently playing video is not in the new playlist
        this.startPlaylist();
      } else if (this.textureMode == SourceTypes.PLAYLIST && !this.videoTexture?.playing) {
        // Currently playing video is in newly updated playlist but not playing
        this.updateTexture(this.playlist[this.playlistIndex])
      }
      this.showAll();
    };

    updateClickEvent: CallableFunction = (clickEvent: VLMClickEvent.DCLConfig) => {
      this.clickEvent = clickEvent;
      this.instanceIds.forEach((instanceId: string) => {
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
      try {
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

    showImage: CallableFunction = async () => {
      this.textureMode = SourceTypes.IMAGE;
      this.stop();

      try {
        await fetch(this.offImageSrc);
      } catch (error) {
        log('VLM - Placeholder image not found')
        return;
      }

      this.updateTexture(this.offImageSrc);
      this.showAll();
    };

    setLiveState: CallableFunction = (liveState: boolean) => {
      try {
        this.isLive = liveState;

        if (!this.isLive && this.textureMode === SourceTypes.LIVE) {
          this.stop();
          this.textureMode = this.offType;
        } else if (this.isLive) {
          this.startLive();
        }

        if (this.textureMode === SourceTypes.NONE) {
          this.remove();
        } else if (this.textureMode !== SourceTypes.IMAGE) {
          this.start();
        }

        if (!this.isLive) {
        } else {
        }

        if (systems[this.sk] && !this.isLive && this.offType === SourceTypes.PLAYLIST) {
          systems[this.sk].reset()
          systems[this.sk].start();
        } else if (!this.isLive && systems[this.sk]) {
          systems[this.sk].kill();
        } else if (systems[this.sk] && this.isLive) {
          new System(this);
        }
      } catch (error) {
        throw error;
      }
    };

    playNextVideo: CallableFunction = () => {
      try {
        this.playlistIndex += 1;
        if (this.playlistIndex > this.playlist.length - 1) {
          this.playlistIndex = 0;
        }
        if (!this.playlist[this.playlistIndex]) {
          return this.playNextVideo()
        }
        this.stop();
        this.updateTexture(this.playlist[this.playlistIndex]);
        if (this.videoTexture) {
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
      instances[this.sk] = this;
      const shape = new PlaneShape(); //// SDK SPECIFIC ////
      shape.withCollisions = this.withCollisions; //// SDK SPECIFIC ////
      this.addComponent(shape); //// SDK SPECIFIC ////
      this.addComponent(config); //// SDK SPECIFIC ////
      this.updateTransform(this.position, this.scale, this.rotation);
      this.updateDefaultClickEvent(config.clickEvent);
      this.correctUvs(config.textureMode === SourceTypes.IMAGE);


      if (this.enabled) {
        this.add();
      }
    }

    add: CallableFunction = () => {
      const parent = this.parent || configs[this.configId].parent;
      const hidden = configs[this.configId].textureMode === SourceTypes.NONE;
      if (parent) {
        this.updateParent(parent);
      } else if (!this.isAddedToEngine() && !hidden) {
        engine.addEntity(this); //// SDK SPECIFIC ////
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
        if (customRendering) {
          this.remove();
        } else {
          this.add();
        }
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
        const shape = new PlaneShape();
        shape.withCollisions = this.withCollisions;
        this.addComponentOrReplace(shape); //// SDK SPECIFIC ////
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

  export class System implements ISystem {
    enableDebugging: boolean = VLMEnvironment.devMode && true;
    sk: string;
    customId?: string;
    timer: number = 0;
    dtDelay: number = 0;
    video: DCLConfig;
    videoLength: number = 0;
    videoStatus: number = 0;
    videoProgress: number = 0;
    checkingStatus: boolean = true;
    isLive: boolean = false;
    enableLiveStream: boolean = false;
    playing: boolean = false;
    playlist: string[] = [];
    offType: SourceTypes;
    textureMode: SourceTypes;
    instancesHidden: boolean = false;
    stopped: boolean = false;
    observer: any;
    initialized: boolean = false;

    constructor(config: DCLConfig) {
      this.video = configs[config.sk];
      this.sk = config.sk;
      this.isLive = config.isLive;
      this.offType = config.offType;
      this.textureMode = config.textureMode;
      this.enableLiveStream = config.enableLiveStream;
      this.playlist = config.playlist;
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
      this.dbLog(`VLM VIDEO SYSTEM - STATE CHANGE - STARTED SYSTEM`);
    };

    stop: CallableFunction = () => {
      this.stopped = true;
      this.dbLog(`VLM VIDEO SYSTEM - STATE CHANGE - STOPPED SYSTEM`);
    };

    kill: CallableFunction = () => {
      this.stopped = true;
      engine.removeSystem(this); //// SDK SPECIFIC ////
      this.dbLog(`VLM VIDEO SYSTEM - STATE CHANGE - TERMINATED SYSTEM`);
    };

    update(dt: number) {
      if (this.stopped) {
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

      let hasChanged = this.enableLiveStream !== this.video.enableLiveStream ||
        this.offType !== this.video.offType ||
        this.textureMode !== this.video.textureMode ||
        this.isLive !== this.video.isLive ||
        this.playlist !== this.video.playlist ||
        this.playing !== !!this.video.videoTexture?.playing;

      if (hasChanged) {
        this.enableLiveStream = this.video.enableLiveStream;
        this.offType = this.video.offType;
        this.textureMode = this.video.textureMode;
        this.isLive = this.video.isLive;
        this.playlist = this.video.playlist;
        this.playing = !!this.video.videoTexture?.playing;
      }


      if (this.enableLiveStream && this.isLive) {
        this.liveStreamLoop();
        return;
      } else if (this.video.offType === SourceTypes.PLAYLIST) {
        this.playlistLoop(dt);
        return;
      } else if (this.video.offType === SourceTypes.IMAGE) {
        this.imageLoop();
        return;
      } else if (this.video.offType === SourceTypes.NONE) {
        this.emptyLoop();
      }
    }

    reset: CallableFunction = () => {
      onVideoEvent.clear();
      this.video.showAll();
      this.dbLog("VLM VIDEO SYSTEM - STATE CHANGE - START EMPTY STATE");
    }

    emptyLoop: CallableFunction = () => {
      if (this.video.textureMode !== SourceTypes.NONE || !this.initialized) {
        this.video.textureMode = SourceTypes.NONE;
        this.video.remove();
        this.playing = false;
        this.initialized = true;
        onVideoEvent.clear();
        this.dbLog("VLM VIDEO SYSTEM - STATE CHANGE - START EMPTY STATE");
      } else {
        this.dbLog(`VLM VIDEO SYSTEM - IDLE STATE - INVISIBLE MODE`);
      }
    }

    liveStreamLoop: CallableFunction = () => {
      if (this.video.textureMode !== SourceTypes.LIVE || !this.initialized) {
        onVideoEvent.clear();
        this.video.startLive();
        this.playing = true;
        this.initialized = true;
        this.dbLog("VLM VIDEO SYSTEM - STATE CHANGE - START LIVE STREAM");
      } else {
        this.dbLog(`VLM VIDEO SYSTEM - IDLE STATE - LIVE STREAM MODE - ${this.video.liveSrc}`);
      }
    }

    playlistLoop: CallableFunction = (dt: number) => {
      try {
        const multipleVideos = this.video.playlist?.length > 1;
        if (multipleVideos) {
          this.video.videoTexture.loop = true;
        } else {
          this.video.videoTexture.loop = false;
        }

        this.observer = onVideoEvent.add((data) => {
          if (data.videoClipId !== this.video.videoTexture.videoClipId) {
            this.dbLog(`VLM VIDEO SYSTEM - VIDEO EVENT LISTENER - VIDEO CLIP ID MISMATCH - ${data.videoClipId} - ${this.video.videoTexture.videoClipId}`);
            return
          }
          const offset = data.currentOffset,
            totalLength = data.totalVideoLength,
            currentPercentage = (offset / totalLength) * 100,
            finePercentage = Math.round(currentPercentage * 100) / 100;

          if (this.videoProgress === 0 && finePercentage > 0) {
            this.videoProgress = finePercentage
          } else if (this.videoProgress < finePercentage) {
            this.videoProgress = finePercentage;
          } else if (finePercentage > 99) {
            this.videoProgress = finePercentage;
          } else {
            return;
          }

          this.videoStatus = data.videoStatus;
          this.videoLength = Math.floor(data.totalVideoLength);
          this.timer = Math.ceil(data.currentOffset);

          const videoFinished = this.timer >= (this.videoLength - dt);


          this.dbLog(`VLM VIDEO SYSTEM - IDLE STATE - PLAYLIST MODE - VIDEO PROGRESS - VIDEO ${this.video.playlistIndex} - ${this.videoProgress}%`);

          if (multipleVideos && videoFinished) {

            this.videoProgress = 0;
            onVideoEvent.remove(this.observer);
            this.video.playNextVideo();
            this.dbLog("VLM VIDEO SYSTEM - STATE CHANGE - NEXT PLAYLIST VIDEO");
            return;
          }

        });
        if (this.video.textureMode !== SourceTypes.PLAYLIST || !this.initialized) {
          this.playing = true;
          this.video.startPlaylist();
          this.initialized = true;
          this.dbLog("VLM VIDEO SYSTEM - STATE CHANGE - START PLAYLIST");
        }
      } catch (error) {
        throw error
      }
    }

    imageLoop: CallableFunction = () => {
      const video = configs[this.sk];
      if (video.textureMode !== SourceTypes.IMAGE || !this.video.imageTexture || !this.initialized) {
        video.remove();
        video.showImage();
        this.playing = false;
        this.initialized = true;
        video.showAll();
        this.dbLog("VLM VIDEO SYSTEM - STATE CHANGED - SHOW IMAGE");
        return;
      } else {
        this.dbLog("VLM VIDEO SYSTEM - IDLE STATE - IMAGE MODE");
        return
      }
    }

    private dbLog: CallableFunction = (message: string) => {
      if (this.enableDebugging) {
        log(message);
      }
    }
  }
}
