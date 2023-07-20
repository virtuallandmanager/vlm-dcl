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
  updateTransform: CallableFunction;
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
