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
    customId: string;
    name: string;
    show: boolean;
    parent: string;
    position: TTransform;
    scale: TTransform;
    rotation: TTransform;
    clickEvent: TClickEvent;
  };
  