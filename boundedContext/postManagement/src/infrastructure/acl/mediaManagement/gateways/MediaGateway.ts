import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { IMediaGateway } from '../../../../application/acl/mediaManagement/IMediaGateway'
import { ImageAttachmentReadModelDTO } from '../../../../application/dtos/image/ImageAttachmentReadModelDTO'
import { IMediaGatewayMapper } from '../../../../application/acl/mediaManagement/mappers/IMediaGatewayMapper'
import { ImageLoadError } from '../../../../application/acl/mediaManagement/errors/ImageLoadError'
import ImageLoadResult from '../../../../application/acl/mediaManagement/outcomes/ImageLoadResult'

export class MediaGateway implements IMediaGateway {
  constructor(
    private readonly mediaQueryFacade: mediaV1.IMediaQueryFacade,
    private readonly mediaCommandFacade: mediaV1.IMediaCommandFacade,
    private readonly mediaGatewayMapper: IMediaGatewayMapper
  ) {}

  async getImageById(params: { imageId: string }): Promise<ImageLoadResult<ImageAttachmentReadModelDTO, ImageLoadError>> {
    try {
      const image = await this.mediaQueryFacade.getImageById(params)
      return ImageLoadResult.success(this.mediaGatewayMapper.toAttachmentReadModelDTO(image))
    } catch (error) {
      return ImageLoadResult.failedToLoad(params.imageId, error as Error)
    }
  }

  async createStagedImageVersion(command: mediaV1.CreateStagedImageCommand): Promise<mediaV1.CreateStagedImageVersionResult> {
    return this.mediaCommandFacade.createStagedImageVersion(command)
  }

  async promoteImageVersion(command: mediaV1.PromoteImageVersionCommand): Promise<void> {
    return this.mediaCommandFacade.promoteImageVersion(command)
  }

  async discardImageVersion(command: mediaV1.DiscardImageVersionCommand): Promise<void> {
    return this.mediaCommandFacade.discardImageVersion(command)
  }

  async updateImage(command: mediaV1.UpdateImageCommand): Promise<mediaV1.UpdateImageResult> {
    return this.mediaCommandFacade.updateImage(command)
  }

  async deleteImage(command: mediaV1.DeleteImageCommand): Promise<void> {
    return this.mediaCommandFacade.deleteImage(command)
  }
}
