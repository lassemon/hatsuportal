import { uuid } from '@hatsuportal/common'
import { DomainEventDatabaseSchema, IDomainEventInfrastructureMapper } from '@hatsuportal/platform'
import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'

export class DomainEventInfrastructureMapper implements IDomainEventInfrastructureMapper {
  constructor() {}

  toInsertRecord(event: IDomainEvent<UnixTimestamp>): DomainEventDatabaseSchema {
    return {
      id: uuid(),
      eventType: event.eventType,
      serializedEventData: JSON.stringify(event.data),
      occurredOn: event.occurredOn.value,
      publishedOn: null
    }
  }

  toDomainEvent(databaseSchema: DomainEventDatabaseSchema): IDomainEvent<UnixTimestamp> {
    return {
      occurredOn: new UnixTimestamp(databaseSchema.occurredOn),
      eventType: databaseSchema.eventType,
      data: JSON.parse(databaseSchema.serializedEventData)
    }
  }
}
