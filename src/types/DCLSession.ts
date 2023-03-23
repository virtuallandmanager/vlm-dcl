import { PathSystem } from "src/systems/pathSystem";
import { TDCLUser } from "./DCLUser";
import Colyseus from "colyseus.js";

export type TDCLSession = {
  sessionUser: TDCLUser;
  client: Colyseus.Client;
  room: Colyseus.Room;
  sessionStart: number;
  sessionEnd: number;
  pathSystem: PathSystem;
  connecting: boolean;
  connected: boolean;
  playerPathId: string;
};

export type TDCLSessionData = {
  pk: string;
  sk: string;
  clientIp: string;
  sessionToken: string;
  sessionStart: number;
  sessionEnd?: number;
  ipData: any;
};
