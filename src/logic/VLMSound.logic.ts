import { VLMSound } from '../components/VLMSound.component'

export abstract class VLMSoundManager {
  static init: CallableFunction = (sounds: VLMSound.VLMConfig[]) => {
    if (!sounds) {
      return
    }
    sounds.forEach((sound: VLMSound.VLMConfig) => {
      this.create(sound)
    })
  }

  static create: CallableFunction = (config: VLMSound.VLMConfig) => {
    try {
      new VLMSound.Config(config)
    } catch (error) {
      throw error
    }
  }

  static createInstance: CallableFunction = (source: VLMSound.VLMConfig, instance: VLMSound.Instance) => {
    if (!source?.enabled || !instance?.enabled) {
      return
    }
    const soundId = source.sk
    VLMSound.configs[soundId].createOrReplaceInstance(instance)
  }

  static update: CallableFunction = (config: VLMSound.VLMConfig | any, property: string, id: string) => {
    const storedConfig: VLMSound.Config = VLMSound.configs[config.sk]

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
        } else {
          this.create(config)
        }
        break
      default:
        storedConfig.init(config)
    }
  }

  static updateInstance: CallableFunction = (instanceConfig: VLMSound.Instance, property: string, id: string) => {
    const instance = VLMSound.instances[instanceConfig.sk],
      configId = instance?.configId,
      config = VLMSound.configs[configId]
    if (!config) {
      return
    } else if (!instance && instanceConfig.enabled) {
      config.createOrReplaceInstance(instanceConfig)
    }

    const { position, scale, rotation } = instanceConfig

    switch (property) {
      case 'enabled':
        if (!config.enabled || !instanceConfig.enabled) {
          config.removeInstance(instanceConfig.sk)
        } else if (instance && instanceConfig.enabled) {
          config.createOrReplaceInstance(instanceConfig.sk)
        }
        break
      case 'transform':
        instance.updateTransform(position, scale, rotation)
        break
      default:
        instance.init(instanceConfig)
    }
  }

  static add: CallableFunction = (id: string) => {
    VLMSound.configs[id].addAll()
  }

  static delete: CallableFunction = (id: string) => {
    VLMSound.configs[id].delete()
  }

  static remove: CallableFunction = (id: string) => {
    VLMSound.configs[id].remove()
  }

  static removeInstance: CallableFunction = (instanceId: string) => {
    const configId = VLMSound.instances[instanceId].configId
    VLMSound.configs[configId].removeInstance(instanceId)
  }

  static deleteInstance: CallableFunction = (instanceId: string) => {
    const configId = VLMSound.instances[instanceId].configId
    VLMSound.configs[configId].deleteInstance(instanceId)
  }
}
