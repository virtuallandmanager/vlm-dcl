import { TClickEvent } from "./ClickEvent";

export enum EVideoSourceTypes {
  LIVE,
  PLAYLIST,
  IMAGE,
  NONE
}

export type TVideoMaterialConfig = {
  id: string;
  customId?: string;
  parent?: string | null;
  customRendering?: boolean;
  show: boolean;
  emission: number;
  liveLink?: string;
  name: string;
  enableLiveStream: boolean;
  offType: EVideoSourceTypes;
  offImage: string;
  volume: number;
  playlist: string[];
  instances: TVideoInstanceConfig[];
  clickEvent?: TClickEvent
};

export type TVideoInstanceConfig = {
  id: string;
  customId?: string;
  parent?: string | null;
  customRendering?: boolean;
  name: string;
  show: boolean;
  position: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
};