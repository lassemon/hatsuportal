import { InputLimits } from '@hatsuportal/contracts'
import { describe, it, vi, afterEach } from 'vitest'
import { VisibilityEnum, DeepPartial } from '@hatsuportal/common'
import { InvalidInputError, AuthorizationError, AuthenticationError } from '@hatsuportal/platform'
import { CreateStoryValidationScenario } from '../../../../__test__/support/story/CreateStoryValidationScenario'
import { CreateStoryInputDTO } from '../../../dtos'
import { ICreateStoryUseCaseOptions } from '../CreateStoryUseCase'
import { TagInputDTO } from '../../../dtos/useCase/TagInputDTO'

describe('CreateStoryUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (userId: string, customProps: DeepPartial<CreateStoryInputDTO> = {}): ICreateStoryUseCaseOptions => ({
    createdById: userId,
    createStoryInput: {
      title: 'Test Story',
      body: 'Test Body',
      visibility: VisibilityEnum.Public,
      ...customProps,
      tags: (customProps.tags?.filter((tag) => tag !== undefined && tag !== null) as TagInputDTO[]) ?? [],
      image: { mimeType: 'image/png', size: 1, base64: `data:image/png;base64,AAA`, ...customProps.image }
    },
    storyCreated: vi.fn()
  })

  it('should successfully execute create story use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError if loggedInUser does not exist', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withoutLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError if user not allowed to create story', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .authorizationWillFail('not allowed')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.visibility is invalid', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { visibility: 'invalid_visibility' as unknown as VisibilityEnum }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.name is empty', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { title: '', image: null }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.body is empty', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { body: '   ', image: null }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.image.mimeType is invalid', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { image: { mimeType: '' } }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.image.size is not positive', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { image: { size: 0 } }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.image.base64 is invalid', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { image: { base64: '' } }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.title exceeds limit', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { title: 'x'.repeat(InputLimits.postTitle + 1), image: null }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when createStoryData.body exceeds limit', async ({ unitFixture }) => {
    const scenario = await CreateStoryValidationScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { body: 'x'.repeat(InputLimits.storyBody + 1), image: null }))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
