export namespace VLMWidget {
  export const configs: {
    [uuid: string]: VLMWidget.DCLConfig;
  } = {};

  export class DCLConfig {
    sk?: string;
    id: string;
    type?: ControlType;
    value?: string | number | boolean;
    user?: { connectedWallet: string, displayName: string };
    order?: number;
    init?: (config: DCLConfig) => void;
    delete?: (config: DCLConfig) => void;
    update: (config: DCLConfig) => void;
    constructor(config: DCLConfig) {
      this.sk = config.sk;
      this.id = config.id;
      this.type = config.type;
      this.value = config.value;
      this.user = config.user;
      this.init = config?.init;
      this.delete = config?.delete;
      this.update = config?.update;

      if (!configs[this.id]) {
        configs[this.id] = this;
      }
    }
  }

  export class VLMConfig extends DCLConfig { }

  export enum ControlType {
    NONE,
    TOGGLE,
    TEXT,
    SELECTOR,
    DATETIME,
    TRIGGER,
    SLIDER
  }
}
