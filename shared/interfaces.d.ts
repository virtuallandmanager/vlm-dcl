import { Vector3 } from "@dcl/sdk/math";
import { Room, Client } from "colyseus.js";
export interface Transformable {
    parent?: string;
    position: Vector3;
    scale: Vector3;
    rotation: Vector3;
    updateParent: CallableFunction;
}
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
export declare class ColyseusClient extends Client {
    constructor(url: string);
}
export declare class ColyseusRoom extends Room {
    constructor(name: string);
}
