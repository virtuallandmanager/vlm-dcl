export namespace VLMNotification {
  export const uiCanvas: UICanvas = new UICanvas();
  export class Message extends UIText {
    vAlign: string = "center";
    hAlign: string = "center";
    fontSize: number = 16;
    color: Color4 = Color4.White();
    delay: number = 5;
    outlineColor: Color4 = Color4.Black();
    outlineWidth: number = 0.125;
    adaptWidth: boolean = true;
    adaptHeight: boolean = true;
    visible = false;

    constructor(_value: string, _messageOptions: MessageOptions) {
      super(uiCanvas);
      this.init(_value, _messageOptions);
    }

    init: CallableFunction = (value: string, messageOptions?: MessageOptions) => {
      const color = messageOptions?.color || "white",
        fontSize = messageOptions?.fontSize;
      this.delay = messageOptions?.delay || this.delay;
      this.value = value;
      this.fontSize = fontSize || this.fontSize;
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
        case "white":
        default:
          this.color = Color4.White();
      }
    };
  }

  export type MessageOptions = {
    color: string;
    fontSize: number;
    delay: number;
  };
}
