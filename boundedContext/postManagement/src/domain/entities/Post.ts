import { VisibilityEnum } from '@hatsuportal/common'
import {
  Entity,
  EntityProps,
  IDomainEvent,
  IDomainEventHolder,
  InvalidUnixTimestampError,
  UnixTimestamp
} from '@hatsuportal/common-bounded-context'
import { PostId } from '../valueObjects/PostId'
import { PostVisibility } from '../valueObjects/PostVisibility'
import { PostCreatorId } from '../valueObjects/PostCreatorId'
import { PostCreatorName } from '../valueObjects/PostCreatorName'

export interface PostProps extends EntityProps {
  visibility: VisibilityEnum
  createdById: string
  createdByName: string
}

export abstract class Post<E extends PostProps> extends Entity<E> implements IDomainEventHolder {
  protected _id: PostId
  protected _visibility: PostVisibility
  protected _createdById: PostCreatorId
  protected _createdByName: PostCreatorName

  protected _domainEvents: IDomainEvent[] = []

  // TODO, is it smelly to have both getProps and ApplicationMapper.toDTO ?
  abstract override getProps(): PostProps

  constructor(props: E) {
    super(props)

    this._id = new PostId(props.id)
    this._visibility = new PostVisibility(props.visibility)
    this._createdById = new PostCreatorId(props.createdById)
    this._createdByName = new PostCreatorName(props.createdByName)

    if (props.createdAt > props.updatedAt) {
      throw new InvalidUnixTimestampError('createdAt must be before updatedAt')
    }

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

  public get domainEvents(): IDomainEvent[] {
    return [...this._domainEvents]
  }

  public clearEvents(): void {
    this._domainEvents = []
  }

  public addDomainEvent(event: IDomainEvent): void {
    this._domainEvents.push(event)
  }
}
