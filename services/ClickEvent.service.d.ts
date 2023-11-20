import { Entity } from "@dcl/sdk/ecs";
export declare class ClickEventService {
    entities: Entity[];
    function: CallableFunction;
    addEntity: CallableFunction;
    set: CallableFunction;
    setAll: CallableFunction;
    trackClickEvent: CallableFunction;
}
