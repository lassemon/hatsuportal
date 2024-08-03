export type PartialExceptFor<T, K extends keyof T> = Partial<T> & Pick<T, K>

export type EnumType = { [key: string]: string | number } // in this app, allow only string or number enums
export type EnumValue<T extends EnumType> = T[keyof T]

export type PromiseOrValue<T> = Promise<T> | T

export const castToEnum = <T extends EnumType>(
  value: string | number | undefined | null,
  enumType: T,
  defaultValue: T[keyof T]
): T[keyof T] => {
  if (!value) {
    return defaultValue
  }
  if (Object.values(enumType).includes(value)) {
    return value as T[keyof T]
  }
  return defaultValue
}

export type Maybe<T> = T | undefined | null

export const isPromise = <T>(value: T | Promise<T>): value is Promise<T> => {
  return !!value && typeof (value as any).then === 'function'
}
