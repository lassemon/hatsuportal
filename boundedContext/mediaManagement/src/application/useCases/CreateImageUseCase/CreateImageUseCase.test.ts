import { afterEach, describe, expect, it, vi } from 'vitest'
import { CreateImageScenario } from '../../../__test__/support/CreateImageScenario'
import { ICreateImageUseCaseOptions } from './CreateImageUseCase'
import { DataPersistenceError } from '@hatsuportal/platform'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { ImageCreatedEvent } from '../../../domain'

describe('CreateImageUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (userId: string): ICreateImageUseCaseOptions => ({
    createdById: userId,
    createImageInput: {
      ownerEntityType: EntityTypeEnum.Story,
      ownerEntityId: 'owner-1-923ads323-agjgu-234234234-kghadsi',
      role: ImageRoleEnum.Cover,
      mimeType: 'image/png',
      size: 100,
      base64: 'data:image/png;base64,AAA'
    },
    imageCreated: vi.fn()
  })

  it('should create image successfully and emit ImageCreatedEvent', async ({ unitFixture }) => {
    const scenario = await CreateImageScenario.given().withLoggedInUser().whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenOutputBoundaryCalled('imageCreated', expect.any(Object)).thenDomainEventsPersisted([expect.any(ImageCreatedEvent)])
  })

  it('should not call output boundary when repository fails', async ({ unitFixture }) => {
    const scenario = await CreateImageScenario.given()
      .persistenceServiceWillReject(['persistCurrent'], new DataPersistenceError('DB fail'))
      .expectErrorOfType(DataPersistenceError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenOutputBoundaryNotCalled('imageCreated')
  })

  it('should not call output boundary when domain event service fails', async ({ unitFixture }) => {
    const scenario = await CreateImageScenario.given()
      .domainEventServiceWillReject(new Error('Domain event service failure'))
      .expectErrorOfType(Error)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenOutputBoundaryNotCalled('imageCreated')
  })
})
