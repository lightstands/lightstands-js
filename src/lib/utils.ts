import { AllRemoteErrors, ERROR_KEYS, OAuth2Error } from './errors';
import {
  aeither,
  Either,
  filter,
  fold,
  Fork,
  Left,
  Right,
  wrap,
} from './fpcore';
import {
  ApiError,
  CancelablePromise,
  DateTime,
  OpenAPI,
  PublicApplication,
  ServerPublicSettings,
  UserPrivateAccessTokenWithoutToken,
} from './internal';
import {
  AccessToken,
  App,
  ClientConfig,
  PublicSettings,
  Session,
} from './types';

export function wrapOpenAPI<T>(
  original: CancelablePromise<T>,
): Fork<ApiError, T> {
  return aeither(
    {
      left: (val) => {
        if (val instanceof ApiError) {
          return val;
        } else {
          throw TypeError(`expected ApiError, got ${typeof val}`);
        }
      },
      right: (val) => val,
    },
    wrap(original),
  );
}

/** Read an error group from an `ApiError`.
 * Lightstands server software return error as an object, the error name is the key and the decription is the value.
 * This function will ignore unregonisable errors.
 * Still possible throw an error if the body of the `ApiError` is not a JSON.
 *
 * @param e the `ApiError` from internal API
 * @returns `Right<AllRemoteErrors>` if error group detected, `Left<ApiError>` the original error if failed
 */
export function parseLightStandsError(
  e: ApiError,
): Either<ApiError, AllRemoteErrors> {
  const body = JSON.parse(e.body);
  if (
    typeof body === 'object' &&
    typeof body.ok === 'boolean' &&
    typeof body.errors === 'object'
  ) {
    const keys = filter(
      (key) => ERROR_KEYS.includes(key),
      Object.keys(body.errors),
    ) as Iterable<keyof AllRemoteErrors>;
    return Right(
      fold(
        (prev, next) => ({
          ...prev,
          [next]: body.errors[next],
        }),
        <AllRemoteErrors>{},
        keys,
      ),
    );
  } else {
    return Left(e);
  }
}

/** Read an `OAuth2Error` from an `ApiError`.
 *
 * @param e the `ApiError`
 * @returns `Right<OAuth2Error>` if success, the original error as `Left<ApiError>` if failed
 */
export function parseOAuth2Error(e: ApiError): Either<ApiError, OAuth2Error> {
  const body = JSON.parse(e.body);
  if (
    typeof body.error === 'string' &&
    typeof body.error_description === 'string'
  ) {
    return Right(body as OAuth2Error);
  } else {
    return Left(e);
  }
}

export function internalAccessTokenAdaptor(
  remoteTokObj: UserPrivateAccessTokenWithoutToken,
): AccessToken {
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
  };
}

export function internalAppAdapter(obj: PublicApplication): App {
  return <App>{
    appid: obj.appid,
    name: obj.name,
    ownerId: obj.owner_id,
    clientId: obj.client_id,
    scope: obj.scope,
    redirectUri: obj.redirect_uri,
    createdAt: Date.parse(obj.created_at),
    updatedAt: Date.parse(obj.updated_at),
  };
}

export function internalPublicSettingsAdapter(
  obj: ServerPublicSettings,
): PublicSettings {
  return <PublicSettings>{
    apiLayerVersion: obj.api_layer_version,
    hcaptchaSiteKey: obj.hcaptcha_site_key,
    quote: obj.quote,
  };
}

export function date2DateTime(d: Date): DateTime {
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    second: d.getUTCSeconds(),
  };
}

/** Setting environment for generated code.
 * Since the generated code uses a global variable for the configuration, we could not ensure,
 * after the first promise resolved in callback, if the value will keep the same.
 * @param callback
 * @param client
 * @param session
 * @returns
 */
export async function ensureOpenAPIEnv<R>(
  callback: () => Promise<R>,
  client: ClientConfig,
  session?: Session,
): Promise<R> {
  OpenAPI.BASE = client.endpointBase;
  OpenAPI.TOKEN = session?.accessToken;
  return await callback();
}
