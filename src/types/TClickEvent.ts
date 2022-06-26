import { EClickEventType } from "../enums/EClickEventType";
import { TTransform } from "./TTransform";

export type TClickEvent = {
  type: EClickEventType;
  externalLink: string;
  sound: string;
  moveTo: { cameraTarget: TTransform; position: TTransform };
  teleportTo: Array<number>;
  showFeedback: boolean;
  hoverText: string;
};
