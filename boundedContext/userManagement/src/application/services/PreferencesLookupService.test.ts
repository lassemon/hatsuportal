import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_THEME_COLORS } from '@hatsuportal/contracts'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { sampleUserId } from '@hatsuportal/shared-kernel/test'
import { DefaultThemeId, SystemUserId, Theme, ThemeColors, ThemeId, ThemeName, UserId } from '../../domain'
import { PreferencesLookupService } from './PreferencesLookupService'
import { IThemeRepository } from '../../domain/repositories/IThemeRepository'
import { ThemeApplicationMapper } from '../mappers/ThemeApplicationMapper'
import { UserApplicationMapper } from '../mappers/UserApplicationMapper'
import { IUserReadRepository } from '../read/IUserReadRepository'
import { userReadRepositoryMock } from '../../__test__/testFactory'

describe('PreferencesLookupService', () => {
  const themeMapper = new ThemeApplicationMapper()
  const userMapper = new UserApplicationMapper()
  const createdAt = 1_700_000_000
  const updatedAt = 1_700_000_100

  const defaultThemeEntity = (): Theme =>
    Theme.reconstruct({
      id: new DefaultThemeId(),
      name: new ThemeName('Default'),
      lightColors: ThemeColors.reconstruct(DEFAULT_THEME_COLORS.lightColors),
      darkColors: ThemeColors.reconstruct(DEFAULT_THEME_COLORS.darkColors),
      createdById: new SystemUserId(),
      createdAt: new CreatedAtTimestamp(createdAt),
      updatedAt: new UnixTimestamp(updatedAt)
    })

  const buildService = (userReadRepository: IUserReadRepository, themeRepository: IThemeRepository) =>
    new PreferencesLookupService(userReadRepository, userMapper, themeRepository, themeMapper)

  it('returns null when user is not found', async () => {
    const userReadRepository = userReadRepositoryMock()
    userReadRepository.findById.mockResolvedValue(null)

    const result = await buildService(userReadRepository, {} as IThemeRepository).findByUserId(new UserId(sampleUserId))

    expect(result).toBeNull()
  })

  it('returns enriched preferences when selected theme is found', async ({ unitFixture }) => {
    const customTheme = unitFixture.themeMock()
    const readModel = unitFixture.userReadModelDTOMock({ selectedThemeId: customTheme.id.value })

    const userReadRepository = userReadRepositoryMock()
    userReadRepository.findById.mockResolvedValue(readModel)

    const themeRepository: IThemeRepository = {
      findById: vi.fn().mockResolvedValue(customTheme),
      findByIdForUpdate: vi.fn(),
      findAll: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }

    const result = await buildService(userReadRepository, themeRepository).findByUserId(new UserId(readModel.id))

    expect(result?.selectedThemeId).toBe(customTheme.id.value)
    expect(result?.selectedTheme.id).toBe(customTheme.id.value)
    expect(result?.selectedThemeId).toBe(result?.selectedTheme.id)
  })

  it('falls back to Default theme and normalizes selectedThemeId when selected theme is missing', async ({ unitFixture }) => {
    const defaultTheme = defaultThemeEntity()
    const orphanId = '99999999-9999-4999-8999-999999999999'
    const readModel = unitFixture.userReadModelDTOMock({ selectedThemeId: orphanId })

    const userReadRepository = userReadRepositoryMock()
    userReadRepository.findById.mockResolvedValue(readModel)

    const themeRepository: IThemeRepository = {
      findById: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(defaultTheme),
      findByIdForUpdate: vi.fn(),
      findAll: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }

    const result = await buildService(userReadRepository, themeRepository).findByUserId(new UserId(readModel.id))

    expect(themeRepository.findById).toHaveBeenCalledWith(new ThemeId(orphanId))
    expect(themeRepository.findById).toHaveBeenCalledWith(new DefaultThemeId())
    expect(result?.selectedThemeId).toBe(new DefaultThemeId().value)
    expect(result?.selectedThemeId).toBe(result?.selectedTheme.id)
  })

  it('throws when selected theme and Default theme are both missing', async ({ unitFixture }) => {
    const readModel = unitFixture.userReadModelDTOMock()

    const userReadRepository = userReadRepositoryMock()
    userReadRepository.findById.mockResolvedValue(readModel)

    const themeRepository: IThemeRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByIdForUpdate: vi.fn(),
      findAll: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }

    await expect(buildService(userReadRepository, themeRepository).findByUserId(new UserId(readModel.id))).rejects.toThrow(
      'Default theme missing'
    )
  })

  it('invalidates user read cache by user id', () => {
    const userReadRepository = userReadRepositoryMock()
    const userId = new UserId(sampleUserId)

    buildService(userReadRepository, {} as IThemeRepository).invalidateByUserId(userId)

    expect(userReadRepository.invalidateById).toHaveBeenCalledWith(userId)
  })
})
