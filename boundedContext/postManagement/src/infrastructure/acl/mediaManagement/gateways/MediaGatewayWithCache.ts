import { IMediaGateway } from '../../../../application/acl/mediaManagement/IMediaGateway'
import { ImageAttachmentReadModelDTO } from '../../../../application/dtos/image/ImageAttachmentReadModelDTO'
import { ImageLoadError } from '../../../../application/acl/mediaManagement/errors/ImageLoadError'
import { EntityLoadResult, ICache } from '@hatsuportal/platform'
import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'

export class MediaGatewayWithCache implements IMediaGateway {
  constructor(
    private readonly mediaGateway: IMediaGateway,
    private readonly cache: ICache<ImageAttachmentReadModelDTO>
  ) {}

  async getImageById(params: { imageId: string }): Promise<EntityLoadResult<ImageAttachmentReadModelDTO, ImageLoadError>> {
    const key = `getImageById:${params.imageId}`
    if (this.cache.has(key)) {
      return EntityLoadResult.success(this.cache.get(key)!)
    }

    const result = await this.mediaGateway.getImageById(params)
    if (result.isSuccess()) {
      this.cache.set(key, result.value)
    }
    return result
  }

  async prepareStagedImageFile(command: mediaV1.CreateStagedImageCommand): Promise<mediaV1.PreparedStagedImageContract> {
    return this.mediaGateway.prepareStagedImageFile(command)
  }

  async registerPreparedStagedImageFileRollbackCleanup(prepared: mediaV1.PreparedStagedImageContract): Promise<void> {
    return this.mediaGateway.registerPreparedStagedImageFileRollbackCleanup(prepared)
  }

  async saveStagedImageMetadata(prepared: mediaV1.PreparedStagedImageContract): Promise<void> {
    return this.mediaGateway.saveStagedImageMetadata(prepared)
  }

  async createStagedImageVersion(command: mediaV1.CreateStagedImageCommand): Promise<mediaV1.CreateStagedImageVersionResult> {
    return this.mediaGateway.createStagedImageVersion(command)
  }

  async promoteImageVersion(command: mediaV1.PromoteImageVersionCommand): Promise<void> {
    await this.mediaGateway.promoteImageVersion(command)
    this.cache.delete(`getImageById:${command.imageId}`)
  }

  async deleteImage(command: mediaV1.DeleteImageCommand): Promise<void> {
    await this.mediaGateway.deleteImage(command)
    this.cache.delete(`getImageById:${command.imageId}`)
  }
}
