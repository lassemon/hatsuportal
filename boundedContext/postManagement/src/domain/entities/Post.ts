import { VisibilityEnum } from '@hatsuportal/common'
import { DomainEvent, UnixTimestamp } from '@hatsuportal/common-bounded-context'
import { PostId } from '../valueObjects/PostId'
import { PostVisibility } from '../valueObjects/PostVisibility'
import { PostCreatorId } from '../valueObjects/PostCreatorId'
import { PostCreatorName } from '../valueObjects/PostCreatorName'

export interface PostProps {
  readonly id: string
  visibility: VisibilityEnum
  readonly createdById: string
  readonly createdByName: string
  readonly createdAt: number
  updatedAt: number
}

export abstract class Post<E extends PostProps> {
  protected _id: PostId
  protected _visibility: PostVisibility
  protected _createdById: PostCreatorId
  protected _createdByName: PostCreatorName
  protected _createdAt: UnixTimestamp
  protected _updatedAt: UnixTimestamp

  protected _domainEvents: DomainEvent[] = []

  abstract getProps(): PostProps
  abstract update(props: Partial<E>): void
  abstract delete(): void

  constructor(props: E) {
    this._id = new PostId(props.id)
    this._visibility = new PostVisibility(props.visibility)
    this._createdById = new PostCreatorId(props.createdById)
    this._createdByName = new PostCreatorName(props.createdByName)
    this._createdAt = new UnixTimestamp(props.createdAt)
    this._updatedAt = new UnixTimestamp(props.updatedAt)
  }

  get id(): PostId {
    return this._id
  }

  get visibility(): PostVisibility {
    return this._visibility
  }

  get createdById(): PostCreatorId {
    return this._createdById
  }

  get createdByName(): PostCreatorName {
    return this._createdByName
  }

  get createdAt(): UnixTimestamp {
    return this._createdAt
  }

  get updatedAt(): UnixTimestamp {
    return this._updatedAt
  }

  public equals(other: unknown): boolean {
    return (
      other instanceof Post &&
      this.id.equals(other.id) &&
      this.visibility.equals(other.visibility) &&
      this.createdById.equals(other.createdById) &&
      this.createdByName.equals(other.createdByName) &&
      this.createdAt.equals(other.createdAt)
    )
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
}
