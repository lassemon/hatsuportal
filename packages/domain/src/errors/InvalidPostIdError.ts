import { InvalidIdError } from './InvalidIdError'

export class InvalidPostIdError extends InvalidIdError {
  constructor(message?: string) {
    super(message)
  }
}
