import { ImageAttachmentReadModelDTO } from './ImageAttachmentReadModelDTO'

export interface CoverImageWithRelationsDTO extends ImageAttachmentReadModelDTO {
  createdByName: string
}
