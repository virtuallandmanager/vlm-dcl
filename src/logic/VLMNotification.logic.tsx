import { VLMNotification } from '../components/VLMNotification.component'
import ReactEcs, { UiComponent, UiEntity, Label } from '@dcl/sdk/react-ecs'
import { ecs } from '../environment'
import { SystemFn } from '@dcl/sdk/ecs'
import { VLMDebug } from './VLMDebug.logic'
import { UIService } from '../services/UI.service'

enum EMessageState {
  HIDDEN = 'HIDDEN',
  FADING_IN = 'FADING_IN',
  FADING_OUT = 'FADING_OUT',
  VISIBLE = 'VISIBLE',
}

export abstract class VLMNotificationManager {
  static messageQueue: VLMNotification.Message[] = []
  public static initialized: boolean
  public static uiComponent: UiComponent = () => <UiEntity></UiEntity>
  static timer: number = 0
  static state: EMessageState = EMessageState.HIDDEN
  static delay: number = 3
  static fadeSpeed: number = 1 // Control the speed of fading

  static update: SystemFn = (dt: number) => {
    if (!this.messageQueue?.length) return

    const currentMessage = this.messageQueue[0]

    switch (this.state) {
      case EMessageState.HIDDEN:
        this.fadeIn()
        break

      case EMessageState.VISIBLE:
        this.timer += dt
        if (this.timer >= this.delay) {
          this.fadeOut()
        }
        break

      case EMessageState.FADING_IN:
        currentMessage.opacity += this.fadeSpeed * dt
        if (currentMessage.opacity >= 1) {
          currentMessage.opacity = 1
          this.state = EMessageState.VISIBLE
          this.timer = 0 // Reset the timer
          this.delay = currentMessage.delay || 3
        }
        break

      case EMessageState.FADING_OUT:
        currentMessage.opacity -= this.fadeSpeed * dt
        if (currentMessage.opacity <= 0) {
          currentMessage.opacity = 0
          this.removeMessage()
          this.state = this.messageQueue.length > 0 ? EMessageState.HIDDEN : EMessageState.HIDDEN
        }
        break
    }
  }

  static init: CallableFunction = () => {
    ecs.engine.addSystem(this.update)
    this.initialized = true
  }

  static addMessage: CallableFunction = (value: string, messageOptions?: VLMNotification.MessageOptions) => {
    if (!this.initialized) this.init()
    VLMDebug.log('VLMNotificationManager.addMessage', value, messageOptions)
    const newMessage = new VLMNotification.Message(value, messageOptions)
    this.messageQueue.push(newMessage)
  }

  static render: CallableFunction = () => {
    const message = this.messageQueue[0]
    this.uiComponent = () => (
      <Label
        key="VLMNotification"
        uiTransform={{
          positionType: 'absolute',
          width: '100%',
          height: 'auto',
          alignSelf: 'center',
          justifyContent: 'center',
        }}
        value={message.value}
        fontSize={message.fontSize}
        color={{ ...message.color, a: message.opacity }}
        textAlign="middle-center"
      />
    )
    UIService.notificationComponent = this.uiComponent
    UIService.render()
  }

  static removeMessage: CallableFunction = () => {
    this.messageQueue.shift()
  }

  private static fadeIn: CallableFunction = () => {
    this.fadeSpeed = this.messageQueue[0].fadeSpeed || 1
    this.timer = 0
    this.state = EMessageState.FADING_IN
    this.messageQueue[0].opacity = 0
    this.render()
  }

  private static fadeOut: CallableFunction = () => {
    this.state = EMessageState.FADING_OUT
  }
}
