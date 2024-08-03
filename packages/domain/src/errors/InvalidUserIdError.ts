import { InvalidIdError } from './InvalidIdError'

export class InvalidUserIdError extends InvalidIdError {
  constructor(message?: string) {
    super(message)
  }
}
