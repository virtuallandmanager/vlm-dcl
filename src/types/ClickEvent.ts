import { TTransform } from "./Transform";

export enum EClickEventType {
  none,
  externalLink,
  sound,
  moveTo,
  teleportTo
}

export type TClickEvent = {
  type: EClickEventType;
  externalLink: string;
  sound: string;
  moveTo: { cameraTarget: TTransform; position: TTransform };
  teleportTo: Array<number>;
  showFeedback: boolean;
  hoverText: string;
};
