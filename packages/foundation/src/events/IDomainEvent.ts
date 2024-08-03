/*
 * This belongs in foundation, not shared-kernel because it is not domain knowledge, its a technical messaging concern.
 */
export interface IDomainEvent<TTime> {
  readonly occurredOn: TTime
  readonly eventType: string
}
