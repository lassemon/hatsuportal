import { OmitNotMutableUpdateProperties, PartialExceptFor } from '@hatsuportal/common'
import { ImageDTO } from '@hatsuportal/domain'

export interface UpdateImageRequestDTO extends PartialExceptFor<OmitNotMutableUpdateProperties<ImageDTO>, 'size' | 'base64' | 'id'> {}
