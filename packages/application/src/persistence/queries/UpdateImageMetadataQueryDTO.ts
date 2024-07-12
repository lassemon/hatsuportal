import { OmitNotMutableUpdateProperties, PartialExceptFor } from '@hatsuportal/common'
import { ImageMetadataDTO } from '@hatsuportal/domain'

// id is always needed in update queries to find the existing entity record
export type UpdateImageMetadataQueryDTO = PartialExceptFor<OmitNotMutableUpdateProperties<ImageMetadataDTO>, 'id'>
