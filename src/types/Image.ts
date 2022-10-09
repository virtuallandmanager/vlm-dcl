import { TClickEvent } from "./ClickEvent";
import { TEntityInstanceConfig, TEntityMaterialConfig } from "./Entity";
import { TTransform } from "./Transform";

export type TImageMaterialConfig = TEntityMaterialConfig & {
  id: string;
  customId?: string;
  customRendering?: boolean;
  clickEvent?: TClickEvent;
  emission: number;
  imageLink: string;
  instances: TImageInstanceConfig[];
  parent?: string;
  show: boolean;
  withCollisions: boolean;
  isTransparent: boolean;
};

export type TImageInstanceConfig = TEntityInstanceConfig & {
  id: string;
  customId?: string;
  customRendering?: boolean;
  clickEvent?: TClickEvent;
  name: string;
  parent?: string;
  position: TTransform;
  rotation: TTransform;
  scale: TTransform;
  show: boolean;
  withCollisions: boolean;
};
