import { describe, expect, it } from 'vitest'
import { Tag } from './Tag'
import { TagId } from '../valueObjects/TagId'
import { TagSlug } from '../valueObjects/TagSlug'
import { TagName } from '../valueObjects/TagName'
import { TagCreatorId } from '../valueObjects/TagCreatorId'
import {
  CreatedAtTimestamp,
  DomainEvent,
  UnixTimestamp,
  InvalidCreatedAtTimestampError
} from '@hatsuportal/shared-kernel'

describe('Tag entity', () => {
  it('creates and serializes tag', ({ unitFixture }) => {
    const tag = unitFixture.tagMock()
    const dto = unitFixture.tagDTOMock()

    expect(tag.serialize()).toEqual({
      id: dto.id,
      slug: dto.slug,
      name: dto.name,
      createdById: dto.createdById,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    })
  })

  it('updates name and slug', ({ unitFixture }) => {
    const tag = unitFixture.tagMock()
    const previousUpdatedAt = tag.updatedAt.value
    const newName = new TagName('updated tag')
    const newSlug = new TagSlug('updated-tag')

    tag.updateName(newName, tag.id)
    tag.updateSlug(newSlug, tag.id)

    expect(tag.name.value).toBe('updated tag')
    expect(tag.slug.value).toBe('updated-tag')
    expect(tag.updatedAt.value).toBeGreaterThan(previousUpdatedAt)
  })

  it('rejects createdAt after updatedAt', ({ unitFixture }) => {
    const dto = unitFixture.tagDTOMock()
    expect(() =>
      Tag.reconstruct({
        id: new TagId(dto.id),
        slug: new TagSlug(dto.slug),
        name: new TagName(dto.name),
        createdById: new TagCreatorId(dto.createdById),
        createdAt: new CreatedAtTimestamp(dto.updatedAt + 1000),
        updatedAt: new UnixTimestamp(dto.updatedAt)
      })
    ).toThrow(InvalidCreatedAtTimestampError)
  })

  it('compares tags by identity and content', ({ unitFixture }) => {
    const tag = unitFixture.tagMock()
    const clone = tag.clone()

    expect(tag.equals(clone)).toBe(true)
    expect(tag.equals(unitFixture.tagMock())).toBe(true)
    expect(tag.equals({})).toBe(false)
  })

  it('equals returns false when tag properties differ', ({ unitFixture }) => {
    const dto = unitFixture.tagDTOMock()
    const baseProps = {
      id: new TagId(dto.id),
      slug: new TagSlug(dto.slug),
      name: new TagName(dto.name),
      createdById: new TagCreatorId(dto.createdById),
      createdAt: new CreatedAtTimestamp(dto.createdAt),
      updatedAt: new UnixTimestamp(dto.updatedAt)
    }
    const tag = Tag.reconstruct(baseProps)

    const differentId = Tag.reconstruct({ ...baseProps, id: new TagId('test1b19-tag-diff-4792-a2f0-f95ccab82d99') })
    const differentSlug = Tag.reconstruct({ ...baseProps, slug: new TagSlug('different-slug') })
    const differentName = Tag.reconstruct({ ...baseProps, name: new TagName('different name') })
    const differentCreatedById = Tag.reconstruct({
      ...baseProps,
      createdById: new TagCreatorId('test1b19-user-diff-4792-a2f0-f95ccab82d99')
    })
    const differentCreatedAt = Tag.reconstruct({ ...baseProps, createdAt: new CreatedAtTimestamp(dto.createdAt + 100) })
    const differentUpdatedAt = Tag.reconstruct({ ...baseProps, updatedAt: new UnixTimestamp(dto.updatedAt + 100) })

    expect(tag.equals(differentId)).toBe(false)
    expect(tag.equals(differentSlug)).toBe(false)
    expect(tag.equals(differentName)).toBe(false)
    expect(tag.equals(differentCreatedById)).toBe(false)
    expect(tag.equals(differentCreatedAt)).toBe(false)
    expect(tag.equals(differentUpdatedAt)).toBe(false)
  })

  it('handles domain events correctly', ({ unitFixture }) => {
    const tag = unitFixture.tagMock()
    const event = new DomainEvent('TestEvent', {
      id: tag.id.value,
      slug: tag.slug.value,
      name: tag.name.value
    })

    expect(tag.domainEvents).toHaveLength(0)

    tag.addDomainEvent(event)
    expect(tag.domainEvents).toHaveLength(1)
    expect(tag.domainEvents[0]).toBe(event)

    tag.clearEvents()
    expect(tag.domainEvents).toHaveLength(0)
  })

  it('returns immutable domain events array', ({ unitFixture }) => {
    const tag = unitFixture.tagMock()
    const event = new DomainEvent('TestEvent', { id: tag.id.value })

    tag.addDomainEvent(event)

    const events = tag.domainEvents
    events.push(new DomainEvent('OtherEvent', {}))

    expect(tag.domainEvents).toHaveLength(1)
  })

  it('delete updates updatedAt', ({ unitFixture }) => {
    const tag = unitFixture.tagMock()
    const previousUpdatedAt = tag.updatedAt.value

    tag.delete(tag.id)

    expect(tag.updatedAt.value).toBeGreaterThan(previousUpdatedAt)
  })

  it('canCreate returns true for valid props', ({ unitFixture }) => {
    expect(Tag.canCreate(unitFixture.tagDTOMock())).toBe(true)
  })

  it('canCreate returns false for invalid props', ({ unitFixture }) => {
    const { id, ...invalidProps } = unitFixture.tagDTOMock()
    expect(Tag.canCreate(invalidProps)).toBe(false)
  })
})
