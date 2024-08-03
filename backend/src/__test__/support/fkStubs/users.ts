import { unixtimeNow, UserRoleEnum } from '@hatsuportal/common'
import { PersistenceHarness } from '../persistence/PersistenceHarness'

type InsertUsersForeignKeyStubOptions = {
  id: string
}

/** Satisfies Postgres FK to users(id) — not testing userManagement. */
export async function insertUsersForeignKeyStub(
  persistenceHarness: PersistenceHarness,
  { id }: InsertUsersForeignKeyStubOptions
): Promise<void> {
  const now = unixtimeNow()
  await persistenceHarness.dataAccessProvider.table('users').where('id', id).delete()
  await persistenceHarness.dataAccessProvider.table('users').insert({
    id,
    name: 'foreign-key-stub-user',
    password: '$2a$10$lZzKUHY5zCIbCcfKmv2RaOH412mNfemffeQUBKpGqsWOrsZZGsJmO',
    email: `fk-stub${id}@hatsuportal.test`,
    active: true,
    roles: persistenceHarness.dataAccessProvider.raw('?::jsonb', [JSON.stringify([UserRoleEnum.Viewer])]),
    createdAt: now,
    updatedAt: now
  })
}
