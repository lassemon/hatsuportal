import { unixtimeNow } from '@hatsuportal/common'
import { PersistenceHarness } from '../persistence/PersistenceHarness'

type InsertImagesForeignKeyStubOptions = {
  id: string
  createdById: string
}

/** Satisfies Postgres FK to images(id) — not testing mediaManagement. */
export async function insertImagesForeignKeyStub(
  persistenceHarness: PersistenceHarness,
  { id, createdById }: InsertImagesForeignKeyStubOptions
): Promise<void> {
  const now = unixtimeNow()
  await persistenceHarness.dataAccessProvider
    .table('images')
    .insert({
      id,
      createdById,
      createdAt: now,
      currentVersionId: null
    })
    .onConflict('id')
    .ignore()
}
