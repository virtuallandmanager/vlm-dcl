import { TClickEvent } from "./ClickEvent";
import { TTransform } from "./Transform";

export type TEntityMaterialConfig = {
  id?: string;
  customId?: string;
  customRendering?: boolean;
  clickEvent?: TClickEvent;
  emission?: number;
  parent?: string;
  show?: boolean;
};

export type TEntityInstanceConfig = {
  id: string;
  customId?: string;
  clickEvent?: TClickEvent;
  hasCollider?: boolean;
  name: string;
  parent?: string;
  position: TTransform;
  rotation: TTransform;
  scale: TTransform;
  show: boolean;
};
