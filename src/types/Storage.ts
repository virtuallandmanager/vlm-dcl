import { StoredVideoCheckSystem, StoredVideoInstance, StoredVideoMaterial } from "../classes/index";
import { TEntityMaterialConfig } from "./Entity";

export type TEntityMaterialStorage = {
  [id: string]: TEntityMaterialConfig;
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
