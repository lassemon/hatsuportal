import { afterEach, describe, expect, it, vi } from 'vitest'
import { DataPersistenceError } from '@hatsuportal/common-bounded-context'
import { EntityTypeEnum } from '@hatsuportal/common'
import { CreateImageScenario } from '../../../../__test__/support/image/CreateImageScenario'

describe('CreateImageUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (userId: string): any => ({
    loggedInUserId: userId,
    createImageData: {
      fileName: 'sample.png',
      mimeType: 'image/png',
      size: 100,
      base64: 'data:image/png;base64,AAA',
      ownerEntityId: 'owner-1-923ads323-agjgu-234234234-kghadsi',
      ownerEntityType: EntityTypeEnum.Story
    }
  })

  it('should create image successfully and emit ImageCreatedEvent', async ({ unitFixture }) => {
    const scenario = await CreateImageScenario.given().withLoggedInUser().whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario
      .thenOutputBoundaryCalled('imageCreated', expect.any(Object))
      .thenDomainEventsEmitted('ImageCreatedEvent')
      .thenTransactionCommitted()
  })

  it('should not call output boundary and rollback transaction when repository fails', async ({ unitFixture }) => {
    const scenario = await CreateImageScenario.given()
      .repositoryWillReject('insert', new Error('DB fail'))
      .expectErrorOfType(DataPersistenceError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('imageCreated').thenTransactionRolledBack()
  })

  it('should not call output boundary when transaction manager fails', async ({ unitFixture }) => {
    const scenario = await CreateImageScenario.given()
      .transactionWillReject(new Error('tx fail'))
      .expectErrorOfType(Error)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('imageCreated')
  })
})
