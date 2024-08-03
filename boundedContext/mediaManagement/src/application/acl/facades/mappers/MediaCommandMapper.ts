import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { PromoteStagedImageInputDTO } from '../../../dtos/PromoteStagedImageInputDTO'
import { CreateImageInputDTO } from '../../../dtos/CreateImageInputDTO'
import { DeleteImageInputDTO } from '../../../dtos/DeleteImageInputDTO'
import { PreparedStagedImageDTO } from '../../../dtos/PreparedStagedImageDTO'

export interface IMediaCommandMapper {
  toCreateStagedImageVersionInput(command: mediaV1.CreateStagedImageCommand): CreateImageInputDTO
  toCreateStagedImageVersionResult(result: {
    createdById: string
    imageId: string
    stagedVersionId: string
  }): mediaV1.CreateStagedImageVersionResult
  toPreparedStagedImageContract(prepared: PreparedStagedImageDTO): mediaV1.PreparedStagedImageContract
  fromPreparedStagedImageContract(prepared: mediaV1.PreparedStagedImageContract): PreparedStagedImageDTO
  toPromoteImageVersionInput(command: mediaV1.PromoteImageVersionCommand): PromoteStagedImageInputDTO
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

  public toPreparedStagedImageContract(prepared: PreparedStagedImageDTO): mediaV1.PreparedStagedImageContract {
    return { ...prepared }
  }

  public fromPreparedStagedImageContract(prepared: mediaV1.PreparedStagedImageContract): PreparedStagedImageDTO {
    return { ...prepared }
  }

  public toPromoteImageVersionInput(command: mediaV1.PromoteImageVersionCommand): PromoteStagedImageInputDTO {
    return { promotedById: command.promotedById, imageId: command.imageId, stagedVersionId: command.stagedVersionId }
  }

  public toDeleteImageInput(command: mediaV1.DeleteImageCommand): DeleteImageInputDTO {
    return { imageId: command.imageId }
  }
}
