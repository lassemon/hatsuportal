import { DomainEvent } from '@hatsuportal/shared-kernel'
import { IDomainEventService } from '../../application/services/IDomainEventService'
import { IDomainEventRepository } from '../../application/repositories/IDomainEventRepository'
import { Logger } from '../../utils'

const logger = new Logger('DomainEventService')

export class DomainEventService implements IDomainEventService {
  constructor(private readonly domainEventRepository: IDomainEventRepository) {}

  async persistEvents(events: readonly DomainEvent[]): Promise<void> {
    for (const event of events) {
      logger.debug(`Persisting event ${event.eventType}`)
      await this.domainEventRepository.insert(event)
    }
  }
}
