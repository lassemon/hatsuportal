import { IUseCase, IUseCaseOptions } from './IUseCase'
import { get } from 'lodash'
import { InvalidInputError } from '../errors/InvalidInputError'
import { toHumanReadableEnum, toHumanReadableJson, isEnumValue, Logger } from '@hatsuportal/common'

export abstract class UseCaseWithValidation<TOptions extends IUseCaseOptions> implements IUseCase<TOptions> {
  constructor(protected readonly logger: Logger) {}

  abstract execute(options: TOptions): Promise<void>

  protected testArgument<TArgumentKey extends keyof TOptions = keyof TOptions>(
    argKey: string,
    options: TOptions,
    test: (arg: TOptions[TArgumentKey]) => boolean
  ): boolean {
    let error: unknown
    const argName = argKey.toString()
    const arg = get(options, argKey)
    this.logger.debug(`Testing argument '${argName}'`)

    try {
      if (test(arg) ?? true) {
        this.logger.debug(`Value for argument '${argName}' is valid`)
        return true
      }
    } catch (e) {
      error = e
    }

    this.handleInvalidArgument(argName, error)
    return false
  }

  protected testArgumentInstance<TDomainType extends object, TArgumentKey extends keyof TOptions = keyof TOptions>(
    Type: { new (...args: any[]): TDomainType },
    argKey: string,
    options: TOptions,
    additionalTests?: (arg: TOptions[TArgumentKey], domainArg: TDomainType) => boolean
  ): boolean {
    let error: unknown
    const argName = argKey.toString()
    const arg = get(options, argKey)
    this.logger.debug(`Testing argument '${argName}' with requested value ${toHumanReadableJson(arg)}`)

    try {
      const domainArg = new Type(arg)

      if (additionalTests?.(arg, domainArg) ?? true) {
        this.logger.debug(`Value for argument '${argName}' is valid`)
        return true
      }
    } catch (e) {
      error = e
    }

    this.handleInvalidArgument(argName, error)
    return false
  }

  protected testEnumArgument<TEnum extends { [key: string]: string | number }>(
    EnumType: TEnum,
    argKey: string,
    options: TOptions,
    additionalTests?: (arg: TOptions[keyof TOptions]) => boolean
  ): boolean {
    let error: unknown
    const argName = argKey.toString()
    const arg: TOptions[keyof TOptions] = get(options, argKey)
    this.logger.debug(`Testing argument '${argName}' with requested value ${toHumanReadableJson(arg)}`)

    try {
      if (isEnumValue(arg, EnumType)) {
        if (additionalTests?.(arg) ?? true) {
          this.logger.debug(`Value for argument '${argName}' is a valid enum value for ${toHumanReadableEnum(EnumType)}.`)
          return true
        }
      } else {
        throw new InvalidInputError(`Invalid enum value '${arg}' for enum '${argName}', must be one of ${toHumanReadableEnum(EnumType)}.`)
      }
    } catch (e) {
      error = e
    }

    this.handleInvalidArgument(argName, error)
    return false
  }

  protected handleInvalidArgument(argumentName: string, error: unknown): void {
    this.logger.warn(`Value for argument ${argumentName} is invalid`, error)
    const errorMessage = `Failed to process request due to illegal argument ${argumentName}`
    if (error instanceof InvalidInputError) {
      throw error // Re-throw the existing InvalidInputError
    } else if (error instanceof Error) {
      throw new InvalidInputError(error.message)
    } else {
      throw new InvalidInputError(errorMessage)
    }
  }
}
