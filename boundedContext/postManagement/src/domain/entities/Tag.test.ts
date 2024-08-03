import { describe, expect, it } from 'vitest'
import { InvalidUnixTimestampError } from '@hatsuportal/shared-kernel'
import { Tag } from './Tag'
import { TagId } from '../valueObjects/TagId'
import { TagSlug } from '../valueObjects/TagSlug'
import { TagCreatorId } from '../valueObjects/TagCreatorId'
import { CreatedAtTimestamp, NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'

describe('Tag entity', () => {
  it('creates and serializes tag', ({ unitFixture }) => {
    const tag = unitFixture.tagMock()
    expect(tag.serialize().id).toBe(unitFixture.sampleTagId)
  })

  it('updates name and slug', ({ unitFixture }) => {
    const tag = unitFixture.tagMock()
    const newName = new NonEmptyString('updated tag')
    const newSlug = new TagSlug('updated-tag')
    tag.updateName(newName, tag.id)
    tag.updateSlug(newSlug, tag.id)
    expect(tag.name.value).toBe('updated tag')
    expect(tag.slug.value).toBe('updated-tag')
  })

  it('rejects createdAt after updatedAt', ({ unitFixture }) => {
    const dto = unitFixture.tagDTOMock()
    expect(
      () =>
        Tag.reconstruct({
          id: new TagId(dto.id),
          slug: new TagSlug(dto.slug),
          name: new NonEmptyString(dto.name),
          createdById: new TagCreatorId(dto.createdById),
          createdAt: new CreatedAtTimestamp(dto.updatedAt + 1000),
          updatedAt: new UnixTimestamp(dto.updatedAt)
        })
    ).toThrow(InvalidUnixTimestampError)
  })

  it('compares tags by identity and content', ({ unitFixture }) => {
    const tag = unitFixture.tagMock()
    const clone = tag.clone()
    expect(tag.equals(clone)).toBe(true)
    expect(tag.equals(unitFixture.tagMock())).toBe(true)
  })
})
