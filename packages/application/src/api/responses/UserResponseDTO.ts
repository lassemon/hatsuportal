import { UserDTO } from '@hatsuportal/domain'

export interface UserResponseDTO extends Omit<UserDTO, 'active'> {}
