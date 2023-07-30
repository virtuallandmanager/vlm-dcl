import { getEntityByName } from "../shared/entity";
import { VLMClickEvent } from "./VLMClickEvent.component";
import { SimpleTransform, Transformable } from "../shared/interfaces";

export namespace VLMBase {
  export class MaterialConfig extends Material {
    sk?: string;
    enabled?: boolean;
    name?: string;
    customId?: string;
    parent?: string;
    clickEvent?: VLMClickEvent.DCLConfig;
    customRendering?: boolean;

    constructor(config: MaterialConfig) {
      super();
      this.sk = config.sk;
      this.customId = config.customId;
      this.parent = config.parent;
      this.enabled = config.enabled || true;
      this.clickEvent = config.clickEvent;
    }
  }

  export class NFTConfig extends NFTShape {
    sk: string;
    enabled: boolean;
    name: string;
    contractAddress?: string;
    tokenId?: string;
    customId?: string;
    parent?: string;
    clickEvent?: VLMClickEvent.DCLConfig;
    customRendering?: boolean;

    constructor(config: NFTConfig) {
      const src = `ethereum://${config.contractAddress}/${config.tokenId}`;
      super(src);
      this.sk = config.sk;
      this.customId = config.customId;
      this.name = config.name;
      this.parent = config.parent;
      this.enabled = config.enabled || true;
      this.clickEvent = config.clickEvent;
    }
  }

  export class AudioConfig extends AudioSource {
    sk: string;
    enabled: boolean;
    name: string;
    customId?: string;
    liveStreamUrl?: string;
    parent?: string;
    clickEvent?: VLMClickEvent.DCLConfig;
    customRendering?: boolean;

    constructor(config: AudioConfig) {
      super(new AudioClip(""));
      this.sk = config.sk;
      this.customId = config.customId;
      this.parent = config.parent;
      this.name = config.name;
      this.enabled = config.enabled || true;
      this.clickEvent = config.clickEvent;
    }
  }

  export class Instance extends Entity implements Transformable {
    sk: string;
    enabled?: boolean;
    name?: string;
    customId?: string;
    customRendering?: boolean;
    configId: string;
    parent?: string;
    clickEvent?: VLMClickEvent.DCLConfig;
    defaultClickEvent?: VLMClickEvent.DCLConfig;
    position: SimpleTransform;
    rotation: SimpleTransform;
    scale: SimpleTransform;

    constructor(config: MaterialConfig | AudioConfig, instance: Instance) {
      const id = instance.sk;
      super(`${instance.name} - ${id}`);
      this.sk = id;
      this.name = instance.name;
      this.enabled = config.enabled || instance.enabled;
      this.customId = instance.customId;
      this.clickEvent = instance.clickEvent;
      this.defaultClickEvent = config.clickEvent;
      this.customRendering = instance.customRendering;
      this.configId = instance.configId;
      this.parent = instance.parent;
      this.position = instance.position;
      this.rotation = instance.rotation;
      this.scale = instance.scale;
    }

    updateParent: CallableFunction = (parent: string) => {
      if (parent) {
        this.parent = parent;
        const instanceParent = getEntityByName(parent);
        this.setParent(instanceParent);
      } else {
        this.setParent(null);
      }
    };
  }
}
