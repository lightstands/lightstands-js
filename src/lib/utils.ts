import { AllRemoteErrors, BadResponseError, ERROR_KEYS, OAuth2Error } from "./errors";
import { aeither, Either, filter, fold, Fork, Left, Right, wrap } from "./fpcore";
import { ApiError, CancelablePromise, UserPrivateAccessTokenWithoutToken } from "./internal";
import { AccessToken } from "./types";

/**
 *
 */
export function ensureErrors(jsonBody: unknown): Either<(TypeError | BadResponseError), Record<string, unknown>> {
  if (typeof jsonBody === "object" && jsonBody !== null) {
    if (typeof (jsonBody as {errors: unknown}).errors === "object") {
      const errors = (jsonBody as {errors: Record<string | number | symbol, unknown>}).errors;
      for (const k in errors) {
        if (typeof k !== "string") {
          return Left(new TypeError(`expected string, got ${typeof k}`))
        }
      }
      return Right(errors as Record<string, unknown>)
    } else {
      return Left(new BadResponseError(JSON.stringify(jsonBody), "could not found 'errors' object"))
    }
  } else {
    return Left(new BadResponseError(JSON.stringify(jsonBody), "could not found 'errors' object"))
  }
}

export function wrapOpenAPI<T>(original: CancelablePromise<T>): Fork<ApiError, T> {
  return aeither({
    left: (val) => {
      if (val instanceof ApiError) {
        return val
      } else {
        throw TypeError(`expected ApiError, got ${typeof val}`)
      }
    },
    right: (val) => val,
  },(wrap(original)))
}

/** Read an error group from an `ApiError`.
 * Lightstands server software return error as an object, the error name is the key and the decription is the value.
 * This function will ignore unregonisable errors.
 * Still possible throw an error if the body of the `ApiError` is not a JSON.
 *
 * @param e the `ApiError` from internal API
 * @returns `Right<AllRemoteErrors>` if error group detected, `Left<ApiError>` the original error if failed
 */
export function parseLightStandsError(e: ApiError): Either<ApiError, AllRemoteErrors> {
  const body = JSON.parse(e.body)
  if (typeof body === "object" && typeof body.ok === "boolean" && typeof body.errors === "object") {
    const keys = filter(
      (key) => ERROR_KEYS.includes(key),
      Object.keys(body.errors)) as Iterable<keyof AllRemoteErrors>
    return Right(
      fold(
        (prev, next) => ({
          ...prev,
          [next]: body.errors[next]
        }), <AllRemoteErrors>{}, keys))
  } else {
    return Left(e)
  }
}

/** Read an `OAuth2Error` from an `ApiError`.
 *
 * @param e the `ApiError`
 * @returns `Right<OAuth2Error>` if success, the original error as `Left<ApiError>` if failed
 */
export function parseOAuth2Error(e: ApiError): Either<ApiError, OAuth2Error> {
  const body = JSON.parse(e.body)
  if (typeof body.error === "string" && typeof body.error_description === "string") {
    return Right(body as OAuth2Error)
  } else {
    return Left(e)
  }
}

export function internalAccessTokenAdaptor(remoteTokObj: UserPrivateAccessTokenWithoutToken): AccessToken {
  return <AccessToken>{
    userid: remoteTokObj.userid,
    refreshToken: remoteTokObj.refresh_token,
    expiredAt: Date.parse(remoteTokObj.expired_at),
    createdAt: Date.parse(remoteTokObj.created_at),
    active: remoteTokObj.active,
    appid: remoteTokObj.appid,
    scope: remoteTokObj.scope,
    updatedAt: Date.parse(remoteTokObj.updated_at),
    userAgent: remoteTokObj.user_agent,
  }
}
