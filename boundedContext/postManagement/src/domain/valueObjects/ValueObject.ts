export abstract class ValueObject<T> {
  abstract value: T
  abstract toString(): string
  abstract equals(other: unknown): boolean
}

export default ValueObject
