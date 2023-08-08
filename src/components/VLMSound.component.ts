import { getEntityByName } from "../shared/entity";
import { VLMBase } from "./VLMBaseConfig.component";
import { Audible, HasPlaylist, Playable, SimpleTransform, Transformable } from "../shared/interfaces";

export namespace VLMSound {
  export const configs: { [uuid: string]: DCLConfig } = {};
  export const instances: { [uuid: string]: DCLInstanceConfig } = {};
  export const systems: { [uuid: string]: DCLSoundSystem } = {};

  export enum SourceType {
    CLIP,
    LOOP,
    PLAYLIST,
    STREAM,
  }

  export class DCLConfig extends VLMBase.AudioConfig implements Audible, Playable {
    sk: string;
    customId?: string;
    parent?: string;
    enabled: boolean;
    audioPath: string;
    instanceIds: string[] = [];
    volume: number;
    audioClip: AudioClip = new AudioClip("");
    audioStream?: AudioStream;
    customRendering?: boolean;
    sourceType: SourceType;
    showLocators: boolean = false;

    constructor(config: VLMConfig) {
      super(config);
      try {
        this.sk = config.sk;
        this.customId = config.customId;
        this.audioPath = config.audioPath;
        this.volume = config.volume;
        this.parent = config.parent;
        this.sourceType = config.sourceType;
        this.enabled = config.enabled;
        configs[this.sk] = this;
        if (this.customId) {
          configs[this.customId] = configs[this.sk];
        }
        if (this.customRendering || !config.instances || config.instances.length < 1) {
          return;
        }

        if (config.sourceType === SourceType.STREAM) {
          this.audioStream = new AudioStream(config.audioPath);
        } else if (config.sourceType === SourceType.CLIP || config.sourceType === SourceType.LOOP) {
          this.audioClip = new AudioClip(config.audioPath);
        }

        config.instances.forEach((instance: VLMInstanceConfig) => {
          this.createInstance(instance);
        });
      } catch (e) {
        log(e);
        log("VLM: Error creating sound config");
        throw e;
      }
    }

    remove: CallableFunction = () => {
      [...this.instanceIds].forEach((instanceId: string) => {
        VLMSound.instances[instanceId].remove();
      });
    };

    delete: CallableFunction = () => {
      engine.removeSystem(VLMSound.systems[this.sk]);
      delete VLMSound.systems[this.sk];
      delete VLMSound.configs[this.sk];
      [...this.instanceIds].forEach((instanceId: string) => {
        VLMSound.instances[instanceId].delete();
      });
    };

    showAll: CallableFunction = () => {
      [...this.instanceIds].forEach((instanceId: string) => {
        const visible = VLMSound.instances[instanceId].enabled,
          parent = VLMSound.instances[instanceId].parent || this.parent;

        if (!visible) {
          return;
        } else if (parent) {
          VLMSound.instances[instanceId].updateParent(parent);
        } else {
          VLMSound.instances[instanceId].add();
        }
      });
    };

    createInstance: CallableFunction = (config: VLMInstanceConfig) => {
      try {
        this.instanceIds.push(config.sk);
        instances[config.sk] = new DCLInstanceConfig(this, config);
        if (config.customId) {
          instances[config.customId] = instances[config.sk];
        }
      } catch (e) {
        log(e);
        log("VLM: Error creating sound instance");
        throw e;
      }
    };

    removeInstance: CallableFunction = (instanceId: string) => {
      VLMSound.instances[instanceId].remove();
    };

    deleteInstance: CallableFunction = (instanceId: string) => {
      this.instanceIds = this.instanceIds.filter((id: string) => id !== instanceId);
      VLMSound.instances[instanceId].delete();
    };

    addInstance: CallableFunction = (instanceId: string) => {
      VLMSound.instances[instanceId].add();
    };

