import { Entity, PBMaterial_PbrMaterial, PBMaterial_UnlitMaterial, Material } from '@dcl/sdk/ecs'
import { ecs } from '../environment'
import { VLMDebug } from '../logic/VLMDebug.logic'
import { VLMTextureOptions } from '../shared/interfaces'

export class MaterialService {
  entities: Entity[] = []

  addEntity: CallableFunction = (entity: Entity): void => {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity)
    }
  }

  set: CallableFunction = (entity: Entity, type: string, options: PBMaterial_PbrMaterial | PBMaterial_UnlitMaterial): void => {
    this.addEntity(entity)
    VLMDebug.log('Texture Options: ', options)
    switch (type) {
      case 'basic':
        ecs.Material.setBasicMaterial(entity, options)
        break
      case 'pbr':
        ecs.Material.setPbrMaterial(entity, options)
        break
    }
  }

  clear: CallableFunction = (entity: Entity): void => {
    this.addEntity(entity)
    ecs.Material.deleteFrom(entity)
  }

  setAll: CallableFunction = (type?: string, options?: PBMaterial_PbrMaterial | PBMaterial_UnlitMaterial): void => {
    switch (type) {
      case 'basic':
        this.entities.forEach((entity: Entity) => {
          this.set(entity, 'basic', options)
        })
        break
      case 'pbr':
        this.entities.forEach((entity: Entity) => {
          this.set(entity, 'pbr', options)
        })
        break
      default:
        this.entities.forEach((entity: Entity) => {
          this.clear(entity)
        })
        break
    }
  }

  /**
   * @public buildOptions
   * Builds the materials for the config
   * @returns void
   */
  buildOptions: CallableFunction = (config: VLMTextureOptions) => {
    const textureOptions: PBMaterial_PbrMaterial = {}
    try {
      const { textureSrc, bumpSrc, emissiveSrc, alphaSrc, emission } = config

      if (textureSrc) {
        textureOptions.texture = Material.Texture.Common({ src: textureSrc })
      }
      if (bumpSrc) {
        textureOptions.bumpTexture = Material.Texture.Common({ src: bumpSrc })
      }
      if (emissiveSrc) {
        textureOptions.emissiveTexture = Material.Texture.Common({ src: emissiveSrc })
      }
      if (alphaSrc) {
        textureOptions.alphaTexture = Material.Texture.Common({ src: alphaSrc })
      }
      if (emission) {
        textureOptions.emissiveIntensity = emission || 1
      }

      textureOptions.castShadows = config.castShadows

      console.log('Texture Options: ', textureOptions)
      return textureOptions
    } catch (error) {
      throw error
    }
  }
}
