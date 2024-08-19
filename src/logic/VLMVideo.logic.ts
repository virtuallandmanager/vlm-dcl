import { VLMVideo } from '../components/VLMVideo.component'
import { VLMDebug } from './VLMDebug.logic'

export abstract class VLMVideoManager {
  static init: CallableFunction = (videos: VLMVideo.VLMConfig[]) => {
    try {
      VLMDebug.log('Initializing Videos', videos)
      if (!videos) {
        return
      }
      videos.forEach((video: VLMVideo.VLMConfig) => {
        const existing = VLMVideo.configs[video?.sk]
        if (existing) {
          existing.init()
        } else {
          this.create(video)
        }
      })
    } catch (error) {
      throw error
    }
  }

  static create: CallableFunction = (config: VLMVideo.VLMConfig) => {
    try {
      new VLMVideo.Config(config)
    } catch (error) {
      throw error
    }
  }

  static createInstance: CallableFunction = (config: VLMVideo.Config, instance: VLMVideo.VLMConfig) => {
    try {
      const videoId = config.sk
      VLMVideo.configs[videoId].createOrReplaceInstance(instance)
    } catch (error) {
      throw error
    }
  }

  static update: CallableFunction = (config: VLMVideo.VLMConfig, property: string, id: string) => {
    try {
      const storedConfig: VLMVideo.Config = VLMVideo.configs[config.sk || id]

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
        default:
          storedConfig.init(config)
      }
    } catch (error) {
      throw error
    }
  }

  static updateInstance: CallableFunction = (instanceConfig: VLMVideo.Instance, property: string, id: string) => {
    try {
      const instance = VLMVideo.instances[instanceConfig?.sk] || VLMVideo.instances[id],
        configId = instance.configId,
        config = VLMVideo.configs[configId]

      if (!config) {
        return
      } else if (!instance && instanceConfig.enabled) {
        config.createOrReplaceInstance(instanceConfig)
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
        case 'parent':
          instance.updateParent(instanceConfig.parent)
          break
        default:
          instance.init(config, instanceConfig)
      }
    } catch (error) {
      throw error
    }
  }

  static add: CallableFunction = (id: string) => {
    VLMVideo.configs[id].addAll()
  }

  static remove: CallableFunction = (id: string) => {
    VLMVideo.configs[id].remove()
  }

  static delete: CallableFunction = (id: string) => {
    VLMVideo.configs[id].delete()
  }

  static removeInstance: CallableFunction = (instanceId: string, _configId?: string) => {
    const configId = _configId || VLMVideo.instances[instanceId].configId
    VLMVideo.configs[configId].removeInstance(instanceId)
  }

  static deleteInstance: CallableFunction = (instanceId: string, _configId?: string) => {
    const configId = _configId || VLMVideo.instances[instanceId].configId
    VLMVideo.configs[configId].deleteInstance(instanceId)
  }
}
