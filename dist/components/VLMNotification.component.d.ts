import { Color4 } from '@dcl/sdk/math';
export declare namespace VLMNotification {
    class Message {
        vAlign: string;
        hAlign: string;
        fontSize: number;
        color: Color4;
        delay: number;
        adaptWidth: boolean;
        adaptHeight: boolean;
        opacity: number;
        fadeSpeed: number;
        value: string;
        constructor(_value: string, _messageOptions?: MessageOptions);
        init: CallableFunction;
    }
    type MessageOptions = {
        color?: string;
        fontSize?: number;
        delay?: number;
        fadeSpeed?: number;
    };
}
//# sourceMappingURL=VLMNotification.component.d.ts.map