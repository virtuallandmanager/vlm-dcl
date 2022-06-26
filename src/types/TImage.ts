import { TClickEvent } from "./TClickEvent";
import { TImageInstance } from "./TImageInstance";

export type TImage = {
  id: string;
  customId: string;
  name: string;
  show: boolean;
  parent: string;
  imageLink: string;
  visibility: boolean;
  instances: Array<TImageInstance>;
  clickEvent: TClickEvent;
  height: number;
  width: number;
};
