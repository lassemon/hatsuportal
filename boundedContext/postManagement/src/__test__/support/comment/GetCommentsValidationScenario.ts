import { vi } from 'vitest'
import { CommentValidationOnlyScenarioBase } from './CommentValidationOnlyScenarioBase'
import { GetCommentsUseCaseWithValidation } from '../../../application/useCases/comment/GetCommentsUseCase/GetCommentsUseCaseWithValidation'
import {
  IGetCommentsUseCase,
  IGetCommentsUseCaseOptions
} from '../../../application/useCases/comment/GetCommentsUseCase/GetCommentsUseCase'

export class GetCommentsValidationScenario extends CommentValidationOnlyScenarioBase<IGetCommentsUseCaseOptions, 'commentsFound'> {
  static given() {
    return new GetCommentsValidationScenario()
  }

  private readonly innerUseCaseMock: IGetCommentsUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  private constructor() {
    super(['commentsFound'])
  }

  async whenExecutedWithInput(input: IGetCommentsUseCaseOptions) {
    const wrapped = new GetCommentsUseCaseWithValidation(this.innerUseCaseMock)

    await this.capture(() =>
      wrapped.execute({
        defaultSortOrder: input.defaultSortOrder,
        defaultRepliesPreviewLimit: input.defaultRepliesPreviewLimit,
        getCommentsInput: input.getCommentsInput,
        commentsFound: this.spyOutputBoundary('commentsFound')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
