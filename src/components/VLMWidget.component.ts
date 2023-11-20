export namespace VLMWidget {
  export const configs: {
    [uuid: string]: VLMWidget.Config;
  } = {};

  export class Config {
    sk?: string;
    id: string;
    type?: ControlType;
    value?: string | number | boolean;
    user?: { connectedWallet: string, displayName: string };
    order?: number;
    init?: (config: Config) => void;
    delete?: (config: Config) => void;
    update: (config: Config) => void;
    constructor(config: Config) {
      this.sk = config.sk;
      this.id = config.id;
      this.type = config.type;
      this.value = config.value;
      this.user = config.user;
      this.order = config.order;
      this.init = config?.init;
      this.delete = config?.delete;
      this.update = config?.update;

      if (!configs[this.id]) {
        configs[this.id] = this;
      }
    }
  }

  export class VLMConfig extends Config { }

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
