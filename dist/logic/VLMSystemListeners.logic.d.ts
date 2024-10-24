import { Room } from 'colyseus.js';
import { VLMSession } from '../components/VLMSession.component';
export declare abstract class VLMEventListeners {
    static inboundMessageFunctions: {
        [uuid: string]: CallableFunction;
    };
    static sceneRoom: Room;
    static sessionData: VLMSession.Config;
    static sessionUser: VLMSession.User;
    static ignoreNextEmote: boolean;
    static ignoredEmote: string | null;
    static init: CallableFunction;
    static sendMessage: CallableFunction;
    static onMessage: CallableFunction;
    static setState: CallableFunction;
    static getState: CallableFunction;
    static setPlayerState: CallableFunction;
    static getPlayerState: CallableFunction;
    static recordAction: CallableFunction;
    static getPlayersInScene: CallableFunction;
    static getUserIdsInScene: CallableFunction;
}
//# sourceMappingURL=VLMSystemListeners.logic.d.ts.map