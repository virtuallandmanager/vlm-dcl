import { VLMImage } from '../components/VLMImage.component'
import { VLMDebug } from './VLMDebug.logic'

export abstract class VLMImageManager {
  static init: CallableFunction = (images: VLMImage.VLMConfig[]) => {
    try {
      VLMDebug.log('Initializing Images', images)
      if (!images.length) {
        return
      }
      images.forEach((image: VLMImage.VLMConfig) => {
        const existing = VLMImage.configs[image?.sk]
        if (existing) {
          existing.init()
        } else {
          this.create(image)
        }
      })
    } catch (error) {
      throw error
    }
  }

  static create: CallableFunction = (config: VLMImage.VLMConfig) => {
    try {
      new VLMImage.Config(config)
    } catch (error) {
      throw error
    }
  }

  static createInstance: CallableFunction = (config: VLMImage.VLMConfig, instance: VLMImage.Instance) => {
    try {
      if (!config.enabled || !instance.enabled) {
        return
      }
      const imageId = config.sk
      VLMImage.configs[imageId].createOrReplaceInstance(instance)
    } catch (error) {
      throw error
    }
  }

  static update: CallableFunction = (config: VLMImage.VLMConfig | any, property: string, id: string) => {
    try {
      const storedConfig: VLMImage.Config = VLMImage.configs[config.sk || id]

      if (!config || (!storedConfig && !config.enabled)) {
        return
      } else if (!storedConfig && config.enabled) {
        this.create(config)
        return
      }

      switch (property) {
        case 'enabled':
          storedConfig.enabled = config.enabled
          if (!config.enabled) {
            this.remove(config.sk)
          } else if (storedConfig) {
            this.add(config.sk)
          }
          break
        case 'clickEvent':
          storedConfig.updateDefaultClickEvent(config.clickEvent)
          break
        default:
          storedConfig.init(config)
      }
    } catch (error) {
      throw error
    }
  }

  static updateInstance: CallableFunction = (instanceConfig: VLMImage.Instance, property: string, id: string) => {
    try {
      const instance = VLMImage.instances[instanceConfig.sk],
        configId = instance.configId,
        config = VLMImage.configs[configId]

      if (!config) {
        VLMDebug.log(
          'error',
          `ERROR! - Config not found for instance ${instanceConfig.sk} -\n
        Please send us this error via Discord or by sending an email to support@vlm.gg`,
          '{ Instance config, property, id:',
          instanceConfig,
          property,
          id,
          '}',
        )
        return
      }

      const { position, scale, rotation } = instanceConfig

      switch (property) {
        case 'enabled':
          if (!config.enabled || !instanceConfig.enabled) {
            config.removeInstance(instanceConfig)
          } else if (instance && instanceConfig.enabled) {
            config.createOrReplaceInstance(instanceConfig)
          }
          break
        case 'transform':
          instance.updateTransform(position, scale, rotation)
          break
        case 'clickEvent':
          instance.updateClickEvent(instanceConfig.clickEvent)
          break
        default:
          instance.init(config, instanceConfig)
      }
    } catch (error) {
      throw error
    }
  }

  static add: CallableFunction = (id: string) => {
    VLMImage.configs[id].addAll()
  }

  static delete: CallableFunction = (id: string) => {
    VLMImage.configs[id].delete()
  }

  static remove: CallableFunction = (id: string) => {
    VLMImage.configs[id].remove()
  }

  static removeInstance: CallableFunction = (instanceId: string) => {
    VLMImage.instances[instanceId].remove()
  }

  static deleteInstance: CallableFunction = (instanceId: string) => {
    const instance = VLMImage.instances[instanceId]
    const configId = instance?.configId

    if (configId) {
      VLMImage.configs[configId].deleteInstance(instanceId)
    }
  }
}
