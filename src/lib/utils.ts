import { AxiosError } from 'axios';

import {
  BadFormatError,
  BadStateError,
  ForbiddenError,
  isLightStandsError,
  NetworkError,
  OAuth2Error,
  RemoteError,
  UnauthorizedError,
} from './errors';
import { aeither, Either, Fork, Left, Right, wrap } from './fpcore';
import { ProgressInspectable } from './inspectCx';
import {
  ApiError,
  CancelablePromise,
  DateTime,
  UserPrivateCreationRequest as InternalCreationRequest,
  PublicFeed as InternalPublicFeed,
  PublicPost as InternalPublicPost,
  OpenAPI,
  PublicApplication,
  ServerPublicSettings,
  UserPrivateAccessTokenWithoutToken,
} from './internal';
import { countProgress } from './steams';
import {
  AccessToken,
  App,
  ClientConfig,
  CreationRequest,
  PublicFeed,
  PublicPost,
  PublicSettings,
  SessionAccess,
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
    expiredAt: remoteTokObj.expired_at,
    createdAt: remoteTokObj.created_at,
    active: remoteTokObj.active,
    appid: remoteTokObj.appid,
    scope: remoteTokObj.scope,
    updatedAt: remoteTokObj.updated_at,
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
    createdAt: obj.created_at,
    updatedAt: obj.updated_at,
  };
}

export function internalPublicSettingsAdapter(
  obj: ServerPublicSettings,
): PublicSettings {
  return <PublicSettings>{
    apiLayerVersion: obj.api_layer_version,
    hcaptchaSiteKey: obj.hcaptcha_site_key,
    quote: obj.quote,
    acceptUserCreationRequests: obj.accept_creation_requests,
  };
}

export function date2DateTime(d: Date): DateTime {
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    second: d.getUTCSeconds(),
  };
}

/** Setting environment for generated code.
 * Since the generated code uses a global variable for the configuration, we could not ensure,
 * after the first promise resolved in callback, if the value will keep the same.
 *
 * Note: this function will throw {@link NetworkError} when {@link AxiosError} catched and no response in it.
 * @param callback
 * @param client
 * @param session
 * @returns
 */
export async function ensureOpenAPIEnv<R>(
  callback: () => Promise<R>,
  client: ClientConfig,
  session?: SessionAccess,
): Promise<R> {
  OpenAPI.BASE = client.endpointBase;
  OpenAPI.TOKEN = session?.accessToken;
  try {
    return await callback();
  } catch (e) {
    if (e instanceof AxiosError) {
      if (!e.response) {
        throw new NetworkError(e.message, e.cause, e.toJSON);
      }
    }
    throw e;
  }
}

export function internalPublicFeedAdapter(o: InternalPublicFeed): PublicFeed {
  return {
    ref: o.ref,
    url: o.url,
    urlBlake3: o.url_blake3,
    title: o.title,
    link: o.link,
    description: o.description,
    updatedAt: o.updated_at,
    lastFetchedAt: o.last_fetched_at,
  };
}

export function internalPublicPostAdapter(o: InternalPublicPost): PublicPost {
  return {
    ref: o.ref,
    id: o.id,
    idBlake3: o.id_blake3,
    publishedAt: o.published_at,
    updatedAt: o.updated_at,
    feedRef: o.feed_ref,
    contentTypes: o.content_types,
    title: o.title,
    link: o.link,
    summary: o.summary,
  };
}

export function unreachable(): never {
  throw new BadStateError('unreachable');
}

export function creationRequestAdapter(
  o: InternalCreationRequest,
): CreationRequest {
  return {
    identifier: o.identifier,
    challengeFailedCounter: o.challenge_failed_counter,
    createdAt: o.created_at,
    requestVerificationCounter: o.request_verification_counter,
    requestVerificationAt: o.request_verification_at,
    resolved: o.resolved,
  };
}

const KEYED_ERROR_REGEX = /([\S]+)\((\S+)\)/g;

/**
 * Parse error key in LightStands' error model.
 * If the error key does not contain keys, the result keys will be empty array.
 * @param e the error key
 * @returns [name, keys]
 */
function parseKeyedError(e: string): readonly [string, readonly string[]] {
  const match = KEYED_ERROR_REGEX.exec(e);
  if (match) {
    const name = match[1];
    const keyStr = match[2];
    const keys = keyStr.split(',').map((s) => s.trim());
    return [name, keys];
  } else {
    return [e, []];
  }
}

const ERRORS_NAME_MAPPING: Record<
  string,
  (msg: string, keys: readonly string[]) => RemoteError
> = {
  unauthorised: (message) => new UnauthorizedError(message),
  forbidden: (msg) => new ForbiddenError(msg),
  scopenotcovered: (msg, keys) => new ForbiddenError(msg, keys),
  badformat: (msg, keys) => new BadFormatError(keys, msg),
};

/**
 * Transform standard response into result.
 * @param response the Response instance from Fetch API
 * @param onSuccess will be called if the status code is success (>= 200 && < 300)
 * @param onFailed will be called if a regconisable error if returned
 * @param inspectCx inspection context, supports: progress
 * @returns
 */
export async function transformStdResponse<E, R>(
  response: Response,
  onSuccess: (response: Response) => R | Promise<R>,
  onFailed: (e: RemoteError) => E | Promise<E>,
  inspectCx?: ProgressInspectable,
): Fork<E, R> {
  const onProgress = inspectCx?.onProgress;
  const resp = onProgress
    ? new Response(
        response.body
          ? // eslint-disable-next-line functional/no-return-void
            countProgress(response.body, (loaded) => onProgress(loaded))
          : undefined,
        { headers: response.headers, status: response.status },
      )
    : response;
  if (resp.status >= 200 && resp.status < 300) {
    const ret = await onSuccess(resp);
    return Right(ret);
  } else {
    const payload = await resp.json();
    if (isLightStandsError(payload)) {
      const errors = payload['errors'];
      // eslint-disable-next-line functional/no-loop-statement
      for (const k of Object.keys(errors)) {
        const [name, keys] = parseKeyedError(k);
        if (ERRORS_NAME_MAPPING[name]) {
          return Left(
            await onFailed(ERRORS_NAME_MAPPING[name](errors[k], keys)),
          );
        }
      }
      throw new RemoteError(
        'unknown',
        `error ${Object.keys(errors).join(', ')} is unknown`,
      );
    } else {
      throw new TypeError('response is not a standard API error');
    }
  }
}
