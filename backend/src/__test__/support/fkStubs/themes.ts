import { DEFAULT_THEME_COLORS } from '@hatsuportal/contracts'
import { unixtimeNow } from '@hatsuportal/common'
import { DefaultThemeId, SystemUserId } from '@hatsuportal/user-management'
import { PersistenceHarness } from '../persistence/PersistenceHarness'
import { insertUsersForeignKeyStub } from './users'

export async function insertDefaultThemeForeignKeyStub(persistenceHarness: PersistenceHarness): Promise<void> {
  await insertUsersForeignKeyStub(persistenceHarness, {
    id: new SystemUserId().value
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
