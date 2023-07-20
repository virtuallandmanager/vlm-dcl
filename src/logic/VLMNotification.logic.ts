import { VLMNotification } from "../components/VLMNotification.component";

enum EMessageState {
  HIDDEN,
  FADING_IN,
  FADING_OUT,
  VISIBLE,
}

export abstract class VLMNotificationManager implements ISystem {
  static messageQueue: VLMNotification.Message[];
  static initialized: boolean;
  static running: boolean;
  static timer: number = 0;
  static state: EMessageState = EMessageState.HIDDEN;
  static delay: number = 5000;

  static update(dt: number) {
    if (!this.messageQueue.length) {
      return;
    }

    const currentMessage = this.messageQueue[0];

    if (this.state == EMessageState.HIDDEN) {
      this.fadeIn();
      return;
    }

    if (this.state == EMessageState.VISIBLE && this.timer < this.delay) {
      this.timer += dt * 100;
    } else if (this.state == EMessageState.VISIBLE && this.timer >= this.delay) {
      this.fadeOut();
      return;
    }

    if (this.state == EMessageState.FADING_IN && currentMessage.opacity < 1) {
      currentMessage.opacity += dt;
      return;
    } else if (this.state == EMessageState.FADING_IN) {
      this.state = EMessageState.VISIBLE;
    }

    if (this.messageQueue[0]) {
      this.removeMessage();
    }
  }

  static init: CallableFunction = (value: string, messageOptions: VLMNotification.MessageOptions) => {
    engine.addSystem(this);
  };

  static addMessage: CallableFunction = (value: string, messageOptions: VLMNotification.MessageOptions) => {
    const newMessage = new VLMNotification.Message(value, messageOptions);
    this.messageQueue.push(newMessage);
  };

  static removeMessage: CallableFunction = () => {
    this.messageQueue.shift().visible = false;
  };

  private static fadeIn: CallableFunction = (value, messageOptions) => {
    this.state = EMessageState.FADING_IN;
    this.messageQueue[0].opacity = 0;
    this.messageQueue[0].visible = true;
  };

  private static fadeOut: CallableFunction = () => {
    this.state = EMessageState.FADING_OUT;
    this.state = EMessageState.FADING_IN;
    this.messageQueue[0].opacity = 0;
    this.messageQueue[0].visible = true;
  };
}
