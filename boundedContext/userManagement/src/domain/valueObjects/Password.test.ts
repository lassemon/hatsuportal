import { describe, expect, it } from 'vitest'
import { Password } from './Password'
import { InvalidPasswordError } from '../errors/InvalidPasswordError'

describe('Password', () => {
  it('can create a password', () => {
    const password = new Password('TestPassword123')
    expect(password).to.be.instanceOf(Password)
    expect(password.value).to.eq('TestPassword123')
  })

  it('does not allow creating a password with an empty value', () => {
    expect(() => {
      new Password('')
    }).toThrow(InvalidPasswordError)
    expect(() => {
      new Password(undefined as any)
    }).toThrow(InvalidPasswordError)
    expect(() => {
      new Password(null as any)
    }).toThrow(InvalidPasswordError)
  })

  it('does not allow creating a password with a numeric value', () => {
    expect(() => {
      new Password(123 as any)
    }).toThrow(InvalidPasswordError)
  })

  it('does not allow creating a password with an invalid value', () => {
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
      'zxcvbnm',
      -1,
      0,
      1
    ] as any[]

    invalidPasswords.forEach((password) => {
      expect(() => {
        new Password(password)
      }).toThrow(InvalidPasswordError)
    })
  })
})
