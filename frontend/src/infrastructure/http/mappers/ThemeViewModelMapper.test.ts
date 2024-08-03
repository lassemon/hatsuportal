import { describe, expect, it } from 'vitest'
import { DEFAULT_THEME_COLORS } from '@hatsuportal/contracts'
import { ThemeViewModel } from 'ui/entities/user/model/ThemeViewModel'
import { ThemeViewModelMapper } from './ThemeViewModelMapper'

describe('ThemeViewModelMapper', () => {
  const themeMapper = new ThemeViewModelMapper()

  const themeResponse = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Default',
    lightColors: DEFAULT_THEME_COLORS.lightColors,
    darkColors: DEFAULT_THEME_COLORS.darkColors,
    createdById: '22222222-2222-2222-2222-222222222222',
    createdAt: 1_700_000_000,
    updatedAt: 1_700_000_100
  }

  it('maps response to ThemeViewModelDTO', () => {
    expect(themeMapper.toDTO(themeResponse)).toStrictEqual({
      id: themeResponse.id,
      name: themeResponse.name,
      lightColors: {
        primary: themeResponse.lightColors.primary,
        backgroundPrimary: themeResponse.lightColors.backgroundPrimary,
        backgroundSecondary: themeResponse.lightColors.backgroundSecondary,
        callToAction: themeResponse.lightColors.callToAction
      },
      darkColors: {
        primary: themeResponse.darkColors.primary,
        backgroundPrimary: themeResponse.darkColors.backgroundPrimary,
        backgroundSecondary: themeResponse.darkColors.backgroundSecondary,
        callToAction: themeResponse.darkColors.callToAction
      },
      createdById: themeResponse.createdById,
      createdAt: themeResponse.createdAt,
      updatedAt: themeResponse.updatedAt
    })
  })

  it('converts response to ThemeViewModel entity', () => {
    const viewModel = themeMapper.toViewModel(themeResponse)

    expect(viewModel).toBeInstanceOf(ThemeViewModel)
    expect(viewModel.id).toBe(themeResponse.id)
    expect(viewModel.displayColors).toStrictEqual({
      lightColors: themeResponse.lightColors,
      darkColors: themeResponse.darkColors
    })
  })
})
