export interface UseCaseOptionsInterface {}

export interface UseCaseInterface<TOptions extends UseCaseOptionsInterface, T extends unknown> {
  execute(options: TOptions): Promise<T>
}
