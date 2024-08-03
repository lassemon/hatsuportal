export class EntityFactoryResult<T, E = Error> {
  private constructor(private readonly _isSuccess: boolean, private readonly _value?: T, private readonly _error?: E) {}

  static ok<U>(value: U): EntityFactoryResult<U, never> {
    return new EntityFactoryResult<U, never>(true, value, undefined)
  }

  static fail<U>(error: U): EntityFactoryResult<never, U> {
    return new EntityFactoryResult<never, U>(false, undefined, error)
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result')
    }
    return this._value!
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result')
    }
    return this._error!
  }

  /**
   * Calls the appropriate function based on the result.
   *
   * Functional programming: Pattern Matching (a.k.a. Sum Type Elimination)
   *
   * **Catamorphism**, or "structured fold" over an algebraic data type.\
   *   It's a way of collapsing a structure into a single value,\
   *   in this case the EntityFactoryResult is collapsed into either a success or failure
   *
   * @param onSuccess - The function to execute if the result is a success.
   * @param onFailure - The function to execute if the result is a failure.
   * @returns The result of the function that was executed.
   */
  match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    if (this._isSuccess) {
      return onSuccess(this._value!)
    }
    return onFailure(this._error!)
  }

  /**
   * @description Executes a function if the result is a success.
   * @param fn - The function to execute if the result is a success.
   * @returns The result itself.
   *
   * @example
   * <caption>Log successful story creation</caption>
   *
   * ```
   * const storyResult = StoryFactory.createStory(storyProps)
   *   .tap(story => console.log(`Story created: ${story.id.value}`))
   *   .tap(story => metrics.increment('stories.created'))
   *   .tap(story => auditLogger.log('story.created', { storyId: story.id.value }))
   * ```
   *
   * @example
   * <caption>The result is still the same, but we've logged the success</caption>
   *
   * ```
   * storyResult.match(
   *   (story) => res.json({ success: true, story }),
   *   (error) => res.status(400).json({ error: error.message })
   * )
   * ```
   *
   * @example
   * <caption>Real-world example: Cache successful results</caption>
   *
   * ```
   * const cachedStoryResult = storyRepository.findById(storyId)
   *   .tap(story => cache.set(`story:${storyId}`, story))
   *   .tap(story => analytics.track('story.viewed', { storyId }))
   * ```
   */
  tap(fn: (value: T) => void): EntityFactoryResult<T, E> {
    if (this._isSuccess) {
      fn(this._value!)
    }
    return this
  }

  /**
   * @description Executes a function if the result is a failure.
   * @param fn - The function to execute if the result is a failure.
   * @returns The result itself.
   *
   * @example
   * <caption>Log and track errors</caption>
   *
   * ```
   * const storyResult = StoryFactory.createStory(storyProps)
   *   .tapError(error => console.error('Story creation failed:', error))
   *   .tapError(error => errorTracker.capture(error))
   *   .tapError(error => metrics.increment('stories.creation.failed'))
   * ```
   * @example
   * <caption>Retry logic with logging</caption>
   *
   * ```
   * const retryStoryCreation = async (props: StoryProps, maxRetries = 3) => {
   *   let attempt = 0
   *
   *   while (attempt < maxRetries) {
   *     const result = await StoryFactory.createStory(props)
   *       .tapError(error => {
   *         attempt++
   *         console.error(`Attempt ${attempt} failed:`, error.message)
   *       })
   *
   *     if (result.isOk()) return result
   *
   *     if (attempt >= maxRetries) {
   *       return result.tapError(error =>
   *         console.error(`All ${maxRetries} attempts failed`)
   *       )
   *     }
   *   }
   * }
   * ```
   */
  tapError(fn: (error: E) => void): EntityFactoryResult<T, E> {
    if (!this._isSuccess) {
      fn(this._error!)
    }
    return this
  }

  // Type guards for better TypeScript support
  isSuccess(): this is EntityFactoryResult<T, never> {
    return this._isSuccess
  }

  isFailure(): this is EntityFactoryResult<never, E> {
    return !this._isSuccess
  }

  equals(other: unknown): boolean {
    if (!(other instanceof EntityFactoryResult)) {
      return false
    }

    if (this.isSuccess() !== other.isSuccess()) {
      return false
    }

    if (this.isSuccess()) {
      // if equals does not exist or returns null | undefined, use ===
      return (this._value as any)?.equals?.(other._value) ?? this._value === other._value
    } else {
      return (this._error as Error)?.message === (other._error as Error)?.message
    }
  }

  toString(): string {
    return `Result<${this._value}, ${this._error}>`
  }
}
