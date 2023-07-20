export namespace VLMWidget {
  export class DCLConfig {
    sk?: string;
    id: string;
    type?: ControlType;
    value?: string | boolean;
    init?: (config: DCLConfig) => void;
    delete?: (config: DCLConfig) => void;
    update: (config: DCLConfig) => void;
    constructor(config: DCLConfig) {
      this.sk = config.sk;
      this.id = config.id;
      this.type = config.type;
      this.value = config.value;
      this.init = config.init;
      this.delete = config.delete;
      this.update = config.update;
    }
  }

  export class VLMConfig extends DCLConfig {}

  export enum ControlType {
    NONE,
    TOGGLE,
    TEXT,
    SELECTOR,
    DATETIME,
    TRIGGER,
  }
}
