import { Vector3, Quaternion } from '@dcl/sdk/math'

export class VLMQuaternion {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public w: number,
  ) {}

  magnitude: CallableFunction = (): number => {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
  }

  conjugate: CallableFunction = (): Quaternion => {
    return new VLMQuaternion(-this.x, -this.y, -this.z, this.w)
  }

  invert: CallableFunction = (): Quaternion => {
    let mag = this.magnitude()
    if (mag === 0) {
      throw new Error('Cannot invert a zero magnitude quaternion')
    }
    let conj = this.conjugate()
    return new VLMQuaternion(conj.x / mag, conj.y / mag, conj.z / mag, conj.w / mag)
  }
}
