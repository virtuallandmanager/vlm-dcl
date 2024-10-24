export declare class VLMDebug {
    static debug: boolean;
    static scope: {
        events: boolean;
        moderation: boolean;
        path: boolean;
        session: boolean;
        videos: boolean;
        widgets: boolean;
    };
    static init: (debugConfig: boolean | string[]) => void;
    static log: (...args: any) => void;
    static logInfo: (...args: any) => void;
    static logWidgetInfo: (...args: any) => void;
    static logPlaylistInfo: (...args: any) => void;
    static logVideoInfo: (...args: any) => void;
    static logModeration: (...args: any) => void;
    static logSessionInfo: (...args: any) => void;
    static logPath: (...args: any) => void;
    static logError: (...args: any) => void;
    static logEvent: (...args: any) => void;
}
//# sourceMappingURL=VLMDebug.logic.d.ts.map