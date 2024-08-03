import { TagId } from '../valueObjects/TagId'
import { TagCreatorId } from '../valueObjects/TagCreatorId'
import { TagSlug } from '../valueObjects/TagSlug'
import { TagName } from '../valueObjects/TagName'
import {
  CreatedAtTimestamp,
  Entity,
  EntityProps,
  UniqueId,
  UnixTimestamp,
  InvalidCreatedAtTimestampError,
  DomainEvent
} from '@hatsuportal/shared-kernel'
import { dateStringFromUnixTime, unixtimeNow } from '@hatsuportal/common'

export interface TagProps extends EntityProps {
  readonly createdById: TagCreatorId
  slug: TagSlug
  name: TagName
}

export class Tag extends Entity {
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
      props.name instanceof TagName ? props.name : new TagName(props.name),
      props.createdById instanceof TagCreatorId ? props.createdById : new TagCreatorId(props.createdById),
      props.createdAt instanceof CreatedAtTimestamp ? props.createdAt : new CreatedAtTimestamp(props.createdAt),
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

  private _slug: TagSlug
  private _name: TagName
  private _createdById: TagCreatorId

  private constructor(
    id: TagId,
    slug: TagSlug,
    name: TagName,
    createdById: TagCreatorId,
    createdAt: CreatedAtTimestamp,
    updatedAt: UnixTimestamp
  ) {
    super(id, createdAt, updatedAt)
    this._slug = slug
    this._name = name
    this._createdById = createdById

    if (createdAt.value > updatedAt.value && !updatedAt.equals(UnixTimestamp.UNKNOWN)) {
      throw new InvalidCreatedAtTimestampError(
        `createdAt ${dateStringFromUnixTime(createdAt.value)} must be before updatedAt ${dateStringFromUnixTime(updatedAt.value)}`
      )
    }
  }

  public updateSlug(slug: TagSlug, updatedById: UniqueId): void {
    this._slug = slug
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  get slug(): TagSlug {
    return this._slug
  }

  public updateName(name: TagName, updatedById: UniqueId): void {
    this._name = name
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  get name(): TagName {
    return this._name
  }

  get createdById(): TagCreatorId {
    return this._createdById
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

  public delete(deletedById: UniqueId): void {
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  public get domainEvents(): DomainEvent[] {
    return [...this._domainEvents]
  }

  public clearEvents(): void {
    this._domainEvents = []
  }

  public addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  public override equals(other: unknown): boolean {
    return (
      other instanceof Tag &&
      this.id.equals(other.id) &&
      this._slug.equals(other._slug) &&
      this._name.equals(other._name) &&
      this._createdById.equals(other._createdById) &&
      this.createdAt.equals(other.createdAt) &&
      this.updatedAt.equals(other.updatedAt)
    )
  }
}
