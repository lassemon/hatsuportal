import { IResourceDescriptor } from '@hatsuportal/platform'
import { Image } from '../../../domain'

export interface IImageToResourceDescriptorMapper {
  fromDomain(image: Image): IResourceDescriptor
}

export class ImageToResourceDescriptorMapper implements IImageToResourceDescriptorMapper {
  public fromDomain(image: Image): IResourceDescriptor {
    return { type: 'Image', id: image.id.toString(), attributes: { ownerId: image.createdById.toString() } }
  }
}
