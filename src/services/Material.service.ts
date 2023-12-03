import { Entity, PBMaterial_PbrMaterial, PBMaterial_UnlitMaterial, Material, MaterialTransparencyMode } from '@dcl/sdk/ecs'
import { Color3, Color4 } from '@dcl/sdk/math'
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
    try {
      const textureOptions: PBMaterial_PbrMaterial = {
        alphaTest: 0,
        castShadows: true,
        albedoColor: Color4.White(),
        emissiveColor: Color4.White(),
        reflectivityColor: Color3.White(),
        transparencyMode: MaterialTransparencyMode.MTM_AUTO,
        metallic: 0.5,
        roughness: 0.5,
        specularIntensity: 1,
        emissiveIntensity: config.emission || 1,
        directIntensity: 1,
      }

      if (config.textureSrc) {
        textureOptions.texture = Material.Texture.Common({ src: config.textureSrc || '' })
        textureOptions.emissiveTexture = textureOptions.texture
      }
      if (config.emissiveSrc) {
        textureOptions.emissiveTexture = Material.Texture.Common({ src: config.emissiveSrc })
      }

      return textureOptions
    } catch (error) {
      throw error
    }
  }
}
