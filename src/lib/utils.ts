import { BadStateError, OAuth2Error } from './errors';
import { aeither, Either, Fork, Left, Right, wrap } from './fpcore';
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
  session?: SessionAccess,
): Promise<R> {
  OpenAPI.BASE = client.endpointBase;
  OpenAPI.TOKEN = session?.accessToken;
  return await callback();
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
