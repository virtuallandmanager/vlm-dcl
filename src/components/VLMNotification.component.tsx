import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UIService } from '../services/UI.service'

export namespace VLMNotification {
  export class Message {
    vAlign: string = 'center'
    hAlign: string = 'center'
    fontSize: number = 16
    color: Color4 = Color4.White()
    delay: number = 5
    outlineColor: Color4 = Color4.Black()
    outlineWidth: number = 0.125
    adaptWidth: boolean = true
    adaptHeight: boolean = true
    opacity: number = 1
    visible = false
    value: string = ''

    constructor(_value: string, _messageOptions?: MessageOptions) {
      this.init(_value, _messageOptions)
    }

    init: CallableFunction = (value: string, messageOptions?: MessageOptions) => {
      const color = messageOptions?.color || 'white',
        fontSize = messageOptions?.fontSize
      this.delay = messageOptions?.delay || this.delay
      this.value = value
      this.fontSize = fontSize || this.fontSize
      if (!color) {
        return
      }
      switch (color.toLowerCase()) {
        case 'black':
          this.color = Color4.Black()
          this.outlineColor = Color4.White()
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

    render: CallableFunction = () => {
      return (
        <UiEntity
          key={'NotificationMessage'}
          uiTransform={{ width: 80, height: 20 }}
          uiText={{ value: this.value, textAlign: 'middle-center', fontSize: 14, color: this.color }}
        />
      )
    }
  }

  export type MessageOptions = {
    color: string
    fontSize: number
    delay: number
  }
}
