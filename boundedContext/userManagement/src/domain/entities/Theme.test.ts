import { describe, expect, it } from 'vitest'
import { unixtimeNow, uuid } from '@hatsuportal/common'
import { CreatedAtTimestamp, UnixTimestamp, UniqueId } from '@hatsuportal/shared-kernel'
import { CannotDeleteDefaultThemeError } from '../errors/CannotDeleteDefaultThemeError'
import { DefaultThemeId } from '../valueObjects/DefaultThemeId'
import { ThemeId } from '../valueObjects/ThemeId'
import { ThemeName } from '../valueObjects/ThemeName'
import { UserId } from '../valueObjects/UserId'
import { Theme } from './Theme'
import { SystemUserId } from '../valueObjects/SystemUserId'
import { ThemeColors } from '../valueObjects/ThemeColors'

describe('Theme', () => {
  const buildTheme = (lightColors: ThemeColors, darkColors: ThemeColors) =>
    Theme.create({
      id: new ThemeId(uuid()),
      name: new ThemeName('Custom'),
      lightColors: lightColors,
      darkColors: darkColors,
      createdById: new UserId(uuid()),
      createdAt: new CreatedAtTimestamp(unixtimeNow()),
      updatedAt: new UnixTimestamp(unixtimeNow())
    })

  it('delete throws for the default theme id', ({ unitFixture }) => {
    const defaultTheme = Theme.reconstruct({
      id: new DefaultThemeId(),
      name: new ThemeName('Default'),
      lightColors: unitFixture.lightThemeColorsMock(),
      darkColors: unitFixture.darkThemeColorsMock(),
      createdById: new SystemUserId(),
      createdAt: new CreatedAtTimestamp(unixtimeNow()),
      updatedAt: new UnixTimestamp(unixtimeNow())
    })

    expect(() => defaultTheme.delete(new UniqueId(new DefaultThemeId().value))).toThrow(CannotDeleteDefaultThemeError)
  })

  it('delete succeeds for non-default themes', ({ unitFixture }) => {
    const theme = buildTheme(unitFixture.lightThemeColorsMock(), unitFixture.darkThemeColorsMock())
    expect(() => theme.delete(new UniqueId(uuid()))).not.toThrow()
  })
})
