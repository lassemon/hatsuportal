import {
  GetRepliesUseCase,
  IGetRepliesUseCaseOptions
} from '../../../application/useCases/comment/GetRepliesUseCase/GetRepliesUseCase'
import { CommentScenarioBase } from './CommentScenarioBase'
import { OrderEnum } from '@hatsuportal/common'

export class GetRepliesScenario extends CommentScenarioBase<IGetRepliesUseCaseOptions, 'repliesFound'> {
  static given() {
    return new GetRepliesScenario()
  }

  private constructor() {
    super(['repliesFound'])
  }

  async whenExecutedWithInput(input: IGetRepliesUseCaseOptions) {
    const useCase = new GetRepliesUseCase(this.commentLookupService)

    await this.capture(() =>
      useCase.execute({
        defaultRepliesSortOrder: input.defaultRepliesSortOrder ?? OrderEnum.Ascending,
        getRepliesInput: input.getRepliesInput,
        repliesFound: this.spyOutputBoundary('repliesFound')
      })
    )
    return this
  }
}
