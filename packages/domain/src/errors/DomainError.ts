class DomainError extends Error {
  // This is needed so Logstash picks up the stack trace field for display in Kibana
  public readonly stack_trace: string

  constructor(message?: string) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
    this.stack_trace = this.stack!
  }
}

export default DomainError
