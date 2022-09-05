import { TClickEvent } from "./ClickEvent";
import { TTransform } from "./Transform";

export type TEntityMaterialConfig = {
    id: string;
    customId?: string;
    parent?: string;
    customRendering?: boolean;
    clickEvent?: TClickEvent;
    show: boolean;
    emission: number;
  };
  
  export type TEntityInstanceConfig = {
    id: string;
    name: string;
    show: boolean;
    position: TTransform;
    scale: TTransform;
    rotation: TTransform;
    parent?: string;
    customId?: string;
    clickEvent?: TClickEvent;
  };
  