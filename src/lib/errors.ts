export class BadStateError extends Error {
  constructor(message?: string) {
    super(message);

    this.name = 'BadStateError';
  }
}

export class BadResponseError extends Error {
  readonly responseText: string;
  constructor(responseText: string, message?: string) {
    super(message);

    this.name = 'BadResponseError';
    this.responseText = responseText;
  }
}

export class NotFoundError extends Error {
  readonly key?: string;

  constructor(key?: string, message?: string) {
    super(message);

    this.name =
      typeof key !== 'undefined' ? `NotFoundError(${key})` : 'NotFoundError';
    this.key = key;
  }
}

export type AllRemoteErrors = {
  readonly bot?: string;
  readonly captcharequired?: string;
};

export const ERROR_KEYS = ['bot', 'captcharequired'];

export type OAuth2Error = {
  readonly error: string;
  readonly error_url?: string;
  readonly error_description: string;
};
