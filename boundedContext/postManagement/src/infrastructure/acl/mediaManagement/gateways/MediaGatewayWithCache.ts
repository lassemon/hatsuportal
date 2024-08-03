import { IMediaGateway } from '../../../../application/acl/mediaManagement/IMediaGateway'
import { ImageAttachmentReadModelDTO } from '../../../../application/dtos/image/ImageAttachmentReadModelDTO'
import { ImageLoadResult } from '../../../../application/acl/mediaManagement/outcomes/ImageLoadResult'
import { ImageLoadError } from '../../../../application/acl/mediaManagement/errors/ImageLoadError'
import { ICache } from '@hatsuportal/platform'
import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'

export class MediaGatewayWithCache implements IMediaGateway {
  constructor(
    private readonly mediaGateway: IMediaGateway,
    private readonly cache: ICache<ImageAttachmentReadModelDTO>
  ) {}

  async getImageById(params: { imageId: string }): Promise<ImageLoadResult<ImageAttachmentReadModelDTO, ImageLoadError>> {
    const cached = this.cache.get(`getImageById:${params.imageId}`)
    if (cached) {
      return ImageLoadResult.success(cached)
    }
    const result = await this.mediaGateway.getImageById(params)
    this.cache.set(`getImageById:${params.imageId}`, result.value)
    return result
  }

  async createStagedImageVersion(command: mediaV1.CreateStagedImageCommand): Promise<mediaV1.CreateStagedImageVersionResult> {
    return this.mediaGateway.createStagedImageVersion(command)
  }

  async promoteImageVersion(command: mediaV1.PromoteImageVersionCommand): Promise<void> {
    await this.mediaGateway.promoteImageVersion(command)
    this.cache.delete(`getImageById:${command.imageId}`)
  }

  async discardImageVersion(command: mediaV1.DiscardImageVersionCommand): Promise<void> {
    await this.mediaGateway.discardImageVersion(command)
    this.cache.delete(`getImageById:${command.imageId}`)
  }

  async updateImage(command: mediaV1.UpdateImageCommand): Promise<mediaV1.UpdateImageResult> {
    const result = await this.mediaGateway.updateImage(command)
    this.cache.delete(`getImageById:${command.imageId}`)
    return result
  }

  async deleteImage(command: mediaV1.DeleteImageCommand): Promise<void> {
    await this.mediaGateway.deleteImage(command)
    this.cache.delete(`getImageById:${command.imageId}`)
  }
}
