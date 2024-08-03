import {
  ISoftDeleteCommentUseCaseOptions,
  SoftDeleteCommentUseCase
} from '../../../application/useCases/comment/SoftDeleteCommentUseCase/SoftDeleteCommentUseCase'
import { CommentScenarioBase } from './CommentScenarioBase'

export class SoftDeleteCommentScenario extends CommentScenarioBase<ISoftDeleteCommentUseCaseOptions, 'commentSoftDeleted'> {
  static given() {
    return new SoftDeleteCommentScenario()
  }

  private constructor() {
    super(['commentSoftDeleted'])
  }

  async whenExecutedWithInput(input: ISoftDeleteCommentUseCaseOptions) {
    const useCase = new SoftDeleteCommentUseCase(this.commentWriteRepository, this.commentLookupService, this.domainEventService)

    await this.capture(() =>
      useCase.execute({
        deleteCommentInput: input.deleteCommentInput,
        commentSoftDeleted: this.spyOutputBoundary('commentSoftDeleted')
      })
    )
    return this
  }
}
