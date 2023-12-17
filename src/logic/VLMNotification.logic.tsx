import { VLMNotification } from '../components/VLMNotification.component'
import ReactEcs, { ReactEcsRenderer, UiEntity, UiComponent } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { ecs, ui } from '../environment'
import { SystemFn } from '@dcl/sdk/ecs'
import { VLM } from '../app'
import { VLMDebug } from './VLMDebug.logic'

enum EMessageState {
  HIDDEN = 'HIDDEN',
  FADING_IN = 'FADING_IN',
  FADING_OUT = 'FADING_OUT',
  VISIBLE = 'VISIBLE',
}

export abstract class VLMNotificationManager {
  static messageQueue: VLMNotification.Message[] = [new VLMNotification.Message('Hello World')]
  static uiComponents: UiComponent[] = []
  static initialized: boolean
  static timer: number = 0
  static state: EMessageState = EMessageState.HIDDEN
  static delay: number = 1
  static fadeSpeed: number = 5 // Control the speed of fading

  static update: SystemFn = (dt: number) => {
    if (!this.messageQueue?.length) return

    const currentMessage = this.messageQueue[0]

    // ReactEcsRenderer.setUiRenderer(() => currentMessage.render)

    // switch (this.state) {
    //   case EMessageState.HIDDEN:
    //     this.fadeIn()
    //     break

    //   case EMessageState.VISIBLE:
    //     this.timer += dt
    //     if (this.timer >= this.delay) {
    //       this.fadeOut()
    //     }
    //     break

    //   case EMessageState.FADING_IN:
    //     currentMessage.opacity += this.fadeSpeed * dt
    //     if (currentMessage.opacity >= 1) {
    //       currentMessage.opacity = 1
    //       this.state = EMessageState.VISIBLE
    //       this.timer = 0 // Reset the timer
    //       this.delay = currentMessage.delay || 3
    //     }
    //     break

    //   case EMessageState.FADING_OUT:
    //     currentMessage.opacity -= this.fadeSpeed * dt
    //     if (currentMessage.opacity <= 0) {
    //       currentMessage.opacity = 0
    //       this.removeMessage()
    //       this.state = this.messageQueue.length > 0 ? EMessageState.HIDDEN : EMessageState.HIDDEN
    //     }
    //     break
    // }
  }

  static init: CallableFunction = () => {
    VLMDebug.log('VLMNotificationManager.init()')
    ecs.engine.addSystem(this.update)
    new VLMNotification.Message('Hello World')
    this.initialized = true
    ui.ReactEcsRenderer.setUiRenderer(() => (
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 'auto',
          alignSelf: 'center',
          padding: 20,
        }}
        uiBackground={{
          color: Color4.create(0, 0, 0, 0.5),
        }}
        uiText={{
          value: 'Hello world!',
          fontSize: 18,
        }}
      />
    ))

    ReactEcsRenderer

    ui.ReactEcsRenderer.setUiRenderer(() => (
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 'auto',
          flexDirection: 'column',
          alignSelf: 'flex-start',
          padding: 20,
        }}
        uiBackground={{
          color: Color4.create(0, 0, 0, 0.5),
        }}
        uiText={{
          value: 'Get bent!',
          fontSize: 18,
        }}
      />
    ))
  }

  static addMessage: CallableFunction = (value: string, messageOptions?: VLMNotification.MessageOptions) => {
    if (!this.initialized) this.init()
    const newMessage = new VLMNotification.Message(value, messageOptions)
    this.messageQueue.push(newMessage)
  }

  static removeMessage: CallableFunction = () => {
    const message = this.messageQueue.shift()
    if (message) {
      message.visible = false
    }
  }

  private static fadeIn: CallableFunction = () => {
    this.state = EMessageState.FADING_IN
    this.messageQueue[0].opacity = 0
    this.messageQueue[0].visible = true
  }

  private static fadeOut: CallableFunction = () => {
    this.state = EMessageState.FADING_OUT
  }

  static render: CallableFunction = (): void => {
    ReactEcsRenderer.setUiRenderer(() => this.messageQueue)
  }
}
