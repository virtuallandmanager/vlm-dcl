import { Entity } from "@dcl/sdk/ecs";
export declare class TransformService {
    entities: Entity[];
    addEntity: CallableFunction;
    set: CallableFunction;
    setAll: CallableFunction;
}
