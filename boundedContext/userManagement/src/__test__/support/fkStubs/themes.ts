import { DEFAULT_THEME_COLORS } from '@hatsuportal/contracts'
import { unixtimeNow } from '@hatsuportal/common'
import { DefaultThemeId, SystemUserId } from '../../../domain'
import { PersistenceHarness } from '../persistence/PersistenceHarness'
import { insertUsersForeignKeyStub } from './users'

/** Satisfies Postgres FK to themes(id) — inserts Default theme aligned with contracts. */
export async function insertDefaultThemeForeignKeyStub(persistenceHarness: PersistenceHarness): Promise<void> {
  await insertUsersForeignKeyStub(persistenceHarness, {
    id: new SystemUserId().value,
    email: 'system@hatsuportal.internal',
    name: 'System'
  })

  const now = unixtimeNow()
  await persistenceHarness.dataAccessProvider
    .table('themes')
    .insert({
      id: new DefaultThemeId().value,
      name: 'Default',
      lightColors: DEFAULT_THEME_COLORS.lightColors,
      darkColors: DEFAULT_THEME_COLORS.darkColors,
      createdById: new SystemUserId().value,
      createdAt: now,
      updatedAt: now
    })
    .onConflict('id')
    .ignore()
}

export async function deleteDefaultThemeForeignKeyStub(persistenceHarness: PersistenceHarness): Promise<void> {
  await persistenceHarness.dataAccessProvider.table('themes').delete().where('id', new DefaultThemeId().value)
}
