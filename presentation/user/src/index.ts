// Export all user presentation modules

// API - Requests
export type { LoginRequest } from './api/requests/LoginRequest'
export type { CreateUserRequest } from './api/requests/CreateUserRequest'
export type { UpdateUserRequest } from './api/requests/UpdateUserRequest'

// API - Responses
export type { UserResponse } from './api/responses/UserResponse'
export type { ProfileResponse } from './api/responses/ProfileResponse'

// Mappers
export { UserPresentationMapper } from './mappers/UserPresentationMapper'
export { AuthPresentationMapper } from './mappers/AuthPresentationMapper'
export { ProfilePresentationMapper } from './mappers/ProfilePresentationMapper'

export type { IUserPresentationMapper } from './mappers/UserPresentationMapper'
export type { IAuthPresentationMapper } from './mappers/AuthPresentationMapper'
export type { IProfilePresentationMapper } from './mappers/ProfilePresentationMapper'

// Entities
export { UserPresentation } from './entities/UserPresentation'
export { ProfilePresentation } from './entities/ProfilePresentation'

export type { UserPresentationDTO } from './entities/UserPresentation'
export type { ProfilePresentationDTO } from './entities/ProfilePresentation'
