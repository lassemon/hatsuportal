export { VisibilityEnum } from './enums/VisibilityEnum'
export { EntityTypeEnum } from './enums/EntityTypeEnum'
export { UserRoleEnum } from './enums/UserRoleEnum'
export { OrderEnum } from './enums/OrderEnum'
export { SortableKeyEnum } from './enums/SortableKeyEnum'
export { ImageStateEnum } from './enums/ImageStateEnum'
export { ImageRoleEnum } from './enums/ImageRoleEnum'
export { ColorSchemeEnum } from './enums/ColorSchemeEnum'
export { parseCssColor, isValidCssColor, type ParseCssColorResult } from './colors/parseCssColor'
export { CSS_COLOR_MAX_LENGTH } from './colors/parseCssColor'

export type { PartialExceptFor, Maybe, DeepPartial } from './utils/typeutils'
export { castToEnum, isPromise, isUndefined, isRecord } from './utils/typeutils'
export type { EnumType, EnumValue, PromiseOrValue } from './utils/typeutils'

export {
  uuid,
  removeStrings,
  removeLeadingComma,
  removeTrailingComma,
  containsWhitespace,
  toHumanReadableJson,
  toHumanReadableEnum,
  omitUndefined,
  omitNullAndUndefined,
  omitNullAndUndefinedAndEmpty,
  truncateString,
  withField
} from './utils/common'
export { dateTimeNow, unixtimeNow, dateStringFromUnixTime, getTimestamp } from './utils/time'
export { isBoolean, isString, isNumber, isNonStringOrEmpty, isEnumValue, validateAndCastEnum } from './utils/validators'

export { ErrorFoundation, type ErrorFoundationInput } from './errors/ErrorFoundation'
export { InvalidEnumValueError } from './errors/InvalidEnumValueError'
export { EntityFactoryResult } from './utils/EntityFactoryResult'
