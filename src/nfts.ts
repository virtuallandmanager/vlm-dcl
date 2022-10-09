import { StoredNFTConfig } from "./classes/index";
import { nftInstances, nftConfigs } from "./storage";
import { TNFTInstanceConfig, TNFTConfig } from "./types/index";

export const initNfts = (nftScreens: Array<TNFTConfig>) => {
  nftScreens.forEach((nftScreen: TNFTConfig) => {
    createNft(nftScreen);
  });
};

export const createNft = (nftConfig: TNFTConfig) => {
  if (!nftConfig.show) {
    return;
  }
  new StoredNFTConfig(nftConfig);
};

export const createNftInstance = (shape: TNFTConfig, instance: TNFTInstanceConfig) => {
  if (!shape.show || !instance.show) {
    return;
  }
  const nftId = shape.id;
  nftConfigs[nftId].createInstance(instance);
};

export const updateNft = (nftConfig: TNFTConfig | any, property: string, id: string) => {
  const nft: StoredNFTConfig = nftConfigs[nftConfig.id];

  if (!nftConfig || (!nft && !nftConfig.show)) {
    return;
  } else if (!nft && nftConfig.show) {
    new StoredNFTConfig(nftConfig);
  }

  switch (property) {
    case "visibility":
      if (!nftConfig.show) {
        removeNft(nftConfig.id);
      } else if (nft) {
        addNft(nftConfig.id);
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

export const updateNftInstance = (instanceConfig: TNFTInstanceConfig, property: string, id: string) => {
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

export const addNft = (id: string) => {
  nftConfigs[id].showAll();
};

export const deleteNft = (id: string) => {
  nftConfigs[id].delete();
};

export const removeNft = (id: string) => {
  nftConfigs[id].remove();
};

export const removeNftInstance = (instanceId: string) => {
  const shapeId = nftInstances[instanceId].configId;
  nftConfigs[shapeId].removeInstance(instanceId);
};

export const deleteNftInstance = (instanceId: string) => {
  const shapeId = nftInstances[instanceId].configId;
  nftConfigs[shapeId].deleteInstance(instanceId);
};
