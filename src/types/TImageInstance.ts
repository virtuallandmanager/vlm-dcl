import { TClickEvent } from "./TClickEvent";
import { TTransform } from "./TTransform";

export type TImageInstance = {
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
