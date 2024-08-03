import { vi } from 'vitest'
import { CommentValidationScenarioBase } from './CommentValidationScenarioBase'
import { AddCommentUseCaseWithValidation } from '../../../application/useCases/comment/AddCommentUseCase/AddCommentUseCaseWithValidation'
import { IAddCommentUseCase, IAddCommentUseCaseOptions } from '../../../application/useCases/comment/AddCommentUseCase/AddCommentUseCase'

export class AddCommentValidationScenario extends CommentValidationScenarioBase<IAddCommentUseCaseOptions, 'commentCreated'> {
  static given() {
    return new AddCommentValidationScenario()
  }

  private readonly innerUseCaseMock: IAddCommentUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  private constructor() {
    super(['commentCreated'])
  }

  async whenExecutedWithInput(input: IAddCommentUseCaseOptions) {
    const wrapped = new AddCommentUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.authorizationService,
      this.postReadRepository,
      this.commentReadRepository
    )

    await this.capture(() =>
      wrapped.execute({
        addCommentInput: input.addCommentInput,
        commentCreated: this.spyOutputBoundary('commentCreated')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
