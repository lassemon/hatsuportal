import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { ICreateStagedImageVersionUseCase } from '../../useCases/CreateStagedImageVersionUseCase/CreateStagedImageVersionUseCase'
import { IPromoteImageVersionUseCase } from '../../useCases/PromoteImageVersionUseCase/PromoteImageVersionUseCase'
import { IDeleteImageUseCase } from '../../useCases/DeleteImageUseCase/DeleteImageUseCase'
import { IMediaCommandMapper } from './mappers/MediaCommandMapper'
import { IStagedImageFactory } from '../../factories/StagedImageFactory'
import { IImagePersistenceService } from '../../services/image/ImagePersistenceService'

/**
 * Anti-corruption facade for cross-context media commands.
 *
 * Staged-image workflow methods ({@link prepareStagedImageFile},
 * {@link registerPreparedStagedImageFileRollbackCleanup}, {@link saveStagedImageMetadata})
 * are integration workflow operations exposed so other bounded contexts can compose
 * them inside a shared Unit of Work — not end-user application use cases.
 */
export class MediaCommandFacade implements mediaV1.IMediaCommandFacade {
  constructor(
    private readonly imagePersistenceService: IImagePersistenceService,
    private readonly stagedImageFactory: IStagedImageFactory,
    private readonly createStagedImageVersionUseCase: ICreateStagedImageVersionUseCase,
    private readonly promoteImageVersionUseCase: IPromoteImageVersionUseCase,
    private readonly deleteImageUseCase: IDeleteImageUseCase,
    private readonly mediaCommandMapper: IMediaCommandMapper
  ) {}

  async prepareStagedImageFile(command: mediaV1.CreateStagedImageCommand): Promise<mediaV1.PreparedStagedImageContract> {
    const createImageInput = this.mediaCommandMapper.toCreateStagedImageVersionInput(command)
    const stagedImage = this.stagedImageFactory.createFromInput(command.createdById, createImageInput)
    const prepared = await this.imagePersistenceService.prepareStagedImageFile(stagedImage)
    return this.mediaCommandMapper.toPreparedStagedImageContract(prepared)
  }

  async registerPreparedStagedImageFileRollbackCleanup(prepared: mediaV1.PreparedStagedImageContract): Promise<void> {
    this.imagePersistenceService.registerPreparedStagedImageFileRollbackCleanup(
      this.mediaCommandMapper.fromPreparedStagedImageContract(prepared)
    )
  }

  async saveStagedImageMetadata(prepared: mediaV1.PreparedStagedImageContract): Promise<void> {
    const dto = this.mediaCommandMapper.fromPreparedStagedImageContract(prepared)
    const stagedImage = this.stagedImageFactory.fromPreparedDTO(dto)
    await this.imagePersistenceService.saveStagedImageMetadata(stagedImage)
  }

  async createStagedImageVersion(command: mediaV1.CreateStagedImageCommand): Promise<mediaV1.CreateStagedImageVersionResult> {
    const createImageInput = this.mediaCommandMapper.toCreateStagedImageVersionInput(command)
    return new Promise<mediaV1.CreateStagedImageVersionResult>((resolve, reject) => {
      this.createStagedImageVersionUseCase
        .execute({
          createdById: command.createdById,
          createImageInput,
          imageCreated: (imageId, stagedVersionId) => {
            resolve(
              this.mediaCommandMapper.toCreateStagedImageVersionResult({
                createdById: command.createdById,
                imageId,
                stagedVersionId
              })
            )
          }
        })
        .catch(reject)
    })
  }

  async promoteImageVersion(command: mediaV1.PromoteImageVersionCommand): Promise<void> {
    const promoteImageVersionInput = this.mediaCommandMapper.toPromoteImageVersionInput(command)
    return new Promise<void>((resolve, reject) => {
      this.promoteImageVersionUseCase
        .execute({
          promotedById: command.promotedById,
          imageId: promoteImageVersionInput.imageId,
          stagedVersionId: promoteImageVersionInput.stagedVersionId,
          imagePromoted: () => {
            resolve()
          }
        })
        .catch(reject)
    })
  }

  async deleteImage(command: mediaV1.DeleteImageCommand): Promise<void> {
    const deleteImageInput = this.mediaCommandMapper.toDeleteImageInput(command)
    return new Promise<void>((resolve, reject) => {
      this.deleteImageUseCase
        .execute({
          deletedById: command.deletedById,
          deleteImageInput,
          imageDeleted: () => {
            resolve()
          }
        })
        .catch(reject)
    })
  }
}
