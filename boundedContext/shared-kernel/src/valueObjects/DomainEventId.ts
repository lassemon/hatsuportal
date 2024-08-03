import { UniqueId } from './UniqueId'
import { uuid } from '@hatsuportal/common'

/**
 * An id that identifies a domain event.
 */
export class DomainEventId extends UniqueId {
  static create(): DomainEventId {
    return new DomainEventId(uuid())
  }
}