    updateParent: CallableFunction = (parent: string) => {
      [...this.instanceIds].forEach((instanceId: string) => {
        if (VLMSound.instances[instanceId].parent === this.parent) {
          VLMSound.instances[instanceId].updateParent(parent);
        }
      });
      this.parent = parent;
    };

    updateCustomId: CallableFunction = (customId: string) => {
      if (this.customId && VLMSound.configs[this.customId]) {
        delete VLMSound.configs[this.customId];
      }
      VLMSound.configs[customId] = VLMSound.configs[this.sk];
      this.customId = customId;
    };

    updateAllTransforms: CallableFunction = (newPosition?: SimpleTransform, newScale?: SimpleTransform, newRotation?: SimpleTransform) => {
      this.instanceIds.forEach((instanceId: string) => {
        VLMSound.instances[instanceId].updateTransform(newPosition, newScale, newRotation);
      });
    };

    updateVolume: CallableFunction = (volume: number) => {
      this.volume = volume;
      this.audioClip!.volume = volume;
    };

    updateSource: CallableFunction = (src: string) => {
      const objThis = this;
      this.audioPath = src || this.audioPath;
      this.instanceIds.forEach((instanceId: string) => {
        const instance = VLMSound.instances[instanceId];
        if (objThis.sourceType === SourceType.STREAM && VLMSound.instances[instanceId].hasComponent(AudioSource)) {
          VLMSound.instances[instanceId].removeComponent(AudioSource);
        } else if (objThis.sourceType !== SourceType.STREAM && instance.hasComponent(AudioStream)) {
          instance.removeComponent(AudioStream);
        }

        if (objThis.sourceType === SourceType.STREAM) {
          objThis.audioStream = new AudioStream(src);
          VLMSound.instances[instanceId].addComponentOrReplace(objThis.audioStream);
          objThis.audioStream.playing = objThis.enabled && instance.enabled;
        } else {
          objThis.audioClip = new AudioClip(src);
          instance.addComponentOrReplace(new AudioSource(objThis.audioClip));
          instance.getComponent(AudioSource).playing = instance.enabled;
          instance.getComponent(AudioSource).loop = objThis.sourceType === SourceType.LOOP;
        }
      });
    };

    updateSourceType: CallableFunction = (type: SourceType) => {
      this.sourceType = type;
      if (type === SourceType.LOOP) {
        this.loop = true;
      } else {
        this.loop = false;
      }

      this.updateSource();
    };

    toggleLocators: CallableFunction = () => {
      log("toggling locators");
      if (this.showLocators) {
        this.showLocators = false;
        Object.keys(VLMSound.instances).forEach((id: string) => {
          VLMSound.instances[id].removeComponent(SphereShape);
        });
      } else {
        this.showLocators = true;
        Object.keys(VLMSound.instances).forEach((id: string) => {
          VLMSound.instances[id].addComponentOrReplace(new SphereShape());
          VLMSound.instances[id].getComponent(Transform).scale.setAll(0.1);
        });
      }
    };

    updatePlaylist: CallableFunction = (playlist: string[] | any) => {};

    start: CallableFunction = () => {};

    startLive: CallableFunction = () => {};

    startPlaylist: CallableFunction = () => {};

    playNextClip: CallableFunction = () => {};

    stop: CallableFunction = () => {};
  }

  export class VLMConfig extends DCLConfig {
    instances: VLMInstanceConfig[];

