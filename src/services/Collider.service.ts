import { Entity, MeshCollider, ColliderLayer } from '@dcl/sdk/ecs'
import { ecs } from '../environment'

export class ColliderService {
  entities: Entity[] = []

  addEntity: CallableFunction = (entity: Entity): void => {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity)
    }
  }

  setPlaneShape: CallableFunction = (entity: Entity, layers: ColliderLayer[]): void => {
    this.addEntity(entity)
    ecs.MeshCollider.setPlane(entity, layers)
  }

  setCylinderShape: CallableFunction = (entity: Entity, options: { radiusTop?: number; radiusBottom?: number }, layers: ColliderLayer[]): void => {
    this.addEntity(entity)
    ecs.MeshCollider.setCylinder(entity, options.radiusBottom, options.radiusTop, layers)
  }

  setBoxShape: CallableFunction = (entity: Entity, layers: ColliderLayer[]): void => {
    this.addEntity(entity)
    ecs.MeshCollider.setBox(entity, layers)
  }

  setSphereShape: CallableFunction = (entity: Entity, layers: ColliderLayer[]): void => {
    this.addEntity(entity)
    ecs.MeshCollider.setSphere(entity, layers)
  }

  set: CallableFunction = (entity: Entity, type: string, withCollisions?: boolean, withClickEvent?: boolean): void => {
    if (withCollisions === false && withClickEvent === false) {
      this.clear(entity)
      return
    } else {
      this.addEntity(entity)
    }

    const layers = []

    if (withCollisions) {
      layers.push(ColliderLayer.CL_PHYSICS)
    }
    if (withClickEvent) {
      layers.push(ColliderLayer.CL_POINTER)
    }

    switch (type) {
      case 'plane':
        this.setPlaneShape(entity, layers)
        break
      case 'cylinder':
        this.setCylinderShape(entity, layers)
        break
      case 'box':
        this.setBoxShape(entity, layers)
        break
      case 'sphere':
        this.setSphereShape(entity, layers)
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
