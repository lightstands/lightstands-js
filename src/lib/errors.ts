
export class BadStateError extends Error {
  constructor(message?: string) {
    super(message)

    this.name = "BadStateError"
  }
}


export class BadResponseError extends Error {
  responseText: string
  constructor(responseText: string, message?: string) {
    super(message)

    this.message = "BadResponseError"
    this.responseText = responseText
  }
}

export type AllRemoteErrors = {
  readonly bot?: string
  readonly captcharequired?: string
}
