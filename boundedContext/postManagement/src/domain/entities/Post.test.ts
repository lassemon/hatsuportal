import { beforeEach, describe, expect, it } from 'vitest'
import { VisibilityEnum, uuid, unixtimeNow } from '@hatsuportal/common'
import { IDomainEvent, InvalidUnixTimestampError, UnixTimestamp } from '@hatsuportal/common-bounded-context'

import { Post, PostProps } from './Post'
import { PostVisibility } from '../valueObjects/PostVisibility'

/*
 * A minimal concrete implementation of the abstract Post class that is
 * ONLY intended for testing the shared behaviour of Post. It stores no
 * extra data beyond what Post already defines.
 */
class TestPost extends Post<PostProps> {
  constructor(props: PostProps) {
    super(props)
  }

  // Return raw props so that callers can easily assert values.
  getProps(): PostProps {
    return {
      id: this._id.value,
      visibility: this._visibility.value,
      createdById: this._createdById.value,
      createdByName: this._createdByName.value,
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt.value
    }
  }

  update(props: Partial<PostProps>): void {
    if (props.visibility) {
      this._visibility = new PostVisibility(props.visibility)
    }
    // Always refresh updatedAt so that we can assert later on.
    this._updatedAt = new UnixTimestamp(unixtimeNow())
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
      id: uuid(),
      visibility: VisibilityEnum.Public,
      createdById: uuid(),
      createdByName: 'TestUser',
      createdAt,
      updatedAt: createdAt + 10
    }
  })

  it('can create a concrete post with all properties', () => {
    const post = new TestPost(baseProps)

    expect(post.id.value).toBe(baseProps.id)
    expect(post.visibility.value).toBe(baseProps.visibility)
    expect(post.createdById.value).toBe(baseProps.createdById)
    expect(post.createdByName.value).toBe(baseProps.createdByName)
    expect(post.createdAt.value).toBe(baseProps.createdAt)
    expect(post.updatedAt.value).toBe(baseProps.updatedAt)
  })

  it('throws InvalidUnixTimestampError when createdAt is after updatedAt', () => {
    const now = unixtimeNow()
    const invalidProps: PostProps = {
      ...baseProps,
      createdAt: now,
      updatedAt: now - 1
    }

    expect(() => new TestPost(invalidProps)).toThrow(InvalidUnixTimestampError)
  })

  it('supports equality comparison based on core properties', () => {
    const post1 = new TestPost(baseProps)
    const post2 = new TestPost({ ...baseProps, updatedAt: baseProps.updatedAt + 50 }) // diff updatedAt -> still equal
    const post3 = new TestPost({ ...baseProps, id: uuid() })

    expect(post1.equals(post2)).toBe(true)
    expect(post1.equals(post3)).toBe(false)
  })

  it('can add and clear domain events', () => {
    const post = new TestPost(baseProps)
    const event: IDomainEvent = {
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

  it('update modifies visibility and refreshed updatedAt', () => {
    const post = new TestPost(baseProps)
    const previousUpdatedAt = post.updatedAt.value

    post.update({ visibility: VisibilityEnum.Private })

    expect(post.visibility.value).toBe(VisibilityEnum.Private)
    expect(post.updatedAt.value).toBeGreaterThanOrEqual(previousUpdatedAt)
  })
})
