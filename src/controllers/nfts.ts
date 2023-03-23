import { StoredNFTConfig } from "../classes/index";
import { nftInstances, nftConfigs } from "../storage";
import { TNFTInstanceConfig, TNFTConfig } from "../types/index";

export abstract class VLMNFTFrames {
  static init: CallableFunction = (nftFrames: Array<TNFTConfig>) => {
    if (!nftFrames) {
      return;
    }
    nftFrames.forEach((nftFrame: TNFTConfig) => {
      this.create(nftFrame);
    });
  };

  static create: CallableFunction = (nftConfig: TNFTConfig) => {
    if (!nftConfig.show) {
      return;
    }
    new StoredNFTConfig(nftConfig);
  };

  static createInstance: CallableFunction = (
    shape: TNFTConfig,
    instance: TNFTInstanceConfig
  ) => {
    if (!instance || !shape.show || !instance.show || !shape.id) {
      return;
    }

    const nftId: string = shape.id;
    nftConfigs[nftId].createInstance(instance);
  };

  static update: CallableFunction = (
    nftConfig: TNFTConfig | any,
    property: string,
    id: string
  ) => {
    const nft: StoredNFTConfig = nftConfigs[nftConfig.id];

    if (!nftConfig || (!nft && !nftConfig.show)) {
      return;
    } else if (!nft && nftConfig.show) {
      new StoredNFTConfig(nftConfig);
    }

    switch (property) {
      case "visibility":
        if (!nftConfig.show) {
          this.remove(nftConfig.id);
        } else if (nft) {
          this.add(nftConfig.id);
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

  static updateInstance: CallableFunction = (
    instanceConfig: TNFTInstanceConfig,
    property: string,
    id: string
  ) => {
    const instance = nftInstances[id],
      materialId = instance.materialId,
      material = nftConfigs[materialId];

    if (!material) {
      return;
    } else if (!instance && instanceConfig.show) {
      material.createInstance(instanceConfig);
    }

    const { position, scale, rotation } = instanceConfig;

    switch (property) {
      case "visibility":
        if (!material.show || !instanceConfig.show) {
          material.removeInstance(instanceConfig.id);
        } else if (instance && instanceConfig.show) {
          material.addInstance(instanceConfig.id);
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
    nftConfigs[id].showAll();
  };

  static delete: CallableFunction = (id: string) => {
    nftConfigs[id].delete();
  };

  static remove: CallableFunction = (id: string) => {
    nftConfigs[id].remove();
  };

  static removeInstance: CallableFunction = (instanceId: string) => {
    const shapeId = nftInstances[instanceId].configId;
    nftConfigs[shapeId].removeInstance(instanceId);
  };

  static deleteInstance: CallableFunction = (instanceId: string) => {
    const shapeId = nftInstances[instanceId].configId;
    nftConfigs[shapeId].deleteInstance(instanceId);
  };
}
