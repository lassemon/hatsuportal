import { BASE64_PREFIX, omitNullAndUndefined, unixtimeNow } from '@hatsuportal/common'
import { Base64Image } from '../valueObjects/Base64Image'
import ImageMetadata, { ImageMetadataProps } from './ImageMetadata'

export interface ImageProps extends ImageMetadataProps {
  base64: string
}

export class Image extends ImageMetadata<ImageProps> {
  static canCreate(props: any) {
    try {
      new Image(props)
      return true
    } catch {
      return false
    }
  }

  private _base64: Base64Image

  constructor(props: ImageProps) {
    super({ ...props })
    this._base64 = new Base64Image(props.base64?.startsWith(BASE64_PREFIX) ? props.base64 : `${BASE64_PREFIX},${props.base64}`)
  }

  public get base64(): Base64Image {
    return this._base64
  }

  public set base64(base64: string) {
    if (base64.startsWith(BASE64_PREFIX)) {
      this._base64 = new Base64Image(base64)
    } else {
      this._base64 = new Base64Image(`${BASE64_PREFIX},${base64}`)
    }
  }

  public getProps(): ImageProps {
    return {
      id: this._id.value,
      visibility: this._visibility.value,
      fileName: this._fileName.value,
      mimeType: this._mimeType.value,
      size: this._size.value,
      ownerId: this._ownerId?.value ?? null,
      ownerType: this._ownerType?.value ?? null,
      base64: this.base64?.value,
      createdBy: this._createdBy.value,
      createdByUserName: this._createdByUserName.value,
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt?.value ?? null
    }
  }

  public update(props: Partial<ImageProps>): void {
    const sanitizedProps = omitNullAndUndefined(props)

    if (Image.canCreate({ ...this.getProps(), ...sanitizedProps })) {
      if (sanitizedProps.visibility) this.visibility = sanitizedProps.visibility
      if (sanitizedProps.fileName) this.fileName = sanitizedProps.fileName
      if (sanitizedProps.mimeType) this.mimeType = sanitizedProps.mimeType
      if (sanitizedProps.base64) this.base64 = sanitizedProps.base64
      this.ownerId = sanitizedProps.ownerId ?? null
      if (sanitizedProps.ownerType) this.ownerType = sanitizedProps.ownerType
      this.updatedAt = unixtimeNow()
    }
  }

  equals(other: unknown): boolean {
    return super.equals(other) && other instanceof Image && this.base64.equals(other.base64)
  }
}

export default Image
