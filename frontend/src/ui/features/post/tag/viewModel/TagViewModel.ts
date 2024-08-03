import { InvalidViewModelPropertyError } from 'infrastructure/errors/InvalidViewModelPropertyError'
import { isNumber } from 'lodash'

export interface TagViewModelDTO {
  readonly id: string
  slug: string
  name: string
  readonly createdById: string
  readonly createdAt: number
  updatedAt: number
}

export class TagViewModel {
  private readonly _id: string
  private _slug: string
  private _name: string
  private _createdById: string
  private _createdAt: number
  private _updatedAt: number

  constructor(props: TagViewModelDTO) {
    this._id = props.id
    this._slug = props.slug
    this._name = props.name
    this._createdById = props.createdById
    this._createdAt = props.createdAt

    if (!isNumber(props.updatedAt) && props.updatedAt !== null) {
      throw new InvalidViewModelPropertyError(`Property "updatedAt" must be a number, was '${props.updatedAt}'`)
    }
    this._updatedAt = props.updatedAt
  }

  public get id(): string {
    return this._id
  }

  public get slug(): string {
    return this._slug
  }

  public set slug(slug: string) {
    this._slug = slug
  }

  public get name(): string {
    return this._name
  }

  public set name(name: string) {
    this._name = name
  }

  public get createdById(): string {
    return this._createdById
  }

  public get createdAt(): number {
    return this._createdAt
  }

  public get updatedAt(): number {
    return this._updatedAt
  }

  public set updatedAt(updatedAt: number) {
    if (!isNumber(updatedAt)) {
      throw new InvalidViewModelPropertyError(`Property "updatedAt" must be a number, was '${updatedAt}'`)
    }
    this._updatedAt = updatedAt
  }

  public toJSON(): TagViewModelDTO {
    return {
      id: this._id,
      slug: this._slug,
      name: this._name,
      createdById: this._createdById,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    }
  }

  public clone(props?: Partial<TagViewModelDTO>): TagViewModel {
    if (props) {
      return new TagViewModel({ ...this.toJSON(), ...props })
    } else {
      return new TagViewModel(this.toJSON())
    }
  }

  equals(other: unknown): boolean {
    return (
      other instanceof TagViewModel &&
      this.id === other.id &&
      this.slug === other.slug &&
      this.name === other.name &&
      this.createdById === other.createdById &&
      this.createdAt === other.createdAt &&
      this.updatedAt === other.updatedAt
    )
  }
}
