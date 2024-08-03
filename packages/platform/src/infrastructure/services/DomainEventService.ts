import { IDomainEvent, IDomainEventHolder, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { IDomainEventService } from '../../application/services/IDomainEventService'
import { IDomainEventRepository } from '../repositories/IDomainEventRepository'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('DomainEventService')

export class DomainEventService implements IDomainEventService {
  constructor(private readonly domainEventRepository: IDomainEventRepository) {}

  public async persistToOutbox<T extends Array<IDomainEventHolder<UniqueId, UnixTimestamp> | null>>(eventHolders: [...T]): Promise<void>

  public async persistToOutbox<DomainEvent extends IDomainEvent<UnixTimestamp>>(domainEvents: DomainEvent[]): Promise<void>

  public async persistToOutbox(
    input: Array<IDomainEventHolder<UniqueId, UnixTimestamp> | null> | Array<IDomainEvent<UnixTimestamp>>
  ): Promise<void> {
    if (this.isDomainEventArray(input)) {
      await this.persistDomainEvents(input)
      return
    }

    const domainEvents = input
      .filter((eventHolder): eventHolder is IDomainEventHolder<UniqueId, UnixTimestamp> => eventHolder !== null)
      .flatMap((eventHolder) => eventHolder.domainEvents)

    await this.persistDomainEvents(domainEvents)
  }

  private isDomainEventArray(
    input: Array<IDomainEventHolder<UniqueId, UnixTimestamp> | null> | Array<IDomainEvent<UnixTimestamp>>
  ): input is Array<IDomainEvent<UnixTimestamp>> {
    if (input.length === 0) {
      return true
    }

    const firstItem = input[0]

    return firstItem !== null && 'eventType' in firstItem
  }

  private async persistDomainEvents(domainEvents: IDomainEvent<UnixTimestamp>[]): Promise<void> {
    for (const event of domainEvents) {
      logger.debug(`Persisting event ${event.eventType}`)
      await this.domainEventRepository.insert(event)
    }
  }
}
