import { Entity } from "@dcl/sdk/ecs";
export declare class MeshService {
    entities: Entity[];
    addEntity: CallableFunction;
    setPlaneShape: CallableFunction;
    setCylinderShape: CallableFunction;
    setBoxShape: CallableFunction;
    setSphereShape: CallableFunction;
    setGltfShape: CallableFunction;
    setNftShape: CallableFunction;
    setBillboardShape: CallableFunction;
    set: CallableFunction;
    setAll: CallableFunction;
}
