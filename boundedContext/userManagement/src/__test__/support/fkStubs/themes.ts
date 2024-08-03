import { unixtimeNow } from '@hatsuportal/common'
import { DefaultThemeId, SystemUserId } from '../../../domain'
import { PersistenceHarness } from '../persistence/PersistenceHarness'
import { insertUsersForeignKeyStub } from './users'

/** Satisfies Postgres FK to themes(id) — inserts the platform default theme row. */
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
      lightColors: {
        primary: '#F1F3F5',
        backgroundSecondary: '#21252A',
        backgroundPrimary: '#131D29',
        callToAction: '#BFFA00'
      },
      darkColors: {
        primary: '#0C2A28',
        backgroundSecondary: '#FFFFFF',
        backgroundPrimary: '#F8F4F2',
        callToAction: '#CD5B43'
      },
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
