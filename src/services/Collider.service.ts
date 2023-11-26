import { Entity, MeshCollider, ColliderLayer } from '@dcl/sdk/ecs'
import { ecs } from '../environment'
import { VLMMeshOptions } from '../shared/interfaces'

export class ColliderService {
  entities: Entity[] = []

  addEntity: CallableFunction = (entity: Entity): void => {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity)
    }
  }

  setPlaneShape: CallableFunction = (entity: Entity): void => {
    this.addEntity(entity)
    ecs.MeshCollider.setPlane(entity, [ColliderLayer.CL_POINTER, ColliderLayer.CL_PHYSICS])
  }

  setCylinderShape: CallableFunction = (entity: Entity, options: { radiusTop?: number; radiusBottom?: number }): void => {
    this.addEntity(entity)
    ecs.MeshCollider.setCylinder(entity, options.radiusBottom, options.radiusTop, [ColliderLayer.CL_POINTER, ColliderLayer.CL_PHYSICS])
  }

  setBoxShape: CallableFunction = (entity: Entity): void => {
    this.addEntity(entity)
    ecs.MeshCollider.setBox(entity, [ColliderLayer.CL_POINTER, ColliderLayer.CL_PHYSICS])
  }

  setSphereShape: CallableFunction = (entity: Entity): void => {
    this.addEntity(entity)
    ecs.MeshCollider.setSphere(entity, [ColliderLayer.CL_POINTER, ColliderLayer.CL_PHYSICS])
  }

  set: CallableFunction = (entity: Entity, type: string, withCollisions: boolean): void => {
    this.addEntity(entity)

    if (withCollisions === false) {
      this.clear(entity)
      return
    }

    switch (type) {
      case 'plane':
        this.setPlaneShape(entity)
        break
      case 'cylinder':
        this.setCylinderShape(entity)
        break
      case 'box':
        this.setBoxShape(entity)
        break
      case 'sphere':
        this.setSphereShape(entity)
        break
    }
  }

  setAll: CallableFunction = (type: string): void => {
    this.entities.forEach((entity: Entity) => {
      this.set(entity, type)
    })
  }

  clear: CallableFunction = (entity: Entity): void => {
    if (!this.entities.includes(entity) || !ecs.MeshCollider.getOrNull(entity)) {
      return
    }
    ecs.MeshCollider.deleteFrom(entity)
  }

  clearAll: CallableFunction = (): void => {
    this.entities.forEach((entity: Entity) => {
      this.clear(entity)
    })
  }
}
