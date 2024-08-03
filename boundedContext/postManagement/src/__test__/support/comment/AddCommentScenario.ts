import { AddCommentUseCase, IAddCommentUseCaseOptions } from '../../../application/useCases/comment/AddCommentUseCase/AddCommentUseCase'
import { CommentScenarioBase } from './CommentScenarioBase'

export class AddCommentScenario extends CommentScenarioBase<IAddCommentUseCaseOptions, 'commentCreated'> {
  static given() {
    return new AddCommentScenario()
  }

  private constructor() {
    super(['commentCreated'])
  }

  async whenExecutedWithInput(input: IAddCommentUseCaseOptions) {
    const useCase = new AddCommentUseCase(this.commentWriteRepository, this.commentLookupService, this.domainEventService)

    await this.capture(() =>
      useCase.execute({
        addCommentInput: input.addCommentInput,
        commentCreated: this.spyOutputBoundary('commentCreated')
      })
    )
    return this
  }
}
