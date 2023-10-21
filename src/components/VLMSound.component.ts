import { getEntityByName } from "../shared/entity";
import { VLMBase } from "./VLMBaseConfig.component";
import { Audible, HasPlaylist, Playable, SimpleTransform, Transformable } from "../shared/interfaces";
import { getSoundPath } from "../shared/paths";
import { includes } from "../utils";

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
    audioSrc: string;
    audioClip: AudioClip;
    audioStream?: AudioStream;
    instanceIds: string[] = [];
    volume: number;
    customRendering?: boolean;
    sourceType: SourceType;
    showLocators: boolean = false;
    locatorSystem?: SoundLocatorSystem;
    loop: boolean = false;

    constructor(config: VLMConfig) {
      super(config);
      this.init(config);
    }

    init: CallableFunction = (config: VLMConfig) => {
      try {
        this.sk = config?.sk;
        this.customId = config?.customId;
        this.volume = config?.volume;
        this.parent = config?.parent;
        this.sourceType = config?.sourceType;
        this.audioSrc = config?.audioSrc;
        this.enabled = config?.enabled;
        this.customRendering = config?.customRendering;
        this.loop = config?.sourceType === SourceType.LOOP;

        if (config.sourceType === SourceType.STREAM) {
          this.audioStream = new AudioStream(config.audioSrc);
        } else if (config.sourceType === SourceType.CLIP || config.sourceType === SourceType.LOOP) {
          this.audioClip = new AudioClip(`${getSoundPath()}${this.audioSrc}`);
        }
        this.updateVolume(this.volume);

        VLMSound.configs[this.sk] = this;
        if (this.customId) {
          VLMSound.configs[this.customId] = VLMSound.configs[this.sk];
        }
        if (this.customRendering || !config.instances || config.instances.length < 1) {
          return;
        }
        config.instances.forEach((instance: VLMInstanceConfig) => {
          this.createInstance(instance);
        });
      } catch (e) {
        log("VLM: Error creating sound config");
        throw e;
      }
    };

    remove: CallableFunction = () => {
      try {
        this.instanceIds.forEach((instanceId: string) => {
          VLMSound.instances[instanceId].remove();
        });
      } catch (error) {
        throw error;
      }
    };

    delete: CallableFunction = () => {
      try {
        engine.removeSystem(VLMSound.systems[this.sk]);
        delete VLMSound.systems[this.sk];
        delete VLMSound.configs[this.sk];
        this.instanceIds.forEach((instanceId: string) => {
          VLMSound.instances[instanceId].delete();
        });
      } catch (error) {
        throw error;
      }
    };

    showAll: CallableFunction = () => {
      try {
        this.instanceIds.forEach((instanceId: string) => {
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
      } catch (error) {
        throw error;
      }
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
      VLMSound.instances[instanceId].remove();
    };

    deleteInstance: CallableFunction = (instanceId: string) => {
      this.instanceIds = this.instanceIds.filter((id: string) => id !== instanceId);
      VLMSound.instances[instanceId].delete();
    };

    addInstance: CallableFunction = (instanceId: string) => {
      log(VLMSound.instances[instanceId])
      VLMSound.instances[instanceId].add();
    };

    updateParent: CallableFunction = (parent: string) => {
      try {
        this.instanceIds.forEach((instanceId: string) => {
          if (VLMSound.instances[instanceId].parent === this.parent) {
            VLMSound.instances[instanceId].updateParent(parent);
          }
        });
        this.parent = parent;
      } catch (error) {
        throw error;
      }
    };

    updateCustomId: CallableFunction = (customId: string) => {
      try {
        if (this.customId && VLMSound.configs[this.customId]) {
          delete VLMSound.configs[this.customId];
        }
        VLMSound.configs[customId] = VLMSound.configs[this.sk];
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
          this.showAll();
        }
      } catch (error) {
        throw error;
      }
    };

    updateVolume: CallableFunction = (volume: number) => {
      try {
        this.volume = volume;
        if (this.audioClip) {
          this.audioClip.volume = volume;
        }
        if (this.audioStream) {
          this.audioStream.volume = volume;
        }
      } catch (error) {
        throw error;
      }
    };

    updateSource: CallableFunction = (src: string) => {
      try {
        const objThis = this;
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
      } catch (error) {
        throw error;
      }
    };

    updateSourceType: CallableFunction = (type: SourceType) => {
      try {
        this.sourceType = type;
        if (type === SourceType.LOOP) {
          this.loop = true;
        } else {
          this.loop = false;
        }

        this.updateSource();
      } catch (error) {
        throw error;
      }
    };

    toggleLocators: CallableFunction = () => {
      try {
        log("VLM - Toggle Locators")
        if (this.sourceType === SourceType.STREAM) {
          return;
        }
        if (this.showLocators) {
          this.showLocators = false;
          Object.keys(instances).forEach((id: string) => {
            VLMSound.instances[id].removeComponent(SphereShape);
            this.locatorSystem.destroy();
          });
        } else {
          this.showLocators = true;
          Object.keys(instances).forEach((id: string) => {
            const material = new Material();
            material.emissiveColor = Color3.White();
            material.emissiveIntensity = 3;
            VLMSound.instances[id].addComponentOrReplace(material);
            VLMSound.instances[id].addComponentOrReplace(new SphereShape());
            VLMSound.instances[id].getComponent(Transform).scale.setAll(0.1);
            this.locatorSystem = new SoundLocatorSystem(this)
          });
        }
      } catch (error) {
        throw error;
      }
    };

    updatePlaylist: CallableFunction = (playlist: string[] | any) => { };

    start: CallableFunction = () => { };

    startLive: CallableFunction = () => { };

    startPlaylist: CallableFunction = () => { };

    playNextClip: CallableFunction = () => { };

    stop: CallableFunction = () => { };
  }

  export class VLMConfig extends DCLConfig {
    audioSrc: string;
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
      this.init(config, instance);
    }

    init: CallableFunction = (config: DCLConfig, instance: VLMInstanceConfig) => {
      try {
        this.sk = instance?.sk;
        this.enabled = instance?.enabled && config.enabled;
        this.parent = instance?.parent || config.parent;
        this.position = instance?.position;
        this.scale = instance?.scale;
        this.rotation = instance?.rotation;
        this.volume = instance?.volume;
        this.loop = config?.sourceType === SourceType.LOOP;
        this.configId = config?.sk;

        if (config?.audioClip && config?.sourceType === SourceType.CLIP) {
          const source = new AudioSource(config.audioClip);
          this.addComponentOrReplace(source);
          source.loop = false;
          source.volume = this.volume;
          source.playOnce();
        } else if (config.audioStream && config.sourceType === SourceType.STREAM) {
          const source = config.audioStream;
          this.addComponentOrReplace(source);
          source.volume = this.volume;
        } else if (config.sourceType === SourceType.LOOP) {
          const source = new AudioSource(config.audioClip);
          this.addComponentOrReplace(source);
          source.loop = true;
          source.volume = this.volume;
          source.playing = this.enabled;
        }

        VLMSound.instances[this.sk] = this;

        if (config.sourceType < SourceType.STREAM) {
          this.updateTransform(this.position, this.scale, this.rotation);
        }
        if (this.enabled) {
          this.add();
        }
      } catch (e) {
        throw e;
      }
    };

    add: CallableFunction = () => {
      try {

        const parent = this.parent || VLMSound.configs[this.configId].parent;
        if (parent) {
          this.updateParent(parent);
        } else if (VLMSound.configs[this.configId]?.enabled && this.enabled && !this.isAddedToEngine()) {
          engine.addEntity(this);
        }
      } catch (error) {
        throw error;
      }
    };

    delete: CallableFunction = () => {
      try {
        delete VLMSound.instances[this.sk];
        if (this.customId) {
          delete VLMSound.instances[this.customId];
        }
        this.remove();
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

    updateParent: CallableFunction = (parent: string) => {
      try {
        if (parent) {
          this.parent = parent;
          const instanceParent = getEntityByName(parent);
          this.setParent(instanceParent);
        } else {
          this.setParent(null);
        }
      } catch (error) {
        throw error;
      }
    };

    updateCustomId: CallableFunction = (customId: string) => {
      try {
        if (this.customId && VLMSound.instances[this.customId]) {
          delete VLMSound.instances[this.customId];
        }
        VLMSound.instances[customId] = VLMSound.instances[this.sk];
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
    }

    updateTransform: CallableFunction = (position?: SimpleTransform, scale?: SimpleTransform, rotation?: SimpleTransform) => {
      try {
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
      } catch (error) {
        throw error;
      }
    }
  }

  export class VLMInstanceConfig extends DCLInstanceConfig { }

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
      try {
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
      } catch (error) {
        throw error;
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
      Object.keys(instances).forEach((id: string) => {
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

    checkStreamStatus: CallableFunction = async () => { };

    setLiveState: CallableFunction = (liveState: boolean) => { };
  }

  export class SoundLocatorSystem implements ISystem {
    config: DCLConfig;
    constructor(config: DCLConfig) {
      this.config = VLMSound.configs[config.sk];
      engine.addSystem(this);
    }
    destroy() {
      engine.removeSystem(this);
    }
    update() {
      // pulse scale of this config's instances
      this.config.instanceIds.forEach((id: string) => {
        const instance = VLMSound.instances[id];
        const transform = instance.getComponent(Transform);
        const scale = transform.scale;

        // Time variables
        const time = Date.now() / 1000;
        const pulseDuration = 1; // e.g., 2 seconds for one pulse
        const pauseDuration = 2; // e.g., 2 seconds pause between pulses
        const cycleDuration = pulseDuration + pauseDuration;

        let newScale;
        if (time % cycleDuration < pulseDuration) {
          // This will produce a slow pulse that starts and ends at the same size
          newScale = 0.25 * Math.sin(Math.PI * (time % pulseDuration) / pulseDuration) + 0.15;
        } else {
          // This will introduce a pause after the pulse
          newScale = 0.15; // The starting and ending size of the pulse
        }

        scale.set(newScale, newScale, newScale);
      });
    }
  }
}
