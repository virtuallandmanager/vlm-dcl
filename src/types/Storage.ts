import {
  StoredEntityInstance,
  StoredEntityMaterial,
  StoredImageInstance,
  StoredImageMaterial,
  StoredNFTInstance,
  StoredNFTConfig,
  StoredVideoCheckSystem,
  StoredVideoInstance,
  StoredVideoMaterial
} from "../classes/index";

export type TEntityMaterialStorage = {
  [id: string]: StoredEntityMaterial;
};

export type TEntityInstanceStorage = {
  [id: string]: StoredEntityInstance;
};

export type TImageMaterialStorage = {
  [id: string]: StoredImageMaterial;
};

export type TImageInstanceStorage = {
  [id: string]: StoredImageInstance;
};

export type TVideoMaterialStorage = {
  [id: string]: StoredVideoMaterial;
};

export type TVideoInstanceStorage = {
  [id: string]: StoredVideoInstance;
};

export type TVideoSystemStorage = {
  [id: string]: StoredVideoCheckSystem;
};

export type TNFTConfigStorage = {
  [id: string]: StoredNFTConfig;
};


export type TNFTInstanceStorage = {
  [id: string]: StoredNFTInstance;
};

