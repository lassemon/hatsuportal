import { describe, expect, it } from 'vitest'
import { PasswordFactory } from './PasswordFactory'
import { StrictPasswordPolicy } from '../../infrastructure/authentication/StrictPasswordPolicy'
import { DevelopmentPasswordPolicy } from '../../infrastructure/authentication/DevelopmentPasswordPolicy'
import { Password } from '../../domain/valueObjects/Password'
import { InvalidPasswordError } from '../../domain/errors/InvalidPasswordError'

describe('PasswordFactory', () => {
  const strictPasswordPolicy = new StrictPasswordPolicy()
  const developmentPasswordPolicy = new DevelopmentPasswordPolicy()
  describe('with StrictPasswordPolicy', () => {
    it('can create a password with a valid value', () => {
      const passwordFactory = new PasswordFactory(strictPasswordPolicy)
      const password = passwordFactory.create('TestPassword123')

      expect(password).to.be.instanceOf(Password)
      expect(password.value).to.eq('TestPassword123')
    })

    it('does not allow creating a password with an invalid value', () => {
      const passwordFactory = new PasswordFactory(strictPasswordPolicy)

      const invalidPasswords = [
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
        'lol123',
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
        'zxcvbnm'
      ]

      invalidPasswords.forEach((password) => {
        expect(() => {
          passwordFactory.create(password)
        }).toThrow(InvalidPasswordError)
      })
    })

    it('does not allow creating a password that is too short', () => {
      const passwordFactory = new PasswordFactory(strictPasswordPolicy)

      expect(() => {
        passwordFactory.create('Short1')
      }).toThrow(InvalidPasswordError)
    })

    it('does not allow creating a password without uppercase', () => {
      const passwordFactory = new PasswordFactory(strictPasswordPolicy)

      expect(() => {
        passwordFactory.create('testpassword123')
      }).toThrow(InvalidPasswordError)
    })

    it('does not allow creating a password without lowercase', () => {
      const passwordFactory = new PasswordFactory(strictPasswordPolicy)

      expect(() => {
        passwordFactory.create('TESTPASSWORD123')
      }).toThrow(InvalidPasswordError)
    })

    it('does not allow creating a password without digits', () => {
      const passwordFactory = new PasswordFactory(strictPasswordPolicy)

      expect(() => {
        passwordFactory.create('TestPasswordOnly')
      }).toThrow(InvalidPasswordError)
    })

    it('does not allow creating a password with spaces', () => {
      const passwordFactory = new PasswordFactory(strictPasswordPolicy)

      expect(() => {
        passwordFactory.create('Test Password 123')
      }).toThrow(InvalidPasswordError)
    })

    it('does not allow creating a password with empty value', () => {
      const passwordFactory = new PasswordFactory(strictPasswordPolicy)

      expect(() => {
        passwordFactory.create('')
      }).toThrow(InvalidPasswordError)
    })
  })

  describe('with DevelopmentPasswordPolicy', () => {
    it('can create a password with any value', () => {
      const passwordFactory = new PasswordFactory(developmentPasswordPolicy)

      const password = passwordFactory.create('weak')
      expect(password).to.be.instanceOf(Password)
      expect(password.value).to.eq('weak')
    })

    it('allows creating passwords that would be invalid with strict policy', () => {
      const passwordFactory = new PasswordFactory(developmentPasswordPolicy)

      const weakPasswords = ['123456', 'password', 'test', 'admin']

      weakPasswords.forEach((passwordValue) => {
        const password = passwordFactory.create(passwordValue)
        expect(password).to.be.instanceOf(Password)
        expect(password.value).to.eq(passwordValue)
      })
    })

    it('still does not allow empty values', () => {
      const passwordFactory = new PasswordFactory(developmentPasswordPolicy)

      expect(() => {
        passwordFactory.create('')
      }).toThrow(InvalidPasswordError)
    })
  })
})
