import PasswordValidator from 'password-validator'
import { IPasswordPolicy } from '../../domain/policies/IPasswordPolicy'

export class StrictPasswordPolicy implements IPasswordPolicy {
  private passwordValidator: PasswordValidator

  constructor() {
    const schema = new PasswordValidator()

    schema
      .is()
      .min(12) // Minimum length 12
      .is()
      .max(255) // Protect the database which stores this as VARCHAR(255)
      .has()
      .uppercase() // Must have uppercase letters
      .has()
      .lowercase() // Must have lowercase letters
      .has()
      .digits(1) // Must have at least 1 digits
      .has()
      .not()
      .spaces() // Should not have spaces
      .is()
      .not()
      .oneOf(PASSWORD_BLACKLIST) // Blacklist these values

    this.passwordValidator = schema
  }

  isValid(passwordValue: string): boolean {
    return !!this.passwordValidator.validate(passwordValue)
  }

  getRulesMessage(): string {
    // TODO, localize this?
    return `
Password must be at least 12 characters long, contain at least one uppercase letter, one lowercase letter, one digit, and not contain spaces.
It must not contain any of the commonly used easily guessed values (Ask admin for list of blacklisted values if needed).
`
  }
}

const PASSWORD_BLACKLIST = [
  '!@#$%^&*',
  '111111',
  '121212',
  '123123',
  '12341234',
  '12345',
  '123456',
  '1234567',
  '12345678',
  '123456789',
  '1q2w3e',
  '1qaz2wsx',
  '222222',
  '55555',
  '654321',
  '666666',
  'Andrew',
  'Blahblah',
  'Cheese',
  'Computer',
  'Corvette',
  'Daniel',
  'Ferrari',
  'George',
  'Hannah',
  'Harley',
  'Hello',
  'Jessica',
  'Jordan',
  'Joshua',
  'Matthew',
  'Maverick',
  'Mercedes',
  'Pepper',
  'Robert',
  'Thomas',
  'Tigger',
  'aa123456',
  'aaaaaa',
  'abc123 ',
  'abcdef',
  'admin',
  'admin123',
  'amanda',
  'andrea',
  'ashley',
  'bailey',
  'banana',
  'bandit',
  'baseball',
  'buster',
  'charlie',
  'chelsea',
  'cookie',
  'dallas',
  'donald',
  'flower',
  'football',
  'freedom',
  'ginger',
  'hockey',
  'hunter',
  'iloveyou',
  'jennifer',
  'jesus',
  'killer',
  'lakers',
  'letmein',
  'liverpool',
  'login',
  'london',
  'loveme',
  'master',
  'merlin',
  'michael',
  'monkey',
  'mustang',
  'nicole',
  'passw0rd',
  'password',
  'password1',
  'princess',
  'querty',
  'qwerty123',
  'ranger',
  'shadow',
  'soccer',
  'sophie',
  'starwars',
  'summer',
  'sunshine',
  'test',
  'trustno1',
  'welcome',
  'whatever',
  'william',
  'zaq1zaq1',
  'zxcvbnm',
  'lol123'
]
