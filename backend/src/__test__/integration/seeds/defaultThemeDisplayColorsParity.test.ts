import { TestKnexDataAccessProvider } from '@hatsuportal/platform/test'
import { readFileSync } from 'fs'
import { join } from 'path'
import { beforeAll, describe, expect, it } from 'vitest'
import { DEFAULT_THEME_COLORS } from '@hatsuportal/contracts'
import { DefaultThemeId, ThemeInfrastructureMapper, ThemeRepository } from '@hatsuportal/user-management'
import { persistenceHarness } from '../../setup.db'

describe('defaultThemeDisplayColorsParity (integration)', () => {
  let repository: ThemeRepository

  beforeAll(() => {
    repository = new ThemeRepository(
      persistenceHarness.dataAccessProvider,
      persistenceHarness.repositoryHelpers,
      persistenceHarness.transactionContext,
      new ThemeInfrastructureMapper()
    )
  })

  it('matches 001_bootstrap.sql Default theme row to DEFAULT_THEME_DISPLAY_COLORS', async () => {
    await persistenceHarness.clearOwnedTables()
    const bootstrapSql = readFileSync(join(__dirname, '../../../../seeds/001_bootstrap.sql'), 'utf8')
    const provider = persistenceHarness.dataAccessProvider as TestKnexDataAccessProvider
    await provider.raw(bootstrapSql, [])

    const theme = await repository.findById(new DefaultThemeId())
    expect(theme).not.toBeNull()

    expect(theme!.lightColors.serialize()).toStrictEqual(DEFAULT_THEME_COLORS.lightColors)
    expect(theme!.darkColors.serialize()).toStrictEqual(DEFAULT_THEME_COLORS.darkColors)
  })
})
