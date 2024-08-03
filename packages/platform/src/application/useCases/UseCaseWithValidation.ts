import { get } from 'lodash'
import InvalidInputError from '../errors/InvalidInputError'
import { Logger, toHumanReadableEnum, toHumanReadableJson, truncateString, isEnumValue } from '@hatsuportal/common'
import { IUseCase, IUseCaseOptions } from './IUseCase'

/**
 * Abstract base class for application use cases that require input validation before execution.
 *
 *
 * This class enforces a pattern where all input arguments/options passed to a use case are validated
 * (for type, domain rules, enum values, etc.) before the main business logic runs. If validation fails,
 * a domain-specific error (InvalidInputError) is thrown, ensuring that only valid data reaches the core logic.
 *
 *
 *
 * Concrete use case classes should extend this class, implement the {@link execute} method, and use the provided
 * validation helpers (such as {@link testArgument}, {@link testArgumentInstance}, and {@link testEnumArgument})
 * to check their input. This ensures a consistent validation and error-handling approach across all use cases.
 *
 *
 * Example usage:
 * ```
 *   class CreateUserUseCaseWithValidation extends UseCaseWithValidation<CreateUserOptions> {
 *     async execute(options: CreateUserOptions): Promise<void> {
 *       this.testArgument('username', options, (username) => typeof username === 'string' && username.length > 0)
 *       // ... other validation and business logic ...
 *     }
 *   }
 * ```
 *
 *
 * @template TOptions The type of options/arguments accepted by the use case.
 */
export abstract class UseCaseWithValidation<TOptions extends IUseCaseOptions> implements IUseCase<TOptions> {
  /**
   * Constructs a new UseCaseWithValidation.
   * @param logger Logger instance used for debug/info/warn/error logging during validation and execution.
   */
  constructor(protected readonly logger: Logger) {}

  /**
   * Executes the use case with the provided options.
   *
   * Concrete subclasses must implement this method, typically calling validation helpers
   * before running the main business logic.
   *
   * @param options The input options/arguments for the use case.
   * @throws {InvalidInputError} If validation fails for any argument.
   */
  abstract execute(options: TOptions): Promise<void>

  /**
   * Validates a single argument using a custom test function.
   *
   * @template TArgumentKey The key of the argument in the options object.
   * @param argKey The key of the argument to test (as a string).
   * @param options The options object containing the argument.
   * @param test A function that receives the argument value and returns true if valid, false or throws if invalid.
   * @returns {boolean} True if the argument is valid; otherwise, throws an error.
   * @throws {InvalidInputError} If the argument is invalid.
   */
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

  /**
   * Validates an argument by attempting to construct a domain type instance from it, and optionally running additional tests.
   *
   * @template TDomainType The domain type to instantiate.
   * @template TArgumentKey The key of the argument in the options object.
   * @param Type The constructor of the domain type.
   * @param argKey The key of the argument to test (as a string).
   * @param options The options object containing the argument.
   * @param additionalTests Optional function to run additional checks on the argument and its domain instance.
   * @returns {boolean} True if the argument is valid; otherwise, throws an error.
   * @throws {InvalidInputError} If the argument is invalid or cannot be constructed as the domain type.
   */
  protected testArgumentInstance<TDomainType extends object, TArgumentKey extends keyof TOptions = keyof TOptions>(
    Type: { new (...args: any[]): TDomainType },
    argKey: string,
    options: TOptions,
    additionalTests?: (arg: TOptions[TArgumentKey], domainArg: TDomainType) => boolean
  ): boolean {
    let error: unknown
    const argName = argKey.toString()
    const arg = get(options, argKey)
    this.logger.debug(`Testing argument '${argName}' with requested value ${truncateString(toHumanReadableJson(arg), 100)}`)

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

  /**
   * Validates that an argument is a valid value for a given enum type, and optionally runs additional tests.
   *
   * @template TEnum The enum type.
   * @param EnumType The enum type to check against.
   * @param argKey The key of the argument to test (as a string).
   * @param options The options object containing the argument.
   * @param additionalTests Optional function to run additional checks on the argument.
   * @returns {boolean} True if the argument is a valid enum value; otherwise, throws an error.
   * @throws {InvalidInputError} If the argument is not a valid enum value.
   */
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

  /**
   * Handles invalid arguments by logging a warning and throwing an InvalidInputError.
   *
   * @param argumentName The name of the invalid argument.
   * @param error The error or reason for invalidity.
   * @throws {InvalidInputError} Always throws after logging.
   */
  protected handleInvalidArgument(argumentName: string, error: unknown): void {
    this.logger.warn(`Value for argument ${argumentName} is invalid`, error)
    const errorMessage = `Failed to process request due to illegal argument ${argumentName}`
    if (error instanceof InvalidInputError) {
      throw error // Re-throw the existing InvalidInputError
    } else if (error instanceof Error) {
      throw new InvalidInputError({ message: error.message, cause: error })
    } else {
      throw new InvalidInputError({ message: errorMessage, cause: error })
    }
  }
}
