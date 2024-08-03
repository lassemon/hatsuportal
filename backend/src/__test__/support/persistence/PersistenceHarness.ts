import { PersistenceHarnessBase, wirePersistenceHarness } from '@hatsuportal/platform/test'

export class PersistenceHarness extends PersistenceHarnessBase {
  private static readonly ownedTableNames = [
    'domain_event_outbox',
    'comments',
    'post_tag_links',
    'post_image_links',
    'stories',
    'posts',
    'image_versions',
    'images',
    'tags',
    'user_preferences',
    'user_image_links',
    'user_profiles',
    'themes',
    'users'
  ] as const

  static connect(databaseUrl?: string): PersistenceHarness {
    const url = databaseUrl ?? process.env.TEST_DATABASE_URL ?? 'postgres://test:test@localhost:5433/hatsuportal_test'

    const { dataAccessProvider, repositoryHelpers, transactionContext, domainEventService, unitOfWork } = wirePersistenceHarness(url)

    return new PersistenceHarness(dataAccessProvider, repositoryHelpers, transactionContext, domainEventService, unitOfWork)
  }

  async clearOwnedTables(): Promise<void> {
    await this.clearTables(PersistenceHarness.ownedTableNames)
  }
}
