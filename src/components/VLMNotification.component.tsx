import { Color4 } from '@dcl/sdk/math'
import { UiCanvasInformation, engine } from '@dcl/sdk/ecs'
import { ecs } from '../environment'

export namespace VLMNotification {
  export class Message {
    vAlign: string = 'center'
    hAlign: string = 'center'
    fontSize: number = 32
    color: Color4 = Color4.White()
    delay: number = 3
    adaptWidth: boolean = true
    adaptHeight: boolean = true
    opacity: number = 0
    fadeSpeed: number = 1
    value: string = ''

    constructor(_value: string, _messageOptions?: MessageOptions) {
      this.init(_value, _messageOptions)
    }

    init: CallableFunction = (value: string, messageOptions?: MessageOptions) => {
      let canvas = ecs.UiCanvasInformation.get(ecs.engine.RootEntity),
        proportionalFontSize = Math.ceil(canvas.width / 50) < 12 ? 12 : Math.ceil(canvas.width / 50)
      const color = messageOptions?.color || 'white',
        fontSize = messageOptions?.fontSize
      this.delay = messageOptions?.delay || this.delay
      this.fadeSpeed = messageOptions?.fadeSpeed || this.fadeSpeed
      this.value = value
      this.fontSize = fontSize || proportionalFontSize
      if (!color) {
        return
      }
      switch (color.toLowerCase()) {
        case 'black':
          this.color = Color4.Black()
          break
        case 'blue':
          this.color = Color4.Blue()
          break
        case 'gray':
          this.color = Color4.Gray()
          break
        case 'green':
          this.color = Color4.Green()
          break
        case 'magenta':
          this.color = Color4.Magenta()
          break
        case 'purple':
          this.color = Color4.Purple()
          break
        case 'red':
          this.color = Color4.Red()
          break
        case 'teal':
          this.color = Color4.Teal()
          break
        case 'yellow':
          this.color = Color4.Yellow()
          break
        case 'white':
        default:
          this.color = Color4.White()
      }
    }
  }

  export type MessageOptions = {
    color?: string
    fontSize?: number
    delay?: number
    fadeSpeed?: number
  }
}
