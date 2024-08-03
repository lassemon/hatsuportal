import { DomainEvent } from '@hatsuportal/shared-kernel'

export enum UserEventTypes {
  UserCreated = 'UserCreated',
  UserUpdated = 'UserUpdated',
  UserDeactivated = 'UserDeactivated',
  UserDeleted = 'UserDeleted'
}

export interface UserCreatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly createdAt: number
  readonly createdById: string
}
export class UserCreatedEvent extends DomainEvent<UserCreatedEventData> {
  constructor(data: UserCreatedEventData) {
    super(UserEventTypes.UserCreated, data)
  }
}

export interface UserUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly updatedAt: number
  readonly updatedById: string
}
export class UserUpdatedEvent extends DomainEvent<UserUpdatedEventData> {
  constructor(data: UserUpdatedEventData) {
    super(UserEventTypes.UserUpdated, data)
  }
}

export interface UserDeactivatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly deactivatedAt: number
  readonly deactivatedById: string
}
export class UserDeactivatedEvent extends DomainEvent<UserDeactivatedEventData> {
  constructor(data: UserDeactivatedEventData) {
    super(UserEventTypes.UserDeactivated, data)
  }
}

export interface UserDeletedEventData extends Record<string, unknown> {
  readonly id: string
  readonly deletedAt: number
  readonly deletedById: string
}
export class UserDeletedEvent extends DomainEvent<UserDeletedEventData> {
  constructor(data: UserDeletedEventData) {
    super(UserEventTypes.UserDeleted, data)
  }
}
