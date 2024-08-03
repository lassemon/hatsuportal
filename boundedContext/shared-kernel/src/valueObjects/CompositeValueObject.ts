export abstract class CompositeValueObject {
  abstract equals(other: unknown): boolean
  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  abstract serialize(): Record<string, unknown>
}
