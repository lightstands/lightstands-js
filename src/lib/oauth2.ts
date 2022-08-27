import { BadStateError, OAuth2Error } from "./errors"
import { Fork, isRight, Left, Right, unboxLeft, unboxRight, unwrap } from "./fpcore"
import { Oauth2Service, OpenAPI } from "./internal"
import { tokenDetailByRefTok } from "./sessions"
import {ClientConfig, Session} from "./types"
import { parseOAuth2Error, wrapOpenAPI } from "./utils"

export type OAuth2AuthorizationCodeFlowRequest = {
  readonly redirect_uri: string
  readonly scope: string
  readonly code_verifier: string
  readonly state?: string
  readonly ua_id?: string
}

export function getAuthorizationUrlForAuthorizationCodeFlow(client: ClientConfig, request: OAuth2AuthorizationCodeFlowRequest): URL {
  const url = new URL('oauth2/~authorize', client.endpointBase)
  const search = url.searchParams
  search.set("response_type", "code")
  for (const k in request) {
    const val = (request as Record<string, string | undefined>)[k]
    if (typeof val !== "undefined") {
      search.set(k, val)
    }
  }
  search.set("code_challenge_method", "plain") // TODO: use S256 by default
  return url
}

/** Complete OAuth 2 authorization code flow using authorization code.
 *
 * @param client client config
 * @param redirect_uri the redirct URI used at the start of authorization
 * @param code_verifier the code verifier string used
 * @param code the authorization code
 * @returns a session object
 */
export async function completeAuthorizationCodeFlow(client: ClientConfig, redirect_uri: string, code_verifier: string, code: string): Fork<OAuth2Error, Session> {
  OpenAPI.BASE = client.endpointBase
  const result = await wrapOpenAPI(Oauth2Service.oauth2ExchangeAccessTokenOauth2TokenPost({
    grant_type: "authorization_code",
    code,
    redirect_uri,
    code_verifier,
    client_id: client.clientId,
    client_secret: client.clientSecret ?? undefined,
  }))
  if (isRight(result)) {
    const response = unboxRight(result)
    const tokObject = await tokenDetailByRefTok(client, response.refresh_token)
    if (tokObject === null) {
      throw new BadStateError("Token lost just after oauth 2 code exchaning")
    }
    return Right(<Session>{
      accessToken: response.access_token,
      accessTokenObject: tokObject,
    })
  } else {
    return Left(unwrap(parseOAuth2Error(unboxLeft(result))))
  }
}
