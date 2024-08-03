import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { ImageId, IImageRepository } from '../../../domain'
import { IMediaQueryMapper } from './mappers/MediaQueryMapper'
import { NotFoundError } from '@hatsuportal/platform'

export class MediaQueryFacade implements mediaV1.IMediaQueryFacade {
  constructor(private readonly imageRepository: IImageRepository, private readonly mediaQueryMapper: IMediaQueryMapper) {}

  async getImageById(params: { imageId: string }): Promise<mediaV1.ImageContract> {
    const image = await this.imageRepository.findById(new ImageId(params.imageId))
    if (!image) {
      throw new NotFoundError(`Image '${params.imageId}' not found`)
    }
    return this.mediaQueryMapper.toImageContract(image)
  }

  /*async searchImages(params: { query: string; limit?: number }): Promise<mediaV1.ImageContract[]> {
    const images = await this.imageRepository.findByQuery(params.query, params.limit)
    return images.map((image) => this.mediaQueryMapper.toDTO(image))
  }*/
}
