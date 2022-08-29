/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthorizationCodeResponse } from '../models/AuthorizationCodeResponse';
import type { Body_oauth2_exchange_access_token_oauth2__token_post } from '../models/Body_oauth2_exchange_access_token_oauth2__token_post';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class Oauth2Service {

    /**
     * Oauth2 Authorize
     * Start OAuth 2 authorization process.
     *
     * `ua_id` is the user agent identity, a string can be hopefully unique to other user agent.
     * LightStands APIs will try to assign same session for same user agent identity,
     * which can help to against some browsers that frequently removes the local storages.
     *
     * OAuth 2 PKCE extension is required for LightStands OAuth 2 process.
     *
     * This endpoint will redirect the user to LightStands' web application to complete authorization.
     *
     * Max lengths:
     * - `state`: 512 bytes
     * - `ua_id`: 256 bytes
     * - `code_challenge`: 64 bytes
     * @param responseType
     * @param clientId
     * @param redirectUri
     * @param scope
     * @param codeChallenge
     * @param codeChallengeMethod
     * @param state
     * @param uaId
     * @returns void
     * @throws ApiError
     */
    public static oauth2AuthorizeOauth2AuthorizeGet(
        responseType: string,
        clientId: string,
        redirectUri: string,
        scope: string,
        codeChallenge: string,
        codeChallengeMethod: string,
        state?: string,
        uaId?: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/oauth2/~authorize',
            query: {
                'response_type': responseType,
                'client_id': clientId,
                'redirect_uri': redirectUri,
                'scope': scope,
                'code_challenge': codeChallenge,
                'code_challenge_method': codeChallengeMethod,
                'state': state,
                'ua_id': uaId,
            },
            errors: {
                302: `Successful Response`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Oauth2 Exchange Access Token
     * Exchange authorization code for access token.
     *
     * `client_secret` is required when the application have `client_secret`, otherwise the field will be ignored.
     *
     * HTTP status 400 will be returned for normal unexpected conditions:
     * - `unsupported_grant_type`
     * - `invalid_request`
     * - `invalid_client`
     * - `invalid_grant`: PKCE chanllenge failed
     *
     * HTTP status 401 will be returned if the request encounter an unrealiable state:
     * - `invalid_client`: the application have been exists, but currently is unavaliable (deleted or wrong secret)
     * @param formData
     * @returns AuthorizationCodeResponse Successful Response
     * @throws ApiError
     */
    public static oauth2ExchangeAccessTokenOauth2TokenPost(
        formData: Body_oauth2_exchange_access_token_oauth2__token_post,
    ): CancelablePromise<AuthorizationCodeResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/oauth2/~token',
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                422: `Validation Error`,
            },
        });
    }

}
