import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { DiscardStagedImageInputDTO } from '../../../dtos/DiscardStagedImageInputDTO'
import { PromoteStagedImageInputDTO } from '../../../dtos/PromoteStagedImageInputDTO'
import { CreateImageInputDTO } from '../../../dtos/CreateImageInputDTO'
import { DeleteImageInputDTO } from '../../../dtos/DeleteImageInputDTO'
import { UpdateImageInputDTO } from '../../../dtos/UpdateImageInputDTO'
import { ImageDTO } from '../../../dtos'

export interface IMediaCommandMapper {
  toCreateStagedImageVersionInput(command: mediaV1.CreateStagedImageCommand): CreateImageInputDTO
  toCreateStagedImageVersionResult(result: { imageId: string; stagedVersionId: string }): mediaV1.CreateStagedImageVersionResult

  toPromoteImageVersionInput(command: mediaV1.PromoteImageVersionCommand): PromoteStagedImageInputDTO

  toDiscardImageVersionInput(command: mediaV1.DiscardImageVersionCommand): DiscardStagedImageInputDTO

  toUpdateImageInput(command: mediaV1.UpdateImageCommand): UpdateImageInputDTO
  toUpdateImageResult(imageDTO: ImageDTO): mediaV1.UpdateImageResult

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

  public toCreateStagedImageVersionResult(result: { imageId: string; stagedVersionId: string }): mediaV1.CreateStagedImageVersionResult {
    return { imageId: result.imageId, stagedVersionId: result.stagedVersionId }
  }

  public toPromoteImageVersionInput(command: mediaV1.PromoteImageVersionCommand): PromoteStagedImageInputDTO {
    return { imageId: command.imageId, stagedVersionId: command.stagedVersionId }
  }

  public toDiscardImageVersionInput(command: mediaV1.DiscardImageVersionCommand): DiscardStagedImageInputDTO {
    return { imageId: command.imageId, stagedVersionId: command.stagedVersionId }
  }

  public toUpdateImageInput(command: mediaV1.UpdateImageCommand): UpdateImageInputDTO {
    return {
      id: command.imageId,
      mimeType: command.mimeType,
      size: command.size,
      base64: command.base64
    }
  }

  public toUpdateImageResult(imageDTO: ImageDTO): mediaV1.UpdateImageResult {
    return {
      id: imageDTO.id,
      storageKey: imageDTO.storageKey,
      mimeType: imageDTO.mimeType,
      size: imageDTO.size,
      base64: imageDTO.base64,
      currentVersionId: imageDTO.currentVersionId,
      isCurrent: imageDTO.isCurrent,
      isStaged: imageDTO.isStaged,
      createdById: imageDTO.createdById,
      createdAt: imageDTO.createdAt,
      updatedAt: imageDTO.updatedAt
    }
  }

  public toDeleteImageInput(command: mediaV1.DeleteImageCommand): DeleteImageInputDTO {
    return { imageId: command.imageId }
  }
}
