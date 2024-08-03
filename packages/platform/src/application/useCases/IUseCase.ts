export interface IUseCaseOptions {}

export interface IUseCase<TOptions extends IUseCaseOptions> {
  execute(options: TOptions): Promise<void>
}
