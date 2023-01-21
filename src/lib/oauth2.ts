import { encodeBase64 } from './crypto/base64';
import { string2utf8 } from './crypto/util';
import { BadStateError, OAuth2Error } from './errors';
import {
  Fork,
  isRight,
  Left,
  Right,
  unboxLeft,
  unboxRight,
  unwrap,
} from './fpcore';
import { Oauth2Service, OpenAPI } from './internal';
import { tokenDetailByRefTok } from './sessions';
import { ClientConfig, Session, SessionAccess } from './types';
import { parseOAuth2Error, wrapOpenAPI } from './utils';

export type OAuth2AuthorizationCodeFlowRequest = {
  readonly redirect_uri: string;
  readonly scope: string;
  readonly code_verifier: string;
  readonly state?: string;
  readonly ua_id?: string;
};

/** Get the next jump url for authorization code flow.
 * This function generate an url can start authorization code flow by visit in browser.
 *
 * This function uses "plain" PKCE challenge method, this is not recommended. Please use {@link makeAuthCodeFlowUrl} instead.
 *
 * @deprecated This function will be removed in the 2.x major version.
 * @param client
 * @param request Arguements for the authorization
 * @returns The `URL` can start the authorization
 */
export function getAuthorizationUrlForAuthorizationCodeFlow(
  client: ClientConfig,
  request: OAuth2AuthorizationCodeFlowRequest,
): URL {
  const url = new URL('oauth2/~authorize', client.endpointBase);
  const search = url.searchParams;
  search.set('response_type', 'code');
  search.set('client_id', client.clientId);
  if (client.clientSecret) {
    search.set('client_secret', client.clientSecret);
  }
  search.set('code_challenge', request.code_verifier);
  search.set('code_challenge_method', 'plain');
  if (request.state) {
    search.set('state', request.state);
  }
  search.set('redirect_uri', request.redirect_uri);
  search.set('scope', request.scope);
  if (request.ua_id) {
    search.set('ua_id', request.ua_id);
  }
  return url;
}

export type OAuth2AuthCodeFlowRequest = OAuth2AuthorizationCodeFlowRequest & {
  readonly code_challenge_method: 'plain' | 's256';
  readonly ref_tok?: string;
};

/** Get the next jump url for authorization code flow.
 * This function generate an url can start authorization code flow by visit in browser.
 *
 * This function requires [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).
 *
 * @param client
 * @param request Arguements for the authorization
 * @returns The `URL` can start the authorization
 */
export async function makeAuthCodeFlowUrl(
  client: ClientConfig,
  request: OAuth2AuthCodeFlowRequest,
): Promise<URL> {
  const url = new URL('oauth2/~authorize', client.endpointBase);
  const search = url.searchParams;
  search.set('response_type', 'code');
  search.set('client_id', client.clientId);
  if (client.clientSecret) {
    search.set('client_secret', client.clientSecret);
  }
  if (request.code_challenge_method === 'plain') {
    search.set('code_challenge', request.code_verifier);
  } else if (request.code_challenge_method === 's256') {
    const buf = string2utf8(request.code_verifier);
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
    const codeChallenge = encodeBase64(hash);
    search.set('code_challenge', codeChallenge);
  } else {
    throw TypeError(
      `unsupported PKCE challenge method "${request.code_challenge_method}"`,
    );
  }
  if (request.state) {
    search.set('state', request.state);
  }
  if (request.ua_id) {
    search.set('ua_id', request.ua_id);
  }
  if (request.ref_tok) {
    search.set('ref_tok', request.ref_tok);
  }
  search.set('code_challenge_method', request.code_challenge_method);
  search.set('redirect_uri', request.redirect_uri);
  search.set('scope', request.scope);
  return url;
}

/** Complete OAuth 2 authorization code flow using authorization code.
 *
 * @param client client config
 * @param redirect_uri the redirct URI used at the start of authorization
 * @param code_verifier the code verifier string used
 * @param code the authorization code
 * @returns a session object
 */
export async function completeAuthorizationCodeFlow(
  client: ClientConfig,
  redirect_uri: string,
  code_verifier: string,
  code: string,
): Fork<OAuth2Error, Session> {
  OpenAPI.BASE = client.endpointBase;
  const result = await wrapOpenAPI(
    Oauth2Service.oauth2ExchangeAccessTokenOauth2TokenPost({
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      code_verifier,
      client_id: client.clientId,
      client_secret: client.clientSecret ?? undefined,
    }),
  );
  if (isRight(result)) {
    const response = unboxRight(result);
    const fakeSession: SessionAccess = {
      accessToken: response.access_token,
    };
    const tokObject = await tokenDetailByRefTok(
      client,
      fakeSession,
      response.refresh_token,
    );
    if (tokObject === null) {
      throw new BadStateError('Token lost just after OAuth2 code exchanging');
    }
    return Right(<Session>{
      accessToken: response.access_token,
      accessTokenObject: tokObject,
    });
  } else {
    return Left(unwrap(parseOAuth2Error(unboxLeft(result))));
  }
}
