import { capitalize } from 'lodash'
import { isEnumValue, isNumber, VisibilityEnum } from '@hatsuportal/common'
import { InvalidPresentationPostPropertyError } from '../errors/InvalidPresentationPostPropertyError'

export interface PostPresentationProps {
  readonly id: string
  visibility: VisibilityEnum
  readonly createdBy: string
  readonly createdByUserName: string
  readonly createdAt: number
  updatedAt: number | null
}

export abstract class PostPresentation<E extends PostPresentationProps> {
  protected _id: string
  protected _visibility: VisibilityEnum
  protected _createdBy: string
  protected _createdByUserName: string
  protected _createdAt: number
  protected _updatedAt: number | null

  abstract toJSON(): PostPresentationProps
  abstract clone(props?: Partial<E>): PostPresentation<E>

  constructor(props: E) {
    this._id = props.id
    if (!isEnumValue(props.visibility, VisibilityEnum)) {
      throw new InvalidPresentationPostPropertyError(`Property "visibility" must be one of ${VisibilityEnum}, was '${props.visibility}'`)
    }
    this._visibility = props.visibility
    this._createdBy = props.createdBy
    this._createdByUserName = props.createdByUserName
    this._createdAt = props.createdAt
    if (!isNumber(props.updatedAt) && props.updatedAt !== null) {
      throw new InvalidPresentationPostPropertyError(`Property "updatedAt" must be a number or null, was '${props.updatedAt}'`)
    }
    this._updatedAt = props.updatedAt ? props.updatedAt : null // set to null if 0
  }

  get id(): string {
    return this._id
  }

  get visibility(): VisibilityEnum {
    return this._visibility
  }

  get visibility_label() {
    return this._visibility
      .toString()
      ?.replaceAll('_', ' ')
      ?.split(' ')
      ?.map((part) => capitalize(part))
      ?.join(' ')
  }

  set visibility(visibility: VisibilityEnum) {
    if (!isEnumValue(visibility, VisibilityEnum)) {
      throw new InvalidPresentationPostPropertyError(`Property "visibility" must be one of ${VisibilityEnum}, was '${visibility}'`)
    }
    this._visibility = visibility
  }

  get createdBy(): string {
    return this._createdBy
  }

  get createdByUserName(): string {
    return this._createdByUserName
  }

  get createdAt(): number {
    return this._createdAt
  }

  get updatedAt(): number | null {
    return this._updatedAt
  }

  set updatedAt(updatedAt: number | null) {
    if (!isNumber(updatedAt) && updatedAt !== null) {
      throw new InvalidPresentationPostPropertyError(`Property "updatedAt" must be a number or null, was '${updatedAt}'`)
    }
    this._updatedAt = updatedAt ? updatedAt : null // set to null if 0
  }

  public getBaseProps(): PostPresentationProps {
    return {
      id: this._id,
      visibility: this._visibility,
      createdBy: this._createdBy,
      createdByUserName: this._createdByUserName,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt ?? null
    }
  }

  getLatestTimestamp(): number {
    return this._updatedAt ?? this._createdAt ?? -1
  }

  public equals(other: unknown): boolean {
    return (
      other instanceof PostPresentation &&
      this._id === other.id &&
      this.visibility === other.visibility &&
      this.createdBy === other.createdBy &&
      this.createdByUserName === other.createdByUserName &&
      this.createdAt === other.createdAt
    )
  }
}
