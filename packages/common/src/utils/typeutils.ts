export type PartialExceptFor<T, K extends keyof T> = Partial<T> & Pick<T, K>

type StringEnum = { [key: string]: string }

export const castToEnum = <T extends StringEnum>(value: string | undefined | null, enumType: T, defaultValue: T[keyof T]): T[keyof T] => {
  if (!value) {
    return defaultValue
  }
  // Check if the value is a valid enum value
  if (Object.values(enumType).includes(value)) {
    return value as T[keyof T]
  }
  // If not, return the default value
  return defaultValue
}

export const NotMutableCreationProperties = ['id', 'createdBy', 'createdByUserName', 'createdAt', 'updatedAt'] as const
type NotMutableCreationPropertiesType = (typeof NotMutableCreationProperties)[number]
export type OmitNotMutableCreationProperties<T> = Omit<T, NotMutableCreationPropertiesType>

export const NotMutableUpdateProperties = ['createdBy', 'createdByUserName', 'createdAt'] as const
type NotMutableUpdatePropertiesType = (typeof NotMutableUpdateProperties)[number]
export type OmitNotMutableUpdateProperties<T> = Omit<T, NotMutableUpdatePropertiesType>
