import { unixtimeNow } from '@hatsuportal/common'
import { PersistenceHarness } from '../persistence/PersistenceHarness'

type InsertUsersForeignKeyStubOptions = {
  id: string
  email?: string
  name?: string
}

/** Satisfies Postgres FK to users(id) — not testing userManagement. */
export async function insertUsersForeignKeyStub(
  persistenceHarness: PersistenceHarness,
  { id, email, name }: InsertUsersForeignKeyStubOptions
): Promise<void> {
  const now = unixtimeNow()
  await persistenceHarness.dataAccessProvider
    .table('users')
    .insert({
      id,
      name: name ?? 'foreign-key-stub-user',
      password: '$2a$10$lZzKUHY5zCIbCcfKmv2RaOH412mNfemffeQUBKpGqsWOrsZZGsJmO',
      email: email ?? `fk-stub${id}@hatsuportal.test`,
      active: true,
      roles: persistenceHarness.dataAccessProvider.raw('?::jsonb', ['[]']),
      createdAt: now,
      updatedAt: now
    })
    .onConflict('id')
    .ignore()
}
