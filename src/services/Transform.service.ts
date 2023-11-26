import { Entity, TransformType } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { ecs } from '../environment'

export class TransformService {
  entities: Entity[] = []

  addEntity: CallableFunction = (entity: Entity): void => {
    if (!this.entities.includes(entity)) {
      this.entities.push(entity)
    }
  }

  set: CallableFunction = (entity: Entity, options: TransformType): void => {
    const { position, rotation, scale, parent } = options
    const vectorOptions = {
      position: Vector3.create(position.x, position.y, position.z),
      rotation: Quaternion.fromEulerDegrees(rotation.x, rotation.y, rotation.z),
      scale: Vector3.create(scale.x, scale.y, scale.z),
      parent: parent ? parent : undefined,
    }

    ecs.Transform.createOrReplace(entity, vectorOptions)
  }

  setAll: CallableFunction = (options: TransformType): void => {
    this.entities.forEach((entity: Entity) => {
      this.set(entity, options)
    })
  }

  clear: CallableFunction = (entity: Entity): void => {
    ecs.Transform.deleteFrom(entity)
  }
}
