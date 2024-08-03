import { describe, expect, it, vi, afterEach } from 'vitest'
import { ConflictError, NotFoundError } from '@hatsuportal/platform'
import { CannotDeleteDefaultThemeError, DefaultThemeId, Theme, ThemeColors, ThemeId, ThemeName } from '../../../../domain'
import { DeleteThemeUseCase } from './DeleteThemeUseCase'
import { IThemeRepository } from '../../../../domain/repositories/IThemeRepository'
import { IUserReadRepository } from '../../../read/IUserReadRepository'
import { IUnitOfWork } from '@hatsuportal/platform'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { SystemUserId } from '../../../../domain/valueObjects/SystemUserId'

describe('DeleteThemeUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const themeRepository: IThemeRepository = {
    findById: vi.fn(),
    findByIdForUpdate: vi.fn(),
    findAll: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }

  const userReadRepository: IUserReadRepository = {
    findById: vi.fn(),
    findAll: vi.fn(),
    findByName: vi.fn(),
    findAllReferencedProfileImageIds: vi.fn(),
    findByProfileImageId: vi.fn(),
    findUserIdsBySelectedThemeId: vi.fn(),
    invalidateById: vi.fn()
  }

  const unitOfWork: IUnitOfWork = {
    execute: vi.fn(async (callback) => callback())
  }

  const useCase = new DeleteThemeUseCase(themeRepository, userReadRepository, unitOfWork)

  const buildCustomTheme = (unitFixture: { lightThemeColorsMock: () => ThemeColors; darkThemeColorsMock: () => ThemeColors }) =>
    Theme.create({
      id: new ThemeId('11111111-1111-4111-8111-111111111111'),
      name: new ThemeName('Custom'),
      lightColors: unitFixture.lightThemeColorsMock(),
      darkColors: unitFixture.darkThemeColorsMock(),
      createdById: new SystemUserId(),
      createdAt: new CreatedAtTimestamp(1),
      updatedAt: new UnixTimestamp(1)
    })

  it('throws ConflictError when theme is still selected by users', async ({ unitFixture }) => {
    const theme = buildCustomTheme(unitFixture)
    vi.mocked(userReadRepository.findUserIdsBySelectedThemeId).mockResolvedValue(['user-1'])
    vi.mocked(themeRepository.findById).mockResolvedValue(theme)

    await expect(
      useCase.execute({
        deletedById: unitFixture.sampleUserId,
        deleteThemeInput: { themeIdToDelete: theme.id.value },
        themeDeleted: vi.fn(),
        deleteConflict: vi.fn()
      })
    ).rejects.toBeInstanceOf(ConflictError)

    expect(themeRepository.delete).not.toHaveBeenCalled()
  })

  it('throws CannotDeleteDefaultThemeError when deleting the default theme', async ({ unitFixture }) => {
    const defaultTheme = Theme.reconstruct({
      id: new DefaultThemeId(),
      name: new ThemeName('Default'),
      lightColors: unitFixture.lightThemeColorsMock(),
      darkColors: unitFixture.darkThemeColorsMock(),
      createdById: new SystemUserId(),
      createdAt: new CreatedAtTimestamp(1),
      updatedAt: new UnixTimestamp(1)
    })

    vi.mocked(userReadRepository.findUserIdsBySelectedThemeId).mockResolvedValue([])
    vi.mocked(themeRepository.findById).mockResolvedValue(defaultTheme)
    vi.mocked(themeRepository.findByIdForUpdate).mockResolvedValue(defaultTheme)

    await expect(
      useCase.execute({
        deletedById: unitFixture.sampleUserId,
        deleteThemeInput: { themeIdToDelete: defaultTheme.id.value },
        themeDeleted: vi.fn(),
        deleteConflict: vi.fn()
      })
    ).rejects.toBeInstanceOf(CannotDeleteDefaultThemeError)
  })

  it('deletes an unused custom theme', async ({ unitFixture }) => {
    const theme = buildCustomTheme(unitFixture)
    const themeDeleted = vi.fn()

    vi.mocked(userReadRepository.findUserIdsBySelectedThemeId).mockResolvedValue([])
    vi.mocked(themeRepository.findById).mockResolvedValue(theme)
    vi.mocked(themeRepository.findByIdForUpdate).mockResolvedValue(theme)
    vi.mocked(themeRepository.delete).mockResolvedValue(undefined)

    await useCase.execute({
      deletedById: unitFixture.sampleUserId,
      deleteThemeInput: { themeIdToDelete: theme.id.value },
      themeDeleted,
      deleteConflict: vi.fn()
    })

    expect(themeDeleted).toHaveBeenCalledTimes(1)
    expect(themeRepository.delete).toHaveBeenCalledTimes(1)
    expect(vi.mocked(themeRepository.delete).mock.calls[0][0].id.value).toBe(theme.id.value)
  })

  it('throws NotFoundError when theme does not exist', async ({ unitFixture }) => {
    vi.mocked(userReadRepository.findUserIdsBySelectedThemeId).mockResolvedValue([])
    vi.mocked(themeRepository.findById).mockResolvedValue(null)

    await expect(
      useCase.execute({
        deletedById: unitFixture.sampleUserId,
        deleteThemeInput: { themeIdToDelete: '00000000-0000-4000-8000-000000000099' },
        themeDeleted: vi.fn(),
        deleteConflict: vi.fn()
      })
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})
