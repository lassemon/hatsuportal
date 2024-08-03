import { DomainEvent } from '@hatsuportal/shared-kernel'

export interface IDomainEventService {
  persistEvents(events: readonly DomainEvent[]): Promise<void>
}
