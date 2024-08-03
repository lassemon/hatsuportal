import { TagId } from '../valueObjects/TagId'
import { TagCreatorId } from '../valueObjects/TagCreatorId'
import { TagSlug } from '../valueObjects/TagSlug'
import { EntityProps, InvalidUnixTimestampError, NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { dateStringFromUnixTime, unixtimeNow } from '@hatsuportal/common'

export interface TagProps extends EntityProps {
  readonly createdById: TagCreatorId
  slug: TagSlug
  name: NonEmptyString
}

export class Tag {
  static canCreate(props: any): boolean {
    try {
      Tag.assertCanCreate(props)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(props: any): void {
    new Tag(
      props.id instanceof TagId ? props.id : new TagId(props.id),
      props.slug instanceof TagSlug ? props.slug : new TagSlug(props.slug),
      props.name instanceof NonEmptyString ? props.name : new NonEmptyString(props.name),
      props.createdById instanceof TagCreatorId ? props.createdById : new TagCreatorId(props.createdById),
      props.createdAt instanceof UnixTimestamp ? props.createdAt : new UnixTimestamp(props.createdAt),
      props.updatedAt instanceof UnixTimestamp ? props.updatedAt : new UnixTimestamp(props.updatedAt)
    )
  }

  static create(props: TagProps): Tag {
    const tag = new Tag(props.id, props.slug, props.name, props.createdById, props.createdAt, props.updatedAt)
    return tag
  }

  static reconstruct(props: TagProps): Tag {
    return new Tag(props.id, props.slug, props.name, props.createdById, props.createdAt, props.updatedAt)
  }

  private _id: TagId
  private _slug: TagSlug
  private _name: NonEmptyString
  private _createdById: TagCreatorId
  private _createdAt: UnixTimestamp
  private _updatedAt: UnixTimestamp

  private constructor(
    id: TagId,
    slug: TagSlug,
    name: NonEmptyString,
    createdById: TagCreatorId,
    createdAt: UnixTimestamp,
    updatedAt: UnixTimestamp
  ) {
    this._id = id
    this._slug = slug
    this._name = name
    this._createdById = createdById

    if (createdAt.value > updatedAt.value) {
      throw new InvalidUnixTimestampError(
        `createdAt ${dateStringFromUnixTime(createdAt.value)} must be before updatedAt ${dateStringFromUnixTime(updatedAt.value)}`
      )
    }
    this._createdAt = createdAt
    this._updatedAt = updatedAt
  }

  get id(): TagId {
    return this._id
  }

  public updateSlug(slug: TagSlug): void {
    this._slug = slug
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  get slug(): TagSlug {
    return this._slug
  }

  public updateName(name: NonEmptyString): void {
    this._name = name
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  get name(): NonEmptyString {
    return this._name
  }

  get createdById(): TagCreatorId {
    return this._createdById
  }

  get createdAt(): UnixTimestamp {
    return this._createdAt
  }

  get updatedAt(): UnixTimestamp {
    return this._updatedAt
  }

  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  public serialize(): Record<string, unknown> {
    return {
      id: this.id.value,
      slug: this.slug.value,
      name: this.name.value,
      createdById: this.createdById.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value
    }
  }

  public clone(): Tag {
    return new Tag(this.id, this.slug, this.name, this.createdById, this.createdAt, this.updatedAt)
  }

  public equals(other: unknown): boolean {
    return (
      other instanceof Tag &&
      this._id.equals(other._id) &&
      this._slug.equals(other._slug) &&
      this._name.equals(other._name) &&
      this._createdById.equals(other._createdById)
    )
  }
}
