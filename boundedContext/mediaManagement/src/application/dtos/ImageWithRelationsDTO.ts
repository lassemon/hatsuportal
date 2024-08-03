import { ImageDTO } from './ImageDTO'

export interface ImageWithRelationsDTO extends ImageDTO {
  createdByName: string
}
