import { describe, expect, it } from 'vitest'
import { CommentApplicationMapper } from './CommentApplicationMapper'

describe('CommentApplicationMapper', () => {
  const commentMapper = new CommentApplicationMapper()

  it('converts comment entity to dto', ({ unitFixture }) => {
    const comment = unitFixture.commentMock()
    const result = commentMapper.toDTO(comment)
    expect(typeof result).toBe('object')
    expect(result).toStrictEqual(unitFixture.commentDTOMock())
  })
})
