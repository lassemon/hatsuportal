import { IPasswordFactory } from '../../domain/authentication/IPasswordFactory'
import { InvalidPasswordError } from '../../domain/errors/InvalidPasswordError'
import { IPasswordPolicy } from '../../domain/policies/IPasswordPolicy'
import { Password } from '../../domain/valueObjects/Password'

export class PasswordFactory implements IPasswordFactory {
  public constructor(private readonly passwordPolicy: IPasswordPolicy) {}

  public create(value: string): Password {
    if (!this.passwordPolicy.isValid(value)) {
      throw new InvalidPasswordError(`'${value}' Password does not meet the policy requirements. ${this.passwordPolicy.getRulesMessage()}`)
    }
    return Password.create(value)
  }
}
