import { describe, expect, it, vi } from 'vitest'
import { DomainEvent } from '@hatsuportal/shared-kernel'
import { DomainEventService } from './DomainEventService'
import type { IDomainEventRepository } from '../../application/repositories/IDomainEventRepository'

describe('DomainEventService', () => {
  const createRepository = (): IDomainEventRepository => ({
    insert: vi.fn().mockResolvedValue(undefined),
    findUnpublished: vi.fn().mockResolvedValue([]),
    markAsPublished: vi.fn().mockResolvedValue(undefined),
    deleteOlderThan: vi.fn().mockResolvedValue(0)
  })

  it('persists multiple events in order', async () => {
    const repository = createRepository()
    const service = new DomainEventService(repository)
    const event1 = new DomainEvent('StoryCreated', { id: '1' })
    const event2 = new DomainEvent('StoryUpdated', { id: '1' })

    await service.persistEvents([event1, event2])

    expect(repository.insert).toHaveBeenCalledTimes(2)
    expect(repository.insert).toHaveBeenNthCalledWith(1, event1)
    expect(repository.insert).toHaveBeenNthCalledWith(2, event2)
  })

  it('does not insert when the event list is empty', async () => {
    const repository = createRepository()
    const service = new DomainEventService(repository)

    await service.persistEvents([])

    expect(repository.insert).not.toHaveBeenCalled()
  })

  it('persists a single event', async () => {
    const repository = createRepository()
    const service = new DomainEventService(repository)
    const event = new DomainEvent('UserCreated', { id: 'user-1' })

    await service.persistEvents([event])

    expect(repository.insert).toHaveBeenCalledOnce()
    expect(repository.insert).toHaveBeenCalledWith(event)
  })

  it('propagates partial insert failure and stops inserting remaining events', async () => {
    const event1 = new DomainEvent('StoryCreated', { id: '1' })
    const event2 = new DomainEvent('StoryUpdated', { id: '1' })
    const event3 = new DomainEvent('StoryDeleted', { id: '1' })
    const repository = createRepository()
    repository.insert = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('outbox write failed'))

    const service = new DomainEventService(repository)

    await expect(service.persistEvents([event1, event2, event3])).rejects.toThrow('outbox write failed')
    expect(repository.insert).toHaveBeenCalledTimes(2)
    expect(repository.insert).toHaveBeenNthCalledWith(1, event1)
    expect(repository.insert).toHaveBeenNthCalledWith(2, event2)
  })
})
