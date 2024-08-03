import _, { isString } from 'lodash'
import { PostId } from '../valueObjects/PostId'
import { Post, PostProps } from './Post'
import { InvalidPostValueError } from '../errors/InvalidPostValueError'
import { isEnumValue, omitNullAndUndefined, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'

export interface StoryProps extends PostProps {
  imageId: string | null
  name: string
  description: string
}

export class Story extends Post<StoryProps> {
  static canCreate(props: any) {
    try {
      new Story(props)
      return true
    } catch {
      return false
    }
  }

  private _imageId: PostId | null
  private _name: string
  private _description: string

  constructor(props: StoryProps) {
    super({ ...props })
    this._imageId = props.imageId ? new PostId(props.imageId) : null
    if (!isString(props.name) || props.name.trim().length <= 0)
      throw new InvalidPostValueError(`Property "name" must be a string, was '${props.name}'`)
    this._name = props.name

    if (!isString(props.description)) throw new InvalidPostValueError(`Property "description" must be a string, was '${props.description}'`)
    this._description = props.description
  }

  public get name(): string {
    return this._name
  }

  public set name(name: string) {
    if (!isString(name)) throw new InvalidPostValueError(`Property "name" must be a string, was '${name}'`)
    this._name = name
  }

  public get imageId(): PostId | null {
    return this._imageId
  }

  public set imageId(imageId: string | null) {
    this._imageId = imageId ? new PostId(imageId) : null
  }

  public get description(): string {
    return this._description
  }

  public set description(description: string) {
    if (!isString(description)) throw new InvalidPostValueError(`Property "description" must be a string, was '${description}'`)
    this._description = description
  }

  public getCreatedByUserName() {
    return this._createdByUserName
  }

  public getProps() {
    return {
      id: this._id.value,
      visibility: this._visibility.value,
      imageId: this.imageId?.value ?? null,
      name: this._name,
      description: this._description,
      createdBy: this._createdBy.value,
      createdByUserName: this._createdByUserName.value,
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt?.value ?? null
    }
  }

  public update(props: Partial<StoryProps>): void {
    const sanitizedProps = omitNullAndUndefined(props)

    if (Story.canCreate({ ...this.getProps(), ...sanitizedProps })) {
      if (isEnumValue(sanitizedProps.visibility, VisibilityEnum)) this.visibility = sanitizedProps.visibility

      if (!isString(sanitizedProps.name) || sanitizedProps.name.trim().length <= 0)
        throw new InvalidPostValueError(`Property "name" must be a string, was '${sanitizedProps.name}'`)
      this.name = sanitizedProps.name

      if (!isString(sanitizedProps.description))
        throw new InvalidPostValueError(`Property "description" must be a string, was '${sanitizedProps.description}'`)
      this.description = sanitizedProps.description

      this.updatedAt = unixtimeNow()
    }
  }

  equals(other: unknown): boolean {
    return (
      super.equals(other) &&
      other instanceof Story &&
      this.imageId === other.imageId &&
      this.name === other.name &&
      this.description === other.description
    )
  }
}

export default Story
