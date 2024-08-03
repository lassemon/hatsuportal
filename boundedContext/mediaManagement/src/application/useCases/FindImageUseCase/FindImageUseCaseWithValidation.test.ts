import { afterEach, describe, it, vi } from 'vitest'
import { InvalidInputError } from '@hatsuportal/platform'
import { FindImageValidationScenario } from '../../../__test__/support/FindImageValidationScenario'

describe('FindImageUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  const validId = 'image-1234-abcd-1234-efgh-lkjdglfhayk-asdksge-234234234'

  it('should execute inner use case for valid imageId', async () => {
    const scenario = await FindImageValidationScenario.given().whenExecutedWithInput(validId)

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid imageId', async () => {
    const scenario = await FindImageValidationScenario.given().expectErrorOfType(InvalidInputError).whenExecutedWithInput('bad-id')

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
