import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { unixtimeNow, uuid } from '@hatsuportal/common'
import { CreatedAtTimestamp, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { DefaultThemeId, SystemUserId, Theme, ThemeId, ThemeName } from '../../../../domain'
import { ThemeRepository } from '../../../../infrastructure/repositories/ThemeRepository'
import { ThemeInfrastructureMapper } from '../../../../infrastructure/mappers/ThemeInfrastructureMapper'
import { persistenceHarness } from '../../../setup.db'
import { insertUsersForeignKeyStub } from '../../../support/fkStubs/users'

describe('ThemeRepository (integration)', () => {
  let repository: ThemeRepository

  beforeAll(() => {
    repository = new ThemeRepository(
      persistenceHarness.dataAccessProvider,
      persistenceHarness.repositoryHelpers,
      persistenceHarness.transactionContext,
      new ThemeInfrastructureMapper()
    )
  })

  beforeEach(async () => {
    await insertUsersForeignKeyStub(persistenceHarness, {
      id: new SystemUserId().value,
      email: 'system@hatsuportal.internal',
      name: 'System'
    })
  })

  it('inserts and loads a theme', async ({ unitFixture }) => {
    const theme = Theme.create({
      id: new ThemeId(uuid()),
      name: new ThemeName('Ocean'),
      lightColors: unitFixture.lightThemeColorsMock(),
      darkColors: unitFixture.darkThemeColorsMock(),
      createdById: new SystemUserId(),
      createdAt: new CreatedAtTimestamp(unixtimeNow()),
      updatedAt: new UnixTimestamp(unixtimeNow())
    })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.insert(theme)
      return [null]
    })

    const loaded = await repository.findById(theme.id)
    expect(loaded?.name.value).toBe('Ocean')
  })

  it('findAll includes inserted themes', async ({ unitFixture }) => {
    const theme = Theme.create({
      id: new ThemeId(uuid()),
      name: new ThemeName('Forest'),
      lightColors: unitFixture.lightThemeColorsMock(),
      darkColors: unitFixture.darkThemeColorsMock(),
      createdById: new SystemUserId(),
      createdAt: new CreatedAtTimestamp(unixtimeNow()),
      updatedAt: new UnixTimestamp(unixtimeNow())
    })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.insert(theme)
      return [null]
    })

    const all = await repository.findAll()
    expect(all.some((entry) => entry.id.value === theme.id.value)).toBe(true)
  })

  it('updates a theme inside a unit of work', async ({ unitFixture }) => {
    const theme = Theme.create({
      id: new ThemeId(uuid()),
      name: new ThemeName('Before'),
      lightColors: unitFixture.lightThemeColorsMock(),
      darkColors: unitFixture.darkThemeColorsMock(),
      createdById: new SystemUserId(),
      createdAt: new CreatedAtTimestamp(unixtimeNow()),
      updatedAt: new UnixTimestamp(unixtimeNow())
    })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.insert(theme)
      return [null]
    })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const existing = await repository.findByIdForUpdate(theme.id)
      if (!existing) throw new Error('expected theme')
      const updated = existing.clone()
      updated.rename(new ThemeName('After'))
      await repository.update(updated)
      return [null]
    })

    const loaded = await repository.findById(theme.id)
    expect(loaded?.name.value).toBe('After')
  })

  it('can load the default theme stub id', async ({ unitFixture }) => {
    const now = unixtimeNow()
    await persistenceHarness.dataAccessProvider
      .table('themes')
      .insert({
        id: new DefaultThemeId().value,
        name: 'Default',
        lightColors: unitFixture.lightThemeColorsMock().serialize(),
        darkColors: unitFixture.darkThemeColorsMock().serialize(),
        createdById: new SystemUserId().value,
        createdAt: now,
        updatedAt: now
      })
      .onConflict('id')
      .ignore()

    const loaded = await repository.findById(new DefaultThemeId())
    expect(loaded?.id.value).toBe(new DefaultThemeId().value)
  })
})
