export interface IUseCaseOptions {}

export interface IUseCase<TOptions extends IUseCaseOptions, T extends unknown> {
  execute(options: TOptions): Promise<T>
}
