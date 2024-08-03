import { ImageDTO } from '../dtos/ImageDTO'
import { StoryDTO } from '../dtos/StoryDTO'
import { UserDTO } from '../dtos/UserDTO'
import {
  userDTOMock as domainUserDTOMock,
  storyDTOMock as domainStoryDTOMock,
  imageDTOMock as domainImageDTOMock
} from '@hatsuportal/domain'

export const userDTOMock = (): UserDTO => {
  return {
    ...domainUserDTOMock()
  }
}

export const storyDTOMock = (): StoryDTO => {
  return {
    ...domainStoryDTOMock()
  }
}

export const imageDTOMock = (): ImageDTO => {
  return {
    ...domainImageDTOMock()
  }
}
