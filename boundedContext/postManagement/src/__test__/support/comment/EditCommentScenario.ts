import { EditCommentUseCase, IEditCommentUseCaseOptions } from '../../../application/useCases/comment/EditCommentUseCase/EditCommentUseCase'
import { CommentScenarioBase } from './CommentScenarioBase'

export class EditCommentScenario extends CommentScenarioBase<IEditCommentUseCaseOptions, 'commentEdited'> {
  static given() {
    return new EditCommentScenario()
  }

  private constructor() {
    super(['commentEdited'])
  }

  async whenExecutedWithInput(input: IEditCommentUseCaseOptions) {
    const useCase = new EditCommentUseCase(this.commentWriteRepository, this.commentLookupService, this.domainEventService)

    await this.capture(() =>
      useCase.execute({
        editCommentInput: input.editCommentInput,
        commentEdited: this.spyOutputBoundary('commentEdited')
      })
    )
    return this
  }
}
