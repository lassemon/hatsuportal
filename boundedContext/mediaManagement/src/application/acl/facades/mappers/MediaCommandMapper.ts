import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { DiscardStagedImageInputDTO } from '../../../dtos/DiscardStagedImageInputDTO'
import { PromoteStagedImageInputDTO } from '../../../dtos/PromoteStagedImageInputDTO'
import { CreateImageInputDTO } from '../../../dtos/CreateImageInputDTO'
import { DeleteImageInputDTO } from '../../../dtos/DeleteImageInputDTO'
import { UpdateImageInputDTO } from '../../../dtos/UpdateImageInputDTO'
import { ImageWithRelationsDTO } from '../../../dtos'

export interface IMediaCommandMapper {
  toCreateStagedImageVersionInput(command: mediaV1.CreateStagedImageCommand): CreateImageInputDTO
  toCreateStagedImageVersionResult(result: { imageId: string; stagedVersionId: string }): mediaV1.CreateStagedImageVersionResult

  toPromoteImageVersionInput(command: mediaV1.PromoteImageVersionCommand): PromoteStagedImageInputDTO

  toDiscardImageVersionInput(command: mediaV1.DiscardImageVersionCommand): DiscardStagedImageInputDTO

  toUpdateImageInput(command: mediaV1.UpdateImageCommand): UpdateImageInputDTO
  toUpdateImageResult(imageWithRelationsDTO: ImageWithRelationsDTO): mediaV1.UpdateImageResult

  toDeleteImageInput(command: mediaV1.DeleteImageCommand): DeleteImageInputDTO
}

export class MediaCommandMapper implements IMediaCommandMapper {
  public toCreateStagedImageVersionInput(command: mediaV1.CreateStagedImageCommand): CreateImageInputDTO {
    return {
      ownerEntityType: command.ownerEntityType,
      ownerEntityId: command.ownerEntityId,
      role: command.role,
      mimeType: command.mimeType,
      size: command.size,
      base64: command.base64
    }
  }

  public toCreateStagedImageVersionResult(result: {
    createdById: string
    imageId: string
    stagedVersionId: string
  }): mediaV1.CreateStagedImageVersionResult {
    return { createdById: result.createdById, imageId: result.imageId, stagedVersionId: result.stagedVersionId }
  }

  public toPromoteImageVersionInput(command: mediaV1.PromoteImageVersionCommand): PromoteStagedImageInputDTO {
    return { promotedById: command.promotedById, imageId: command.imageId, stagedVersionId: command.stagedVersionId }
  }

  public toDiscardImageVersionInput(command: mediaV1.DiscardImageVersionCommand): DiscardStagedImageInputDTO {
    return { discardedById: command.discardedById, imageId: command.imageId, stagedVersionId: command.stagedVersionId }
  }

  public toUpdateImageInput(command: mediaV1.UpdateImageCommand): UpdateImageInputDTO {
    return {
      id: command.imageId,
      mimeType: command.mimeType,
      size: command.size,
      base64: command.base64
    }
  }

  public toUpdateImageResult(imageWithRelationsDTO: ImageWithRelationsDTO): mediaV1.UpdateImageResult {
    return {
      id: imageWithRelationsDTO.id,
      storageKey: imageWithRelationsDTO.storageKey,
      mimeType: imageWithRelationsDTO.mimeType,
      size: imageWithRelationsDTO.size,
      base64: imageWithRelationsDTO.base64,
      currentVersionId: imageWithRelationsDTO.currentVersionId,
      isCurrent: imageWithRelationsDTO.isCurrent,
      isStaged: imageWithRelationsDTO.isStaged,
      createdById: imageWithRelationsDTO.createdById,
      createdAt: imageWithRelationsDTO.createdAt,
      updatedAt: imageWithRelationsDTO.updatedAt
    }
  }

  public toDeleteImageInput(command: mediaV1.DeleteImageCommand): DeleteImageInputDTO {
    return { imageId: command.imageId }
  }
}
