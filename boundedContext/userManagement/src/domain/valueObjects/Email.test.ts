import { describe, expect, it } from 'vitest'
import { Email } from './Email'
import { InvalidEmailError } from '../errors/InvalidEmailError'

describe('Email', () => {
  it('can create an email', () => {
    const email = new Email('test@testemail.com')
    expect(email).to.be.instanceOf(Email)
    expect(email.value).to.eq('test@testemail.com')
  })

  it('does not allow creating an email with an empty value', () => {
    expect(() => {
      new Email('')
    }).toThrow(InvalidEmailError)
    expect(() => {
      new Email(undefined as any)
    }).toThrow(InvalidEmailError)
    expect(() => {
      new Email(null as any)
    }).toThrow(InvalidEmailError)
  })

  it('does not allow creating an email with a numeric value', () => {
    expect(() => {
      new Email(123 as any)
    }).toThrow(InvalidEmailError)
  })

  it('does not allow creating an email with an invalid value', () => {
    const invalidEmails = [
      'plainaddress',
      '#@%^%#$@#$@#.com',
      '@example.com',
      'Joe Smith <email@example.com>',
      'email.example.com',
      'email@example@example.com',
      '.email@example.com',
      'email.@example.com',
      'email..email@example.com',
      'あいうえお@example.com',
      'email@example.com (Joe Smith)',
      'email@example',
      'email@-example.com',
      'email@111.222.333.44444',
      'email@example..com',
      'Abc..123@example.com',
      '”(),:;<>[]@example.com',
      'just”not”right@example.com',
      'this is"really"notallowed@example.com',
      1,
      0,
      -1
    ] as any[]

    invalidEmails.forEach((email) => {
      expect(() => {
        new Email(email)
      }).toThrow(InvalidEmailError)
    })
  })
})
