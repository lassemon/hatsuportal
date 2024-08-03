import { unixtimeNow } from '@hatsuportal/common'
import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface UserCreatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly createdAt: number
}
export class UserCreatedEvent implements IDomainEvent<UnixTimestamp, UserCreatedEventData> {
  readonly eventType = 'UserCreated'
  readonly occurredOn: UnixTimestamp
  readonly data: UserCreatedEventData

  constructor(data: UserCreatedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface UserUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly updatedAt: number
  readonly updatedById: string
}
export class UserUpdatedEvent implements IDomainEvent<UnixTimestamp, UserUpdatedEventData> {
  readonly eventType = 'UserUpdated'
  readonly occurredOn: UnixTimestamp
  readonly data: UserUpdatedEventData

  constructor(data: UserUpdatedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface UserDeactivatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly deactivatedAt: number
  readonly deactivatedById: string
}
export class UserDeactivatedEvent implements IDomainEvent<UnixTimestamp, UserDeactivatedEventData> {
  readonly eventType = 'UserDeactivated'
  readonly occurredOn: UnixTimestamp
  readonly data: UserDeactivatedEventData

  constructor(data: UserDeactivatedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface UserDeletedEventData extends Record<string, unknown> {
  readonly id: string
  readonly deletedAt: number
  readonly deletedById: string
}
export class UserDeletedEvent implements IDomainEvent<UnixTimestamp, UserDeletedEventData> {
  readonly eventType = 'UserDeleted'
  readonly occurredOn: UnixTimestamp
  readonly data: UserDeletedEventData

  constructor(data: UserDeletedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}
