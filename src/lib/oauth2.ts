import { BadStateError } from "./errors"
import { Oauth2Service, OpenAPI } from "./internal"
import { tokenDetailByRefTok } from "./sessions"
import {ClientConfig, Session} from "./types"

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
export async function completeAuthorizationCodeFlow(client: ClientConfig, redirect_uri: string, code_verifier: string, code: string): Promise<Session> {
  OpenAPI.BASE = client.endpointBase
  const response = await Oauth2Service.oauth2ExchangeAccessTokenOauth2TokenPost({
    grant_type: "authorization_code",
    code,
    redirect_uri,
    code_verifier,
    client_id: client.clientId,
    client_secret: client.clientSecret ?? undefined,
  })
  const tokObject = await tokenDetailByRefTok(client, response.refresh_token)
  if (tokObject === null) {
    throw new BadStateError("Token lost just after oauth 2 code exchaning")
  }
  return <Session>{
    accessToken: response.access_token,
    accessTokenObject: tokObject,
  }
}
