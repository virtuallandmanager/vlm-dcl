///<reference lib="es2015.symbol" />
///<reference lib="es2015.symbol.wellknown" />
///<reference lib="es2015.collection" />
///<reference lib="es2015.iterable" />
import { Room, Client } from "colyseus.js";

export type SimpleTransform = {
  x: number;
  y: number;
  z: number;
};

export interface Transformable {
  parent?: string;
  position: SimpleTransform;
  scale: SimpleTransform;
  rotation: SimpleTransform;
  updateParent: CallableFunction;
}

interface HasTexture {
  texture?: Texture;
  updateTexture: CallableFunction;
}

export interface HasVideoTexture extends HasTexture {
  videoTexture?: VideoTexture;
}

export interface HasImageTexture extends HasTexture {
  imageTexture?: Texture;
}

export interface HasHybridTexture extends HasVideoTexture, HasImageTexture {}

export interface Emissive {
  emissiveIntensity?: number;
  emission?: number;
}

export interface Audible {
  volume: number;
  updateVolume: CallableFunction;
}
export interface HasPlaylist {
  playlist: string[];
  startPlaylist: CallableFunction;
  updatePlaylist: CallableFunction;
}

export interface Playable {
  start: CallableFunction;
  pause?: CallableFunction;
  stop: CallableFunction;
}

export class ColyseusClient extends Client {
  constructor(url: string) {
    super(url);
  }
}

export class ColyseusRoom extends Room {
  constructor(name: string) {
    super(name);
  }
}
