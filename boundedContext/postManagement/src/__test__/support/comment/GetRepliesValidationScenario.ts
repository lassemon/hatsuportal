import { vi } from 'vitest'
import { CommentValidationOnlyScenarioBase } from './CommentValidationOnlyScenarioBase'
import { GetRepliesUseCaseWithValidation } from '../../../application/useCases/comment/GetRepliesUseCase/GetRepliesUseCaseWithValidation'
import {
  IGetRepliesUseCase,
  IGetRepliesUseCaseOptions
} from '../../../application/useCases/comment/GetRepliesUseCase/GetRepliesUseCase'

export class GetRepliesValidationScenario extends CommentValidationOnlyScenarioBase<IGetRepliesUseCaseOptions, 'repliesFound'> {
  static given() {
    return new GetRepliesValidationScenario()
  }

  private readonly innerUseCaseMock: IGetRepliesUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  private constructor() {
    super(['repliesFound'])
  }

  async whenExecutedWithInput(input: IGetRepliesUseCaseOptions) {
    const wrapped = new GetRepliesUseCaseWithValidation(this.innerUseCaseMock)

    await this.capture(() =>
      wrapped.execute({
        defaultRepliesSortOrder: input.defaultRepliesSortOrder,
        getRepliesInput: input.getRepliesInput,
        repliesFound: this.spyOutputBoundary('repliesFound')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
