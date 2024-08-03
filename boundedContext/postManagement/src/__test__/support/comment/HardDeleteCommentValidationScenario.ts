import { vi } from 'vitest'
import { CommentValidationScenarioBase } from './CommentValidationScenarioBase'
import { HardDeleteCommentUseCaseWithValidation } from '../../../application/useCases/comment/HardDeleteCommentUseCase/HardDeleteCommentUseCaseWithValidation'
import {
  IHardDeleteCommentUseCase,
  IHardDeleteCommentUseCaseOptions
} from '../../../application/useCases/comment/HardDeleteCommentUseCase/HardDeleteCommentUseCase'

export class HardDeleteCommentValidationScenario extends CommentValidationScenarioBase<
  IHardDeleteCommentUseCaseOptions,
  'commentHardDeleted'
> {
  static given() {
    return new HardDeleteCommentValidationScenario()
  }

  private readonly innerUseCaseMock: IHardDeleteCommentUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  private constructor() {
    super(['commentHardDeleted'])
  }

  async whenExecutedWithInput(input: IHardDeleteCommentUseCaseOptions) {
    const wrapped = new HardDeleteCommentUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.commentReadRepository,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        deleteCommentInput: input.deleteCommentInput,
        commentHardDeleted: this.spyOutputBoundary('commentHardDeleted')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
