import { beforeAll, describe, expect, it, vi } from 'vitest'
import { uuid, unixtimeNow } from '@hatsuportal/common'
import { DomainEventInfrastructureMapper } from '@hatsuportal/platform'
import { DomainEvent, DomainEventId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import type { IDomainEventDispatcher } from '@hatsuportal/shared-kernel'
import Connection from '../../../../infrastructure/dataAccess/database/connection'
import { PostgresAdvisoryLock } from '../../../../infrastructure/dataAccess/database/PostgresAdvisoryLock'
import { DomainEventProcessor } from '../../../../infrastructure/services/DomainEventProcessor'
import { createIntegrationWiring } from '../../../support/integration/IntegrationWiring'

describe('DomainEventProcessor (integration)', () => {
  let wiring: ReturnType<typeof createIntegrationWiring>
  let dispatcher: IDomainEventDispatcher

  beforeAll(() => {
    wiring = createIntegrationWiring()
    dispatcher = {
      dispatch: vi.fn().mockResolvedValue(undefined),
      register: vi.fn().mockResolvedValue(undefined)
    }
  })

  it('dispatches unpublished outbox rows and marks them published', async () => {
    const eventId = uuid()
    const aggregateId = uuid()
    const occurredOn = unixtimeNow()
    const event = new DomainEvent(
      'TestDomainEvent',
      { id: aggregateId, message: 'hello' },
      new DomainEventId(eventId),
      new UnixTimestamp(occurredOn)
    )

    const mapper = new DomainEventInfrastructureMapper()
    await wiring.domainEventRepository.insert(event)

    const processor = new DomainEventProcessor(
      wiring.domainEventRepository,
      mapper,
      dispatcher,
      new PostgresAdvisoryLock(Connection, 991002)
    )

    await processor.processDomainEvents()

    expect(dispatcher.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: 'TestDomainEvent',
        data: { id: aggregateId, message: 'hello' }
      })
    )

    const rows = await wiring.dataAccessProvider.table('domain_event_outbox').where({ id: eventId })
    expect(rows).toHaveLength(1)
    expect(rows[0].publishedOn).not.toBeNull()
  })
})
