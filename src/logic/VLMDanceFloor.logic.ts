import { VLMDanceFloor } from '../components/VLMDanceFloor.component'
import { VLMDebug } from './VLMDebug.logic'

export abstract class VLMDanceFloorManager {
  static init: CallableFunction = (dancefloors: VLMDanceFloor.VLMConfig[]) => {
    try {
      VLMDebug.log('Initializing DanceFloors', dancefloors)
      if (!dancefloors.length) {
        return
      }
      dancefloors.forEach((dancefloor: VLMDanceFloor.VLMConfig) => {
        const existing = VLMDanceFloor.configs[dancefloor?.sk]
        if (existing) {
          existing.init()
        } else {
          this.create(dancefloor)
        }
      })
    } catch (error) {
      throw error
    }
  }

  static create: CallableFunction = (config: VLMDanceFloor.VLMConfig) => {
    try {
      new VLMDanceFloor.Config(config)
    } catch (error) {
      throw error
    }
  }

  static createInstance: CallableFunction = (config: VLMDanceFloor.VLMConfig, instance: VLMDanceFloor.Instance) => {
    try {
      if (!config.enabled || !instance.enabled) {
        return
      }
      const dancefloorId = config.sk
      VLMDanceFloor.configs[dancefloorId].createOrReplaceInstance(instance)
    } catch (error) {
      throw error
    }
  }

  static update: CallableFunction = (config: VLMDanceFloor.VLMConfig | any, property: string, id: string) => {
    try {
      const storedConfig: VLMDanceFloor.Config = VLMDanceFloor.configs[config.sk || id]

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
        default:
          storedConfig.init(config)
      }
    } catch (error) {
      throw error
    }
  }

  static updateInstance: CallableFunction = (instanceConfig: VLMDanceFloor.Instance, property: string, id: string) => {
    try {
      const instance = VLMDanceFloor.instances[instanceConfig.sk],
        configId = instance.configId,
        config = VLMDanceFloor.configs[configId]

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
        default:
          instance.init(config, instanceConfig)
      }
    } catch (error) {
      throw error
    }
  }

  static add: CallableFunction = (id: string) => {
    VLMDanceFloor.configs[id].addAll()
  }

  static delete: CallableFunction = (id: string) => {
    VLMDanceFloor.configs[id].delete()
  }

  static remove: CallableFunction = (id: string) => {
    VLMDanceFloor.configs[id].remove()
  }

  static removeInstance: CallableFunction = (instanceId: string) => {
    VLMDanceFloor.instances[instanceId].remove()
  }

  static deleteInstance: CallableFunction = (instanceId: string) => {
    const instance = VLMDanceFloor.instances[instanceId]
    const configId = instance?.configId

    if (configId) {
      VLMDanceFloor.configs[configId].deleteInstance(instanceId)
    }
  }
}
