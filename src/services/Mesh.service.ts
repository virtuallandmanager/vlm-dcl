import { Entity, PBGltfContainer, PBNftShape } from '@dcl/sdk/ecs'
import { ecs } from '../environment'
import { VLMDebug } from '../logic/VLMDebug.logic'

export class MeshService {
  entities: Entity[] = []

  addEntity: CallableFunction = (entity: Entity): void => {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity)
    }
  }

  setPlaneShape: CallableFunction = (entity: Entity, options?: { uvs: number[] }): void => {
    this.addEntity(entity)
    const defaultOptions = {
        uvs: [
          // North side
          0, 0, 0, 1, 1, 1, 1, 0,

          // South side
          0, 0, 0, 1, 1, 1, 1, 0,
        ],
      },
      uvs = options?.uvs ? options.uvs : defaultOptions.uvs
    ecs.MeshRenderer.setPlane(entity, uvs)
    VLMDebug.log('Setting Plane Shape', this.entities)
  }

  setCylinderShape: CallableFunction = (entity: Entity, options: { radiusTop?: number; radiusBottom?: number }): void => {
    this.addEntity(entity)
    ecs.MeshRenderer.setCylinder(entity, options.radiusBottom, options.radiusTop)
  }

  setBoxShape: CallableFunction = (entity: Entity, options?: { uvs: number[] }): void => {
    this.addEntity(entity)
    ecs.MeshRenderer.setBox(entity, options?.uvs)
  }

  setSphereShape: CallableFunction = (entity: Entity): void => {
    this.addEntity(entity)
    ecs.MeshRenderer.setSphere(entity)
  }

  setGltfShape: CallableFunction = (entity: Entity, options: PBGltfContainer): void => {
    this.addEntity(entity)
    VLMDebug.log('Setting GLTF Shape', this.entities)
    ecs.GltfContainer.createOrReplace(entity, options)
  }

  setNftShape: CallableFunction = (entity: Entity, options: PBNftShape): void => {
    this.addEntity(entity)
    ecs.NftShape.createOrReplace(entity, options)
  }

  setBillboardShape: CallableFunction = (entity: Entity): void => {
    this.addEntity(entity)
    ecs.Billboard.createOrReplace(entity)
  }

  set: CallableFunction = (entity: Entity, type: string, options?: any): void => {
    switch (type) {
      case 'plane':
        this.setPlaneShape(entity, options)
        break
      case 'cylinder':
        this.setCylinderShape(entity, options)
        break
      case 'box':
        this.setBoxShape(entity, options)
        break
      case 'sphere':
        this.setSphereShape(entity, options)
        break
      case 'gltf':
        this.setGltfShape(entity, options)
        break
      case 'nft':
        this.setNftShape(entity, options)
        break
      case 'billboard':
        this.setBillboardShape(entity)
        break
    }
  }

  setAll: CallableFunction = (type: string): void => {
    switch (type) {
      case 'plane':
        this.entities.forEach((entity: Entity) => {
          this.setPlaneShape(entity)
        })
        break
      case 'cylinder':
        this.entities.forEach((entity: Entity) => {
          this.setCylinderShape(entity)
        })
        break
      case 'box':
        this.entities.forEach((entity: Entity) => {
          this.setBoxShape(entity)
        })
        break
      case 'sphere':
        this.entities.forEach((entity: Entity) => {
          this.setSphereShape(entity)
        })
        break
      case 'gltf':
        this.entities.forEach((entity: Entity) => {
          this.setGltfShape(entity)
        })
        break
      case 'nft':
        this.entities.forEach((entity: Entity) => {
          this.setNftShape(entity)
        })
        break
      case 'billboard':
        this.entities.forEach((entity: Entity) => {
          this.setBillboardShape(entity)
        })
        break
    }
  }
}
