import ImageMetadata, { ImageMetadataDTO } from './ImageMetadata'

const BASE64_PREFIX = 'data:image/png;base64'
export interface ImageDTO extends ImageMetadataDTO {
  base64: string
}

export class Image extends ImageMetadata<ImageDTO> {
  constructor(props: ImageDTO) {
    const base64 = props.base64.startsWith(BASE64_PREFIX) ? props.base64 : `${BASE64_PREFIX},${props.base64}`
    super({ ...props, base64 })
  }

  protected getAllowedKeys(): (keyof ImageDTO)[] {
    return [
      'id',
      'visibility',
      'createdBy',
      'createdByUserName',
      'createdAt',
      'updatedAt',
      'fileName',
      'mimeType',
      'size',
      'base64',
      'ownerId',
      'ownerType'
    ] as (keyof ImageDTO)[]
  }

  public get base64() {
    return this.props.base64
  }

  public set base64(base64: string) {
    if (base64.startsWith(BASE64_PREFIX)) {
      this.props.base64 = base64
    } else {
      this.props.base64 = `${BASE64_PREFIX},${base64}`
    }
  }
}

export default Image
