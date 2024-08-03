export { UserId } from './valueObjects/UserId'
export { UserName } from './valueObjects/UserName'
export { Email } from './valueObjects/Email'
export { Password } from './valueObjects/Password'
export { UserRole } from './valueObjects/UserRole'

export { User, UserProps } from './entities/User'
export type { IUserCredentials } from './models/IUserCredentials'

export { InvalidEmailError } from './errors/InvalidEmailError'
export { InvalidUserIdError } from './errors/InvalidUserIdError'
export { InvalidPasswordError } from './errors/InvalidPasswordError'
export { InvalidRoleListError } from './errors/InvalidRoleListError'
export { InvalidUserNameError } from './errors/InvalidUserNameError'
export { InvalidUserRoleError } from './errors/InvalidUserRoleError'

export type { IPasswordEncryptionService } from './services/IPasswordEncryptionService'

export type { IUserRepository } from './repositories/IUserRepository'

export { UserCreatedEvent, UserUpdatedEvent, UserDeactivatedEvent, UserDeletedEvent } from './events/UserEvents'
