import { VLMNFT } from "../components/VLMNFT.component";

export abstract class VLMNFTManager {
  static configs: { [uuid: string]: VLMNFT.DCLConfig } = {};
  static instances: { [uuid: string]: VLMNFT.DCLInstanceConfig } = {};

  static init: CallableFunction = (nftFrames: VLMNFT.DCLConfig[]) => {
    try {
      if (!nftFrames) {
        return;
      }
      nftFrames.forEach((nftFrame: VLMNFT.DCLConfig) => {
        this.create(nftFrame);
      });
    } catch (error) {
      log(error);
      throw error;
    }
  };

  static create: CallableFunction = (nftConfig: VLMNFT.VLMConfig) => {
    try {
      log('VLM: Creating NFT Frame')
      if (!nftConfig.enabled) {
        return;
      }
      new VLMNFT.DCLConfig(nftConfig);
    } catch (error) {
      log(error);
      throw error;
    }
  };

  static createInstance: CallableFunction = (shape: VLMNFT.DCLConfig, instance: VLMNFT.VLMInstanceConfig) => {
    if (!instance || !shape.enabled || !instance.enabled || !shape.sk) {
      return;
    }

    const nftId: string = shape.sk;
    VLMNFT.configs[nftId].createInstance(instance);
  };

  static update: CallableFunction = (nftConfig: VLMNFT.VLMConfig | any, property: string, id: string) => {
    const nft: VLMNFT.DCLConfig = VLMNFT.configs[nftConfig.sk];

    if (!nftConfig || (!nft && !nftConfig.enabled)) {
      return;
    } else if (!nft && nftConfig.enabled) {
      new VLMNFT.DCLConfig(nftConfig);
    }

    switch (property) {
      case "enabled":
        if (!nftConfig.enabled) {
          this.remove(nftConfig.sk);
        } else if (nft) {
          this.add(nftConfig.sk);
        }
        break;
      case "nftData":
        nft.updateNft(nftConfig);
        break;
      case "parent":
        nft.updateParent(nftConfig.parent);
        break;
      case "customId":
        nft.updateCustomId(nftConfig.customId);
        break;
    }
  };

  static updateInstance: CallableFunction = (instanceConfig: VLMNFT.VLMInstanceConfig, property: string, id: string) => {
    const instance = VLMNFT.instances[id],
      configId = instance.configId,
      material = VLMNFT.configs[configId];

    if (!material) {
      return;
    } else if (!instance && instanceConfig.enabled) {
      material.createInstance(instanceConfig);
    }

    const { position, scale, rotation } = instanceConfig;

    switch (property) {
      case "enabled":
        if (!material.enabled || !instanceConfig.enabled) {
          material.removeInstance(instanceConfig.sk);
        } else if (instance && instanceConfig.enabled) {
          material.addInstance(instanceConfig.sk);
        }
        break;
      case "transform":
        instance.updateTransform(position, scale, rotation);
        break;
      case "collider":
        instance.updateCollider(instanceConfig.withCollisions);
        break;
      case "customId":
        instance.updateCustomId(instanceConfig.customId);
        break;
    }
  };

  static add: CallableFunction = (id: string) => {
    VLMNFT.configs[id].showAll();
  };

  static delete: CallableFunction = (id: string) => {
    VLMNFT.configs[id].delete();
  };

  static remove: CallableFunction = (id: string) => {
    VLMNFT.configs[id].remove();
  };

  static removeInstance: CallableFunction = (instanceId: string) => {
    const shapeId = VLMNFT.instances[instanceId].configId;
    VLMNFT.configs[shapeId].removeInstance(instanceId);
  };

  static deleteInstance: CallableFunction = (instanceId: string) => {
    const shapeId = VLMNFT.instances[instanceId].configId;
    VLMNFT.configs[shapeId].deleteInstance(instanceId);
  };
}
