import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { ICreateStagedImageVersionUseCase } from '../../useCases/CreateStagedImageVersionUseCase/CreateStagedImageVersionUseCase'
import { IPromoteImageVersionUseCase } from '../../useCases/PromoteImageVersionUseCase/PromoteImageVersionUseCase'
import { IDiscardImageVersionUseCase } from '../../useCases/DiscardImageVersionUseCase/DiscardImageVersionUseCase'
import { IDeleteImageUseCase } from '../../useCases/DeleteImageUseCase/DeleteImageUseCase'
import { IMediaCommandMapper } from './mappers/MediaCommandMapper'
import { IUpdateImageUseCase } from '../../useCases/UpdateImageUseCase/UpdateImageUseCase'
import { ImageDTO } from '../../dtos'

export class MediaCommandFacade implements mediaV1.IMediaCommandFacade {
  constructor(
    private readonly createStagedImageVersionUseCase: ICreateStagedImageVersionUseCase,
    private readonly promoteImageVersionUseCase: IPromoteImageVersionUseCase,
    private readonly discardImageVersionUseCase: IDiscardImageVersionUseCase,
    private readonly updateImageUseCase: IUpdateImageUseCase,
    private readonly deleteImageUseCase: IDeleteImageUseCase,
    private readonly mediaCommandMapper: IMediaCommandMapper
  ) {}

  async createStagedImageVersion(command: mediaV1.CreateStagedImageCommand): Promise<mediaV1.CreateStagedImageVersionResult> {
    const createImageInput = this.mediaCommandMapper.toCreateStagedImageVersionInput(command)
    return new Promise<mediaV1.CreateStagedImageVersionResult>((resolve, reject) => {
      this.createStagedImageVersionUseCase
        .execute({
          createdById: command.createdById,
          createImageInput,
          imageCreated: (imageId, stagedVersionId) => {
            resolve(this.mediaCommandMapper.toCreateStagedImageVersionResult({ imageId, stagedVersionId }))
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
          imageId: promoteImageVersionInput.imageId,
          stagedVersionId: promoteImageVersionInput.stagedVersionId,
          imagePromoted: () => {
            resolve()
          }
        })
        .then(resolve)
        .catch(reject)
    })
  }

  async discardImageVersion(command: mediaV1.DiscardImageVersionCommand): Promise<void> {
    const discardImageVersionInput = this.mediaCommandMapper.toDiscardImageVersionInput(command)
    return new Promise<void>((resolve, reject) => {
      this.discardImageVersionUseCase
        .execute({
          imageId: discardImageVersionInput.imageId,
          stagedVersionId: discardImageVersionInput.stagedVersionId,
          imageDiscarded: () => {
            resolve()
          }
        })
        .then(resolve)
        .catch(reject)
    })
  }

  async updateImage(command: mediaV1.UpdateImageCommand): Promise<mediaV1.UpdateImageResult> {
    const updateImageInput = this.mediaCommandMapper.toUpdateImageInput(command)
    return new Promise<mediaV1.UpdateImageResult>((resolve, reject) => {
      this.updateImageUseCase
        .execute({
          updatedById: command.updatedById,
          updateImageInput,
          imageUpdated: (imageDTO: ImageDTO) => {
            resolve(this.mediaCommandMapper.toUpdateImageResult(imageDTO))
          },
          updateConflict: (error) => {
            reject(error)
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
        .then(resolve)
        .catch(reject)
    })
  }
}
