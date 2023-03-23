import { TClickEvent } from "./ClickEvent";

export enum EVideoSourceTypes {
  LIVE,
  PLAYLIST,
  IMAGE,
  NONE
}

export interface TVideoMaterialConfig {
  id: string;
  customId?: string;
  customRendering?: boolean;
  clickEvent?: TClickEvent
  emission: number;
  enableLiveStream: boolean;
  instances: TVideoInstanceConfig[];
  liveLink?: string;
  name: string;
  offType: EVideoSourceTypes;
  offImageLink: string;
  parent?: string;
  playlist: string[];
  show: boolean;
  volume: number;
  withCollisions: boolean;
};

export type TVideoInstanceConfig = {
  id: string;
  customId?: string;
  customRendering?: boolean;
  parent?: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  show: boolean;
  withCollisions: boolean;
};