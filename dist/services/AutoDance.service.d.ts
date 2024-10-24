import { Entity } from '@dcl/sdk/ecs';
import { TriggeredEmote } from '../shared/interfaces';
export declare class AutoDanceService {
    static userEnabled: boolean;
    static defaultEmotes: TriggeredEmote[];
    entities: Entity[];
    emotesToTrigger: TriggeredEmote[];
    currentEmoteIndex: number | null;
    interval: number;
    lastTriggered: number;
    addEntity: CallableFunction;
    setup: CallableFunction;
    clear: CallableFunction;
    static toggleGlobalAutoDance: CallableFunction;
    startCheckingDanceFloors: CallableFunction;
    stopCheckingDanceFloors: CallableFunction;
    triggerNextEmote: CallableFunction;
    onDanceFloor: CallableFunction;
    danceFloorCheck: CallableFunction;
}
//# sourceMappingURL=AutoDance.service.d.ts.map