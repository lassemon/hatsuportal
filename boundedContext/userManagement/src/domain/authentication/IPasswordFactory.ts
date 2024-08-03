import { Password } from '../valueObjects/Password'

export interface IPasswordFactory {
  create(passwordValue: string): Password
}
