import { OmitNotMutableCreationProperties } from '@hatsuportal/common'
import { ImageDTO } from '@hatsuportal/domain'

export interface CreateImageRequestDTO extends OmitNotMutableCreationProperties<ImageDTO> {}
