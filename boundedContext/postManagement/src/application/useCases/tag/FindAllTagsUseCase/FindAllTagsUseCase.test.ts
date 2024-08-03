import { describe, expect, it, vi } from 'vitest'
import { FindAllTagsUseCase } from './FindAllTagsUseCase'
import { FindAllTagsUseCaseWithValidation } from './FindAllTagsUseCaseWithValidation'
import { TagApplicationMapper } from '../../../mappers/TagApplicationMapper'
import * as Fixture from '../../../../__test__/testFactory'

describe('FindAllTagsUseCase', () => {
  it('returns all tags via callback', async () => {
    const tagRepository = Fixture.tagRepositoryMock()
    const tagsFound = vi.fn()
    const useCase = new FindAllTagsUseCase(tagRepository, new TagApplicationMapper())

    await useCase.execute({ tagsFound })

    expect(tagsFound).toHaveBeenCalledWith([Fixture.tagDTOMock()])
  })
})

describe('FindAllTagsUseCaseWithValidation', () => {
  it('delegates to inner use case', async () => {
    const inner = { execute: vi.fn().mockResolvedValue(undefined) }
    const wrapped = new FindAllTagsUseCaseWithValidation(inner)

    await wrapped.execute({ tagsFound: vi.fn() })

    expect(inner.execute).toHaveBeenCalledTimes(1)
  })
})
