import {
  GetCommentsUseCase,
  IGetCommentsUseCaseOptions
} from '../../../application/useCases/comment/GetCommentsUseCase/GetCommentsUseCase'
import { CommentScenarioBase } from './CommentScenarioBase'
import { NonNegativeInteger } from '@hatsuportal/shared-kernel'
import { OrderEnum } from '@hatsuportal/common'

export class GetCommentsScenario extends CommentScenarioBase<IGetCommentsUseCaseOptions, 'commentsFound'> {
  static given() {
    return new GetCommentsScenario()
  }

  private constructor() {
    super(['commentsFound'])
  }

  async whenExecutedWithInput(input: IGetCommentsUseCaseOptions) {
    const useCase = new GetCommentsUseCase(this.commentLookupService)

    await this.capture(() =>
      useCase.execute({
        defaultSortOrder: input.defaultSortOrder ?? OrderEnum.Descending,
        defaultRepliesPreviewLimit: input.defaultRepliesPreviewLimit ?? new NonNegativeInteger(3),
        getCommentsInput: input.getCommentsInput,
        commentsFound: this.spyOutputBoundary('commentsFound')
      })
    )
    return this
  }
}
