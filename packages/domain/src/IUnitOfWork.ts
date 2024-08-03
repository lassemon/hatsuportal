/**
 * A simple container that implements the unit of work pattern. When acquired, signifies that
 * one has uncontested access to a given entity, and once finished signifies that all work on
 * said entity is finished and access can be granted to other interested parties.
 */
export interface IUnitOfWork<T> {
  /**
   * The aggregate to which this unit of work is linked.
   */
  aggregate: T

  execute(): Promise<void>
}
