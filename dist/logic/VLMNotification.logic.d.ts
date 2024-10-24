import { VLMNotification } from '../components/VLMNotification.component';
import { UiComponent } from '@dcl/sdk/react-ecs';
import { SystemFn } from '@dcl/sdk/ecs';
declare enum EMessageState {
    HIDDEN = "HIDDEN",
    FADING_IN = "FADING_IN",
    FADING_OUT = "FADING_OUT",
    VISIBLE = "VISIBLE"
}
export declare abstract class VLMNotificationManager {
    static messageQueue: VLMNotification.Message[];
    static initialized: boolean;
    static uiComponent: UiComponent;
    static timer: number;
    static state: EMessageState;
    static delay: number;
    static fadeSpeed: number;
    static update: SystemFn;
    static init: CallableFunction;
    static addMessage: CallableFunction;
    static render: CallableFunction;
    static removeMessage: CallableFunction;
    private static fadeIn;
    private static fadeOut;
}
export {};
//# sourceMappingURL=VLMNotification.logic.d.ts.map