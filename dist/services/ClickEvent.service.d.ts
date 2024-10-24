import { Entity, EventSystemCallback } from '@dcl/sdk/ecs';
export declare class ClickEventService {
    entities: Entity[];
    functions: {
        [id: number]: EventSystemCallback;
    };
    addEntity: CallableFunction;
    set: CallableFunction;
    setCustomDown: CallableFunction;
    setCustomUp: CallableFunction;
    clearAll: CallableFunction;
    setAll: CallableFunction;
    trackClickEvent: CallableFunction;
}
//# sourceMappingURL=ClickEvent.service.d.ts.map