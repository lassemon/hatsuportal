import { vi } from 'vitest'

export const mockClass = <T extends new (...args: any[]) => any>(originalClass: T) => {
  const methodNames = Object.getOwnPropertyNames(originalClass.prototype).filter(
    (m) => m !== 'constructor' && typeof originalClass.prototype[m] === 'function'
  )

  const mockedInstance: Record<string, any> = {}
  for (const name of methodNames) {
    mockedInstance[name] = vi.fn()
  }

  const MockedClass = vi.fn(() => mockedInstance) as unknown as T
  return { MockedClass, mockedInstance }
}
