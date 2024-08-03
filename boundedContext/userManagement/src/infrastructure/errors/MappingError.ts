import InfrastructureError from './InfrastructureError'

// TODO, replace with a more specific infrastructure error
// e.g. in CommentInfrastructureMapper, we should throw a MissingBodyError instead of MappingError
export class MappingError extends InfrastructureError {
  constructor(message?: string) {
    super(message)
  }
}
