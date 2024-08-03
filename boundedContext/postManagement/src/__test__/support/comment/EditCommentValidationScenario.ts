import { vi } from 'vitest'
import { CommentValidationScenarioBase } from './CommentValidationScenarioBase'
import { EditCommentUseCaseWithValidation } from '../../../application/useCases/comment/EditCommentUseCase/EditCommentUseCaseWithValidation'
import { IEditCommentUseCase, IEditCommentUseCaseOptions } from '../../../application/useCases/comment/EditCommentUseCase/EditCommentUseCase'

export class EditCommentValidationScenario extends CommentValidationScenarioBase<IEditCommentUseCaseOptions, 'commentEdited'> {
  static given() {
    return new EditCommentValidationScenario()
  }

  private readonly innerUseCaseMock: IEditCommentUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  private constructor() {
    super(['commentEdited'])
  }

  async whenExecutedWithInput(input: IEditCommentUseCaseOptions) {
    const wrapped = new EditCommentUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userGateway,
      this.commentReadRepository,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        editCommentInput: input.editCommentInput,
        commentEdited: this.spyOutputBoundary('commentEdited')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
