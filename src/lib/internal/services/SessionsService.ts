/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccessTokenCreated } from '../models/AccessTokenCreated';
import type { AccessTokenResult } from '../models/AccessTokenResult';
import type { Body_write_session_scope_by_refresh_token_access_tokens_specific__ref_tok__scope_post } from '../models/Body_write_session_scope_by_refresh_token_access_tokens_specific__ref_tok__scope_post';
import type { PasswordAccessTokenCreating } from '../models/PasswordAccessTokenCreating';
import type { RevokingAccessTokenRequest } from '../models/RevokingAccessTokenRequest';
import type { RevokingCompleted } from '../models/RevokingCompleted';
import type { SessionAccessTokenCreating } from '../models/SessionAccessTokenCreating';
import type { TokenUpdated } from '../models/TokenUpdated';
import type { UpdateTokenExpiringTime } from '../models/UpdateTokenExpiringTime';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SessionsService {

    /**
     * Revoke Session
     * Revoke a session by the access token or the refresh token.
     * `token_type` is the type of `token`, should be one of:
     * - `access_token`
     * - `refresh_token`
     *
     * If revoking by a refresh token, this request must be:
     * - authorized by the session itself.
     * - authorized as another session with scope `session.revoke_other`, which have been created at least 24 hours.
     *
     * Possible RPC errors:
     * - `conditionrequires(token_type,token,created_at)`
     * - `badformat(token_type)`
     * - `notfound(token_type,token)` (HTTP 404)
     * - `unauthorized` (HTTP 401)
     * - `scopenotcovered(session.revoke_other)` (HTTP 403)
     * @param requestBody
     * @returns RevokingCompleted Successful Response
     * @throws ApiError
     */
    public static revokeSessionAccessTokensRevokePost(
        requestBody: RevokingAccessTokenRequest,
    ): CancelablePromise<RevokingCompleted> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/access-tokens/~revoke',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Access Token By Refresh Token
     * Get an access token object by refresh token. Requires `session.list` scope if the refresh token is not associated with the using session.
     *
     * Refresh tokens can be used to refresh expired time without granting access to account,
     * also act as unique identity to access token.
     *
     * Access token itself should remain as secret and keep on the device.
     *
     * Possible errors:
     * - `notfound(ref_tok)`
     * @param refTok
     * @returns AccessTokenResult Successful Response
     * @throws ApiError
     */
    public static getAccessTokenByRefreshTokenAccessTokensSpecificRefTokGet(
        refTok: string,
    ): CancelablePromise<AccessTokenResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/access-tokens/specific/{ref_tok}',
            path: {
                'ref_tok': refTok,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Write Session Scope By Refresh Token
     * Grant or remove specific scope item for a session.
     *
     * | Requires `behalf` scope | Itself | Other Session |
     * | ----------------------- | ------ | ------------- |
     * | Disable                 | No     | Yes           |
     * | Enable                  | Yes    | Yes           |
     *
     * Possible RESTful errors:
     * - `notfound(ref_tok)` (HTTP 404)
     * - `unauthorized` (HTTP 401)
     * @param refTok
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static writeSessionScopeByRefreshTokenAccessTokensSpecificRefTokScopePost(
        refTok: string,
        requestBody?: Body_write_session_scope_by_refresh_token_access_tokens_specific__ref_tok__scope_post,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/access-tokens/specific/{ref_tok}/scope',
            path: {
                'ref_tok': refTok,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Access Token By Password
     * Create a new access token by password.
     *
     * If `user_agent_id` is not null, this endpoint will try to return a recent
     * access token matches `user_agent_id` if all fields match.
     *
     * `user_agent_id` and `user_agent` will be applied to new access token if
     * creating is required.
     *
     * Possible RPC errors:
     * - `notfound(username,password)`
     * @param requestBody
     * @returns AccessTokenCreated Successful Response
     * @throws ApiError
     */
    public static createAccessTokenByPasswordAccessTokensCreateByPasswordPost(
        requestBody: PasswordAccessTokenCreating,
    ): CancelablePromise<AccessTokenCreated> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/access-tokens/~create-by-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Access Token
     * Create another access token. Requires scope `user.create_session`.
     *
     * Possible RPC errors:
     * - `conditionrequires(scope,access_token.scope)`
     * - `notfound(client_id)`
     * - `notfound(auth_code)`: the authorization code is not found or is expired.
     * @param requestBody
     * @returns AccessTokenCreated Successful Response
     * @throws ApiError
     */
    public static createAccessTokenAccessTokensCreatePost(
        requestBody: SessionAccessTokenCreating,
    ): CancelablePromise<AccessTokenCreated> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/access-tokens/~create',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Token Expiring Time
     * Update expired_at to `target`. If `target` is smaller than the current value, success with doing nothing.
     * If `target` is not within 52 weeks of now, set to 52 weeks. The time accuracy only is seconds level.
     *
     * Possible RESTful errors:
     * - `notfound(ref_tok)`, 404
     * @param refTok
     * @param requestBody
     * @returns TokenUpdated Successful Response
     * @throws ApiError
     */
    public static updateTokenExpiringTimeAccessTokensSpecificRefTokRefreshPost(
        refTok: string,
        requestBody: UpdateTokenExpiringTime,
    ): CancelablePromise<TokenUpdated> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/access-tokens/specific/{ref_tok}/~refresh',
            path: {
                'ref_tok': refTok,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
