import { getEntityByName } from "src/shared/entity";
import { VLMClickEvent } from "./VLMClickEvent.component";
import { SimpleTransform, Transformable } from "src/shared/interfaces";

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

    constructor(config?: NFTConfig) {
      const src = `ethereum://${config.contractAddress}/${config.tokenId}`;
      super(src);
      this.sk = config.sk;
      this.customId = config.customId;
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

    constructor(config?: AudioConfig) {
      super(new AudioClip(""));
      this.sk = config.sk;
      this.customId = config.customId;
      this.parent = config.parent;
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

    constructor(config?: MaterialConfig | AudioConfig, _instance?: Instance) {
      const id = _instance.sk;
      super(`${_instance.name} - ${id}`);
      this.sk = id;
      this.name = _instance.name;
      this.enabled = config.enabled || _instance.enabled;
      this.customId = _instance.customId;
      this.clickEvent = _instance.clickEvent;
      this.defaultClickEvent = config.clickEvent;
      this.customRendering = _instance.customRendering;
      this.parent = _instance.parent;
      this.position = _instance.position;
      this.rotation = _instance.rotation;
      this.scale = _instance.scale;
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

    updateTransform: CallableFunction = (position?: SimpleTransform, scale?: SimpleTransform, rotation?: SimpleTransform) => {
      this.addComponentOrReplace(
        new Transform({
          position: new Vector3(position.x, position.y, position.z),
          scale: new Vector3(scale.x, scale.y, scale.z),
          rotation: Quaternion.Euler(rotation.x, rotation.y, rotation.z),
        })
      );
    };
  }
}
