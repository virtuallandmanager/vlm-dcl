import { getEntityByName } from "../shared/entity";
import { VLMBase } from "./VLMBaseConfig.component";
import { SimpleTransform, Transformable } from "../shared/interfaces";

export namespace VLMNFT {
  export const configs: { [uuid: string]: DCLConfig } = {};
  export const instances: { [uuid: string]: DCLInstanceConfig } = {};

  export class DCLConfig extends VLMBase.MaterialConfig {
    sk: string;
    customId?: string;
    parent?: string;
    enabled: boolean;
    instanceIds: string[] | any = [];
    chain: number | string = 1;
    contractAddress: string;
    tokenId: number | string;
    withCollisions: boolean;
    nftLink: string;
    color?: Color3 | string;
    style: PictureFrameStyle;

    constructor(config: VLMConfig) {
      super(config);
      this.chain = this.getChainName(config.chain);
      this.nftLink = `${this.chain}://${config.contractAddress}/${config.tokenId}`;
      if (config.color) {
        this.color = Color3.FromHexString(config.color);
      }
      this.style = config.style || PictureFrameStyle.Classic;

      this.sk = config.sk;
      this.customId = config.customId;
      this.contractAddress = config.contractAddress;
      this.withCollisions = config.withCollisions || false;
      this.tokenId = config.tokenId || 0;
      this.enabled = config.enabled || true;
      configs[this.sk] = this;

      if (this.customId) {
        configs[this.customId] = configs[this.sk];
      }

      if (config.instances) {
        config.instances.forEach((instance: VLMInstanceConfig) => {
          this.createInstance(instance);
        });
      }
    }

    updateNft: CallableFunction = (nftConfig: VLMConfig) => {
      let chain = this.getChainName(nftConfig.chain);
      this.chain = nftConfig.chain || this.chain;
      this.contractAddress = nftConfig.contractAddress;
      this.tokenId = nftConfig.tokenId || 0;
      this.nftLink = `${chain}://${nftConfig.contractAddress}/${nftConfig.tokenId}`;
      if (nftConfig.color) {
        this.color = Color3.FromHexString(nftConfig.color);
      }
      this.style = nftConfig.style || PictureFrameStyle.Classic;

      [...this.instanceIds].forEach((instanceId: string) => {
        const instance = instances[instanceId];
        const newShape = new NFTShape(this.nftLink, {
          color: this.color as Color3,
          style: this.style,
        });
        newShape.withCollisions = instance.withCollisions;
        instance.addComponentOrReplace(newShape);
      });
    };

    getChainName: CallableFunction = (chain: number | string) => {
      switch (Number(chain)) {
        case 1:
          return "ethereum";
        case 137:
          return "polygon";
        default:
          return "ethereum";
      }
    };

    // deletes the material record AND removes the instances from the engine
    delete: CallableFunction = () => {
      delete configs[this.sk];
      [...this.instanceIds].forEach((instanceId: string) => {
        instances[instanceId].delete();
      });
    };

    // just removes the instances from the engine, keeps the material record and instance records so we can bring stuff back
    remove: CallableFunction = () => {
      [...this.instanceIds].forEach((instanceId: string) => {
        instances[instanceId].remove();
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

    createInstance: CallableFunction = (config: VLMInstanceConfig) => {
      this.instanceIds.push(config.sk);
      instances[config.sk] = new DCLInstanceConfig(this, config);
      if (config.customId) {
        instances[config.customId] = instances[config.sk];
      }
      instances[config.sk].add();
    };

    deleteInstance: CallableFunction = (instanceId: string) => {
      this.instanceIds = this.instanceIds.filter((id: string) => id !== instanceId);
      instances[instanceId].delete();
    };

    removeInstance: CallableFunction = (instanceId: string) => {
      instances[instanceId].remove();
    };

    addInstance: CallableFunction = (instanceId: string) => {
      instances[instanceId].add();
    };
  }
  export class VLMConfig extends DCLConfig {
    instances: VLMInstanceConfig[];
    color?: string;

    constructor(config: VLMConfig) {
      super(config);
      this.instances = config.instances || [];
      this.color = config.color;
    }
  }

  export class DCLInstanceConfig extends VLMBase.Instance implements Transformable {
    sk: string;
    customId?: string;
    configId: string;
    parent?: string;
    enabled: boolean;
    position: SimpleTransform;
    scale: SimpleTransform;
    rotation: SimpleTransform;
    withCollisions: boolean;
    config: DCLConfig;

    constructor(config: DCLConfig, instance: VLMInstanceConfig) {
      let color = config.color;
      let style = config.style;
      const shape = new NFTShape(config.nftLink, { color: color as Color3, style });
      super(config, instance);
      this.sk = instance.sk;
      this.customId = instance.customId;
      this.parent = instance.parent;
      this.config = config;
      this.position = instance.position;
      this.scale = instance.scale;
      this.rotation = instance.rotation;
      this.configId = config.sk;
      this.enabled = config.enabled || instance.enabled;
      this.withCollisions = typeof instance.withCollisions === "boolean" ? instance.withCollisions : config.withCollisions;
      this.addComponentOrReplace(shape);
      this.updateTransform(this.position, this.scale, this.rotation);

      if (this.parent && this.enabled) {
        this.updateParent(this.parent);
      } else if (this.enabled) {
        this.add();
      }
    }

    add: CallableFunction = () => {
      engine.addEntity(this);
    };

    delete: CallableFunction = () => {
      delete instances[this.sk];
      if (this.customId) {
        delete instances[this.customId];
      }
      engine.removeEntity(this);
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

    updateTransform: CallableFunction = (position: SimpleTransform, scale: SimpleTransform, rotation: SimpleTransform) => {
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
      const newShape = new NFTShape(this.config.nftLink, {
        color: this.config.color as Color3,
        style: this.config.style,
      });
      newShape.withCollisions = this.withCollisions;
      configs[this.configId].withCollisions = this.withCollisions;
      this.addComponentOrReplace(newShape);
    };
  }
  export class VLMInstanceConfig extends DCLInstanceConfig {}
}
