import {
  HardDeleteCommentUseCase,
  IHardDeleteCommentUseCaseOptions
} from '../../../application/useCases/comment/HardDeleteCommentUseCase/HardDeleteCommentUseCase'
import { CommentScenarioBase } from './CommentScenarioBase'

export class HardDeleteCommentScenario extends CommentScenarioBase<IHardDeleteCommentUseCaseOptions, 'commentHardDeleted'> {
  static given() {
    return new HardDeleteCommentScenario()
  }

  private constructor() {
    super(['commentHardDeleted'])
  }

  async whenExecutedWithInput(input: IHardDeleteCommentUseCaseOptions) {
    const useCase = new HardDeleteCommentUseCase(this.commentWriteRepository, this.commentLookupService, this.domainEventService)

    await this.capture(() =>
      useCase.execute({
        deleteCommentInput: input.deleteCommentInput,
        commentHardDeleted: this.spyOutputBoundary('commentHardDeleted')
      })
    )
    return this
  }
}