    constructor(config: VLMConfig) {
      super(config);
      this.instances = config.instances;
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
    volume: number;
    loop: boolean;

    constructor(config: DCLConfig, instance: VLMInstanceConfig) {
      super(config, instance);
      try {
        this.sk = instance.sk;
        this.enabled = instance.enabled && config.enabled;
        this.parent = instance.parent || config.parent;
        this.position = instance.position;
        this.scale = instance.scale;
        this.rotation = instance.rotation;
        this.volume = instance.volume;
        this.loop = config.sourceType === SourceType.LOOP;
        this.configId = config.sk;

        if (config.audioClip && config.sourceType === SourceType.CLIP) {
          const source = new AudioSource(config.audioClip);
          this.addComponent(source);
          source.loop = false;
          source.volume = this.volume;
          source.playOnce();
        } else if (config.audioStream && config.sourceType === SourceType.STREAM) {
          const source = config.audioStream;
          this.addComponent(source);
          source.volume = this.volume;
        } else if (config.sourceType === SourceType.LOOP) {
          const source = new AudioSource(config.audioClip);
          this.addComponent(source);
          source.loop = false;
          source.volume = this.volume;
          source.playing = this.enabled;
        }

        if (config.sourceType < SourceType.STREAM) {
          this.updateTransform(this.position, this.scale, this.rotation);
        }
        if (this.enabled) {
          this.add();
        }
      } catch (e) {
        throw e;
      }
    }

    add: CallableFunction = () => {
      const parent = this.parent || VLMSound.configs[this.configId].parent;
      if (parent) {
        this.updateParent(parent);
      } else {
        engine.addEntity(this);
      }
    };

    delete: CallableFunction = () => {
      delete VLMSound.instances[this.sk];
      if (this.customId) {
        delete VLMSound.instances[this.customId];
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
      if (this.customId && VLMSound.instances[this.customId]) {
        delete VLMSound.instances[this.customId];
      }
      VLMSound.instances[customId] = VLMSound.instances[this.sk];
      this.customId = customId;
    };

    updateTransform: CallableFunction = (position?: SimpleTransform, scale?: SimpleTransform, rotation?: SimpleTransform) => {
      this.position = position || this.position;
      this.scale = scale || this.scale;
      this.rotation = rotation || this.rotation;

      this.addComponentOrReplace(
        new Transform({
          position: new Vector3(this.position.x, this.position.y, this.position.z),
          scale: new Vector3(this.scale.x, this.scale.y, this.scale.z),
          rotation: Quaternion.Euler(this.rotation.x, this.rotation.y, this.rotation.z),
        })
      );
    };
  }

  export class VLMInstanceConfig extends DCLInstanceConfig {}

  export class DCLSoundSystem implements ISystem {
    sk: string;
    customId?: string;
    timer: number = 0;
    dtDelay: number = 0;
    config: DCLConfig;
    videoStatus: number = 0;
    checkingStatus: boolean = false;
    live: boolean = true;
    playing: boolean = true;
    initialCheckComplete: boolean = false;
    instancesHidden: boolean = false;
    stopped: boolean = false;

    constructor(config: DCLConfig) {
      this.config = config;
      this.sk = config.sk;
      VLMSound.systems[config.sk] = this;
      if (config.customId) {
        this.customId = config.customId;
        VLMSound.systems[this.customId] = this;
      }
      engine.addSystem(VLMSound.systems[config.sk]);

      if (this.config.customRendering) {
        this.stop();
      }
    }

    start: CallableFunction = () => {
      this.config.start();
      this.stopped = false;
    };

    stop: CallableFunction = () => {
      this.config.stop();
      this.stopped = true;
    };

    update() {
      // Get the current scale of the entity
      Object.keys(VLMSound.instances).forEach((id: string) => {
        let instance = VLMSound.instances[id];
        // Calculate the new scale.
        // The `Math.sin` function gives us a smooth oscillating value between -1 and 1,
        // we add 1 to make it between 0 and 2, and divide by 2 to make it between 0 and 1.
        let newScale = 0.1 * (Math.sin(Date.now() / 1000) + 1) + 0.1;

        // Set the new scale of the entity
        instance.getComponent(Transform).scale.set(newScale, newScale, newScale);
      });
    }
    statusCheckDelay: number = 0;

    checkStreamStatus: CallableFunction = async () => {};

    setLiveState: CallableFunction = (liveState: boolean) => {};
  }
}
