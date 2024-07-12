abstract class ValueObject<S> {
  abstract serialize(): S
  abstract toString(): string
}

export default ValueObject
