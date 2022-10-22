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

export class RemoteError extends Error {
  readonly keys: readonly string[] | undefined;

  constructor(name: string, message?: string, keys?: readonly string[]) {
    super(message);
    this.name = name;
    this.keys = keys;
  }

  matchKeys(expected?: readonly string[]) {
    return (
      (typeof expected === 'undefined' && typeof this.keys === 'undefined') ||
      (typeof expected !== 'undefined' &&
        this.keys?.reduce(
          (prev, curr, i) =>
            prev && (expected.length > i ? curr === expected[i] : false),
          true,
        )) ||
      false
    );
  }
}

export class NotFoundError extends RemoteError {
  readonly key?: string;

  constructor(key?: string | readonly string[], message?: string) {
    const name =
      typeof key === 'string'
        ? `NotFoundError(${key})`
        : typeof key === 'undefined'
        ? 'NotFoundError'
        : `NotFoundError${key.join(',')}`;
    const keys =
      typeof key === 'string'
        ? [key]
        : typeof key === 'undefined'
        ? undefined
        : key;
    super(name, message, keys);
  }
}

export class UnauthorizedError extends RemoteError {
  constructor(message?: string) {
    super('UnauthorizedError', message);
  }
}

export class ForbiddenError extends RemoteError {
  constructor(message?: string) {
    super('ForbiddenError', message);
  }
}

export class InsufficientStorageError extends RemoteError {
  constructor(message?: string) {
    super('InsufficientStorageError', message);
  }
}

export class BotError extends RemoteError {
  constructor(message?: string) {
    super('BotError', message);
  }
}

export class CaptchaRequiredError extends RemoteError {
  constructor(message?: string) {
    super('CaptchaRequiredError', message);
  }
}

export class ConditionRequiresError extends RemoteError {
  constructor(keys: readonly string[], message?: string) {
    super('CondtionRequiresError', message, keys);
  }
}

export class BadFormatError extends RemoteError {
  constructor(keys: readonly string[], message?: string) {
    super('BadFormatError', message, keys);
  }
}

export class ExistsError extends RemoteError {
  constructor(keys: readonly string[], message?: string) {
    super('ExistsError', message, keys);
  }
}

export const ERROR_KEY_REGEXP = /^([a-zA-Z0-9]+)(\([\S,]+\))?$/m;

export function matchErrorDecl(
  errordecl: string,
): readonly [string, string | null] | null {
  const match = ERROR_KEY_REGEXP.exec(errordecl);
  if (match) {
    return [match[1], match.length > 2 ? match[2] : null];
  } else {
    return null;
  }
}

export type LightStandsErrorObject = {
  readonly ok: boolean;
  readonly errors: Record<string, string>;
};

export function isLightStandsError(
  raw: unknown,
): raw is LightStandsErrorObject {
  if (typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if (typeof o['ok'] === 'boolean' && typeof o['errors'] === 'object') {
      return true;
    }
  }
  return false;
}

export type OAuth2Error = {
  readonly error: string;
  readonly error_url?: string;
  readonly error_description: string;
};
