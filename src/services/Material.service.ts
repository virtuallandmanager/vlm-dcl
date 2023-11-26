import { Entity, PBMaterial_PbrMaterial, PBMaterial_UnlitMaterial } from '@dcl/sdk/ecs'
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
        textureOptions.texture = ecs.Material.Texture.Common({ src: textureSrc })
      }
      if (bumpSrc || textureSrc) {
        textureOptions.bumpTexture = ecs.Material.Texture.Common({ src: bumpSrc || textureSrc })
      }
      if (emissiveSrc || textureSrc) {
        textureOptions.emissiveTexture = ecs.Material.Texture.Common({ src: emissiveSrc || textureSrc })
      }
      if (alphaSrc || textureSrc) {
        textureOptions.alphaTexture = ecs.Material.Texture.Common({ src: alphaSrc || textureSrc })
      }
      if (emission) {
        textureOptions.emissiveIntensity = emission
        textureOptions.directIntensity = emission
        textureOptions.specularIntensity = emission
      }

      textureOptions.castShadows = config.castShadows

      return textureOptions
    } catch (error) {
      throw error
    }
  }
}
