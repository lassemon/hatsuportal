import { unixtimeNow } from '@hatsuportal/common'
import { DomainEvent, UnixTimestamp } from '@hatsuportal/common-bounded-context'
import { User } from '../entities/User'

export class UserCreatedEvent implements DomainEvent {
  readonly eventType = 'UserCreated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly user: User) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class UserUpdatedEvent implements DomainEvent {
  readonly eventType = 'UserUpdated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly user: User) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class UserDeactivatedEvent implements DomainEvent {
  readonly eventType = 'UserDeactivated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly user: User) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}
