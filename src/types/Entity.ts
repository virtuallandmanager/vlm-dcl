import { TClickEvent } from "./ClickEvent";
import { TTransform } from "./Transform";

export type TEntity = {
    id: string;
    customId: string;
    clickEvent: TClickEvent;
    show: boolean;
  };
  
  export type TEntityInstance = {
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
  