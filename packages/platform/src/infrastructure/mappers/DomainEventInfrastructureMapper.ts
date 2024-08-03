import { DomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { DomainEventId } from '@hatsuportal/shared-kernel'
import { IDomainEventInfrastructureMapper } from '../../application'
import { DomainEventDatabaseSchema } from '../schemas/DomainEventDatabaseSchema'

export class DomainEventInfrastructureMapper implements IDomainEventInfrastructureMapper {
  constructor() {}

  toInsertRecord(event: DomainEvent): DomainEventDatabaseSchema {
    return {
      id: event.id.value,
      eventType: event.eventType,
      serializedEventData: JSON.stringify(event.data),
      occurredOn: event.occurredOn.value,
      publishedOn: null
    }
  }

  toDomainEvent(databaseSchema: DomainEventDatabaseSchema): DomainEvent {
    return new DomainEvent(
      databaseSchema.eventType,
      JSON.parse(databaseSchema.serializedEventData),
      new DomainEventId(databaseSchema.id),
      new UnixTimestamp(databaseSchema.occurredOn)
    )
  }
}
