import { VLMNotification } from "../components/VLMNotification.component";
declare enum EMessageState {
    HIDDEN = "HIDDEN",
    FADING_IN = "FADING_IN",
    FADING_OUT = "FADING_OUT",
    VISIBLE = "VISIBLE"
}
export declare abstract class VLMNotificationManager {
    static messageQueue: VLMNotification.Message[];
    static initialized: boolean;
    static timer: number;
    static state: EMessageState;
    static delay: number;
    static fadeSpeed: number;
    static update(dt: number): void;
    static init: CallableFunction;
    static addMessage: CallableFunction;
    static removeMessage: CallableFunction;
    private static fadeIn;
    private static fadeOut;
}
export {};
