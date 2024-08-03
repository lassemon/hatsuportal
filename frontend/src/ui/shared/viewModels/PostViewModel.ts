import { capitalize } from 'lodash'
import { InvalidViewModelPropertyError } from 'infrastructure/errors/InvalidViewModelPropertyError'
import { isEnumValue, isNumber, VisibilityEnum } from '@hatsuportal/common'

export interface PostViewModelDTO {
  readonly id: string
  visibility: VisibilityEnum
  readonly createdById: string
  readonly createdByName: string
  readonly createdAt: number
  updatedAt: number | null
}

export abstract class PostViewModel<E extends PostViewModelDTO> {
  protected _id: string
  protected _visibility: VisibilityEnum
  protected _createdById: string
  protected _createdByName: string
  protected _createdAt: number
  protected _updatedAt: number | null

  abstract toJSON(): PostViewModelDTO
  abstract clone(props?: Partial<E>): PostViewModel<E>

  constructor(props: E) {
    this._id = props.id
    if (!isEnumValue(props.visibility, VisibilityEnum)) {
      throw new InvalidViewModelPropertyError(`Property "visibility" must be one of ${VisibilityEnum}, was '${props.visibility}'`)
    }
    this._visibility = props.visibility
    this._createdById = props.createdById
    this._createdByName = props.createdByName
    this._createdAt = props.createdAt
    if (!isNumber(props.updatedAt) && props.updatedAt !== null) {
      throw new InvalidViewModelPropertyError(`Property "updatedAt" must be a number or null, was '${props.updatedAt}'`)
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
      throw new InvalidViewModelPropertyError(`Property "visibility" must be one of ${VisibilityEnum}, was '${visibility}'`)
    }
    this._visibility = visibility
  }

  get createdById(): string {
    return this._createdById
  }

  get createdByName(): string {
    return this._createdByName
  }

  get createdAt(): number {
    return this._createdAt
  }

  get updatedAt(): number | null {
    return this._updatedAt
  }

  set updatedAt(updatedAt: number | null) {
    if (!isNumber(updatedAt) && updatedAt !== null) {
      throw new InvalidViewModelPropertyError(`Property "updatedAt" must be a number or null, was '${updatedAt}'`)
    }
    this._updatedAt = updatedAt ? updatedAt : null // set to null if 0
  }

  public getBaseProps(): PostViewModelDTO {
    return {
      id: this._id,
      visibility: this._visibility,
      createdById: this._createdById,
      createdByName: this._createdByName,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt ?? null
    }
  }

  getLatestTimestamp(): number {
    return this._updatedAt ?? this._createdAt ?? -1
  }

  public equals(other: unknown): boolean {
    return (
      other instanceof PostViewModel &&
      this._id === other.id &&
      this.visibility === other.visibility &&
      this.createdById === other.createdById &&
      this.createdByName === other.createdByName &&
      this.createdAt === other.createdAt
    )
  }
}
