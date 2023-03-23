import { VLM } from "src/app";

export type TMessageOptions = {
  color: string;
  fontSize: number;
};

enum EMessageState {
  HIDDEN,
  FADING_IN,
  FADING_OUT,
  VISIBLE,
}

export class UIMessageSystem implements ISystem {
  static messageText: VLMMessage;
  static timer: number = 0;
  static state: EMessageState;

  static createAndAddToEngine() {
    engine.addSystem(new UIMessageSystem());
  }

  static update(dt: number) {
    if (this.state == EMessageState.FADING_IN) {
      this.messageText.opacity += dt;
    }

    if (this.timer < 3) {
      this.timer += dt;
      return;
    } else {
      this.timer = 0;
    }

    if (this.messageText) {
      this.messageText.visible = false;
    }
  }

  static show: CallableFunction = (
    value: string,
    messageOptions: TMessageOptions
  ) => {
    if (!this.messageText) {
      this.timer = 0;
      this.messageText = new VLMMessage(value, messageOptions);
    } else {
      this.messageText.visible = false;
      this.messageText = new VLMMessage(value, messageOptions);
    }
  };

  private static fadeIn: CallableFunction = () => {
    this.state = EMessageState.FADING_IN;
  };

  private static fadeOut: CallableFunction = () => {
    this.state = EMessageState.FADING_OUT;
  };
}

class VLMMessage extends UIText {
  vAlign: string = "center";
  hAlign: string = "center";
  fontSize: number;
  color: Color4 = Color4.White();
  outlineColor: Color4 = Color4.Black();
  outlineWidth: number = 0.125;
  adaptWidth: boolean = true;
  adaptHeight: boolean = true;
  static visible = true;

  constructor(_value: string, _messageOptions: TMessageOptions) {
    super(VLM.uiCanvas);
    this.init(_value, _messageOptions);
  }

  init: CallableFunction = (
    _value: string,
    _messageOptions: TMessageOptions
  ) => {
    const { color, fontSize } = _messageOptions;
    this.value = _value;
    this.fontSize = fontSize || 16;
    if (!color) {
      return;
    }
    switch (color.toLowerCase()) {
      case "black":
        this.color = Color4.Black();
        this.outlineColor = Color4.White();
        break;
      case "blue":
        this.color = Color4.Blue();
        break;
      case "gray":
        this.color = Color4.Gray();
        break;
      case "green":
        this.color = Color4.Green();
        break;
      case "magenta":
        this.color = Color4.Magenta();
        break;
      case "purple":
        this.color = Color4.Purple();
        break;
      case "red":
        this.color = Color4.Red();
        break;
      case "teal":
        this.color = Color4.Teal();
        break;
      case "yellow":
        this.color = Color4.Yellow();
        break;
      default:
        this.color = Color4.White();
    }
  };
}
