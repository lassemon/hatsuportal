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
