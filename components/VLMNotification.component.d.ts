export declare namespace VLMNotification {
    class Message {
        opacity: number;
        visible: boolean;
        constructor(_value: string, _messageOptions?: MessageOptions);
    }
    type MessageOptions = {
        color: string;
        fontSize: number;
        delay: number;
    };
}
