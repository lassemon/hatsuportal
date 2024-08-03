export interface DomainEventDatabaseSchema {
  readonly id: string
  readonly eventType: string
  readonly serializedEventData: string
  readonly occurredOn: number
  readonly publishedOn: number | null
}
