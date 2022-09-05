import { TTransform } from "../types/Transform";

export interface ITexture {
  videoTexture?: VideoTexture;
  imageTexture?: Texture;
  updateTexture: CallableFunction;
}

export interface ITransform {
  parent?: string;
  position: TTransform;
  scale: TTransform;
  rotation: TTransform;
  updateTransform: CallableFunction;
  updateParent: CallableFunction;
}

export interface IEmission {
  emissiveIntensity: number;
  updateBrightness: CallableFunction;
}