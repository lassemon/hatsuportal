import { afterEach, describe, it, vi } from 'vitest'
import { AuthenticationError, AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { UserRoleEnum } from '@hatsuportal/common'
import { DefaultThemeId, IThemeRepository, UserId, UserRole } from '../../../../domain'
import { UpdateUserPreferencesUseCaseWithValidation } from './UpdateUserPreferencesUseCaseWithValidation'
import { IUpdateUserPreferencesUseCase } from './UpdateUserPreferencesUseCase'
import { UserValidationScenarioBase } from '../../../../__test__/support/user/UserValidationScenarioBase'

class UpdateUserPreferencesValidationScenario extends UserValidationScenarioBase<
  { updatedById: string; userId: string; selectedThemeId?: string; colorScheme?: string },
  'userPreferencesUpdated'
> {
  static given() {
    return new UpdateUserPreferencesValidationScenario()
  }

  private readonly innerUseCaseMock: IUpdateUserPreferencesUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  readonly themeRepository: IThemeRepository = {
    findById: vi.fn(),
    findByIdForUpdate: vi.fn(),
    findAll: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }

  private constructor() {
    super(['userPreferencesUpdated'])
  }

  async whenExecutedWithInput(input: { updatedById: string; userId: string; selectedThemeId?: string; colorScheme?: string }) {
    const wrapped = new UpdateUserPreferencesUseCaseWithValidation(
      this.innerUseCaseMock,
      this.userReadRepository,
      this.themeRepository,
      this.authorizationService
    )

    await this.capture(() =>
      wrapped.execute({
        updatedById: input.updatedById,
        userId: input.userId,
        updateUserPreferencesInput: {
          selectedThemeId: input.selectedThemeId,
          colorScheme: input.colorScheme
        },
        userPreferencesUpdated: this.spyOutputBoundary('userPreferencesUpdated'),
        updateConflict: vi.fn()
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}

describe('UpdateUserPreferencesUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  it('throws NotFoundError for invalid selectedThemeId', async ({ unitFixture }) => {
    const user = unitFixture.userMock({ roles: [new UserRole(UserRoleEnum.Viewer)] })
    const scenario = UpdateUserPreferencesValidationScenario.given().withUsers([user])
    vi.mocked(scenario.themeRepository.findById).mockResolvedValue(null)

    await scenario
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        updatedById: user.id.value,
        userId: user.id.value,
        selectedThemeId: '00000000-0000-4000-8000-000000000099'
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('delegates when selectedThemeId exists', async ({ unitFixture }) => {
    const user = unitFixture.userMock({ roles: [new UserRole(UserRoleEnum.Viewer)] })
    const scenario = UpdateUserPreferencesValidationScenario.given().withUsers([user])
    vi.mocked(scenario.themeRepository.findById).mockResolvedValue(unitFixture.themeMock())

    await scenario.whenExecutedWithInput({
      updatedById: user.id.value,
      userId: user.id.value,
      selectedThemeId: new DefaultThemeId().value
    })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('throws AuthorizationError for non-self update', async ({ unitFixture }) => {
    const viewer = unitFixture.userMock({ roles: [new UserRole(UserRoleEnum.Viewer)] })
    const other = unitFixture.userMock({ id: new UserId(`${viewer.id.value}-other`) })
    const scenario = UpdateUserPreferencesValidationScenario.given()
      .withUsers([viewer, other])
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)

    await scenario.whenExecutedWithInput({
      updatedById: viewer.id.value,
      userId: other.id.value,
      colorScheme: 'dark'
    })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('throws AuthenticationError when requester is not logged in', async ({ unitFixture }) => {
    const scenario = UpdateUserPreferencesValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)

    await scenario.whenExecutedWithInput({
      updatedById: unitFixture.sampleUserId,
      userId: unitFixture.sampleUserId
    })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
