import { vi } from 'vitest'
import { CommentValidationScenarioBase } from './CommentValidationScenarioBase'
import { SoftDeleteCommentUseCaseWithValidation } from '../../../application/useCases/comment/SoftDeleteCommentUseCase/SoftDeleteCommentUseCaseWithValidation'
import {
  ISoftDeleteCommentUseCase,
  ISoftDeleteCommentUseCaseOptions
} from '../../../application/useCases/comment/SoftDeleteCommentUseCase/SoftDeleteCommentUseCase'

export class SoftDeleteCommentValidationScenario extends CommentValidationScenarioBase<
  ISoftDeleteCommentUseCaseOptions,
  'commentSoftDeleted'
> {
  static given() {
    return new SoftDeleteCommentValidationScenario()
  }

  private readonly innerUseCaseMock: ISoftDeleteCommentUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  private constructor() {
    super(['commentSoftDeleted'])
  }

  async whenExecutedWithInput(input: ISoftDeleteCommentUseCaseOptions) {
    const wrapped = new SoftDeleteCommentUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.commentReadRepository,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        deleteCommentInput: input.deleteCommentInput,
        commentSoftDeleted: this.spyOutputBoundary('commentSoftDeleted')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
