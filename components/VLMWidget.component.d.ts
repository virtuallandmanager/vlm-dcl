export declare namespace VLMWidget {
    const configs: {
        [uuid: string]: VLMWidget.Config;
    };
    class Config {
        sk?: string;
        id: string;
        type?: ControlType;
        value?: string | number | boolean;
        user?: {
            connectedWallet: string;
            displayName: string;
        };
        order?: number;
        init?: (config: Config) => void;
        delete?: (config: Config) => void;
        update: (config: Config) => void;
        constructor(config: Config);
    }
    class VLMConfig extends Config {
    }
    enum ControlType {
        NONE = 0,
        TOGGLE = 1,
        TEXT = 2,
        SELECTOR = 3,
        DATETIME = 4,
        TRIGGER = 5,
        SLIDER = 6
    }
}
