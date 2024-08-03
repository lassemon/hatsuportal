import InvalidEnumValueError from '../errors/InvalidEnumValueError'

export type PartialExceptFor<T, K extends keyof T> = Partial<T> & Pick<T, K>

export type EnumType = { [key: string]: string | number } // in this app, allow only string or number enums
export type EnumValue<T extends EnumType> = T[keyof T]

export type PromiseOrValue<T> = Promise<T> | T

export const castToEnum = <T extends EnumType>(
  value: string | number | undefined | null,
  enumType: T,
  defaultValue?: T[keyof T]
): T[keyof T] => {
  if (!value && !defaultValue) {
    throw new InvalidEnumValueError(`Cannot cast value '${value}' to enum '${enumType}', no fallback value provided`)
  }

  if (!value) {
    return defaultValue!
  }
  if (Object.values(enumType).includes(value)) {
    return value as T[keyof T]
  }
  return defaultValue!
}

export type Maybe<T> = T | undefined | null

export const isPromise = <T>(value: T | Promise<T>): value is Promise<T> => {
  return !!value && typeof (value as any).then === 'function'
}

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T

export const isUndefined = (value: unknown): value is undefined => {
  return typeof value === 'undefined'
}
