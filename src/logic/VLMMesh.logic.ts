import { VLMMesh } from '../components/VLMMesh.component'
import { VLMDebug } from './VLMDebug.logic'

export abstract class VLMMeshManager {
  static init: CallableFunction = (meshes: VLMMesh.VLMConfig[]) => {
    try {
      VLMDebug.log('Initializing Meshes', meshes)
      if (!meshes.length) {
        return
      }
      meshes.forEach((mesh: VLMMesh.VLMConfig) => {
        const existing = VLMMesh.configs[mesh?.sk]
        if (existing) {
          existing.init()
        } else {
          this.create(mesh)
        }
      })
    } catch (error) {
      throw error
    }
  }

  static create: CallableFunction = (config: VLMMesh.VLMConfig) => {
    try {
      new VLMMesh.Config(config)
    } catch (error) {
      throw error
    }
  }

  static createInstance: CallableFunction = (config: VLMMesh.VLMConfig, instance: VLMMesh.Instance) => {
    try {
      if (!config.enabled || !instance.enabled) {
        return
      }
      const modelId = config.sk
      VLMMesh.configs[modelId].createOrReplaceInstance(instance)
    } catch (error) {
      throw error
    }
  }

  static update: CallableFunction = (config: VLMMesh.VLMConfig, property: string, id: string) => {
    try {
      const storedConfig: VLMMesh.Config = VLMMesh.configs[config.sk || id]

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
    } catch (error) {
      throw error
    }
  }

  static updateInstance: CallableFunction = (instanceConfig: VLMMesh.Instance, property: string, id: string) => {
    try {
      const instance = VLMMesh.instances[instanceConfig.sk],
        configId = instance?.configId,
        config = VLMMesh.configs[configId]

      if (!config) {
        VLMDebug.log(
          'error',
          `ERROR! - Config not found for an instance -\n
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
    VLMMesh.configs[id].addAll()
  }

  static delete: CallableFunction = (id: string) => {
    VLMMesh.configs[id].delete()
  }

  static remove: CallableFunction = (id: string) => {
    VLMMesh.configs[id].remove()
  }

  static removeInstance: CallableFunction = (instanceId: string) => {
    VLMMesh.instances[instanceId].remove()
  }

  static deleteInstance: CallableFunction = (instanceId: string) => {
    const instance = VLMMesh.instances[instanceId]
    const configId = instance?.configId

    if (configId) {
      VLMMesh.configs[configId].deleteInstance(instanceId)
    }
  }
}
