import { beforeEach, describe, expect, it } from 'vitest'
import { uuid, unixtimeNow } from '@hatsuportal/common'
import { IDomainEvent, InvalidUnixTimestampError, UnixTimestamp } from '@hatsuportal/shared-kernel'

import { Post, PostProps } from './Post'
import { PostId } from '../valueObjects/PostId'
import { PostCreatorId } from '../valueObjects/PostCreatorId'

/*
 * A minimal concrete implementation of the abstract Post class that is
 * ONLY intended for testing the shared behaviour of Post. It stores no
 * extra data beyond what Post already defines.
 */
class TestPost extends Post {
  constructor(props: PostProps) {
    super(props.id, props.createdById, props.createdAt, props.updatedAt)
  }

  // Return raw props so that callers can easily assert values.
  serialize(): Record<string, unknown> {
    return {
      id: this.id.value,
      createdById: this.createdById.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value
    }
  }

  // For the purpose of these tests we only want to clear events.
  delete(): void {
    this.clearEvents()
  }
}

describe('Post (abstract) – shared behaviour', () => {
  let baseProps: PostProps

  beforeEach(() => {
    const createdAt = unixtimeNow() - 1000
    baseProps = {
      id: new PostId(uuid()),
      createdById: new PostCreatorId(uuid()),
      createdAt: new UnixTimestamp(createdAt),
      updatedAt: new UnixTimestamp(createdAt + 10)
    }
  })

  it('can create a concrete post with all properties', () => {
    const post = new TestPost(baseProps)

    expect(post.id.value).toBe(baseProps.id.value)
    expect(post.createdById.value).toBe(baseProps.createdById.value)
    expect(post.createdAt.value).toBe(baseProps.createdAt.value)
    expect(post.updatedAt.value).toBe(baseProps.updatedAt.value)
  })

  it('throws InvalidUnixTimestampError when createdAt is after updatedAt', () => {
    const now = unixtimeNow()
    const invalidProps: PostProps = {
      ...baseProps,
      createdAt: new UnixTimestamp(now),
      updatedAt: new UnixTimestamp(now - 1)
    }

    expect(() => new TestPost(invalidProps)).toThrow(InvalidUnixTimestampError)
  })

  it('supports equality comparison based on core properties', () => {
    const post1 = new TestPost(baseProps)
    const post2 = new TestPost({ ...baseProps, updatedAt: new UnixTimestamp(baseProps.updatedAt.value + 50) }) // diff updatedAt -> still equal
    const post3 = new TestPost({ ...baseProps, id: new PostId(uuid()) })

    expect(post1.equals(post2)).toBe(true)
    expect(post1.equals(post3)).toBe(false)
  })

  it('can add and clear domain events', () => {
    const post = new TestPost(baseProps)
    const event: IDomainEvent<UnixTimestamp> = {
      occurredOn: new UnixTimestamp(unixtimeNow()),
      eventType: 'TestEvent'
    }

    expect(post.domainEvents.length).toBe(0)
    post.addDomainEvent(event)
    expect(post.domainEvents.length).toBe(1)
    expect(post.domainEvents[0]).toBe(event)

    post.clearEvents()
    expect(post.domainEvents.length).toBe(0)
  })
})
