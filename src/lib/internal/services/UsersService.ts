/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PasswordChangeRequest } from '../models/PasswordChangeRequest';
import type { UserPrivateInformation } from '../models/UserPrivateInformation';
import type { UserPrivateReadTagList } from '../models/UserPrivateReadTagList';
import type { UserPublicInformation } from '../models/UserPublicInformation';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UsersService {

    /**
     * Change Password
     * Change password for a user. A user can change it's password.
     * Requires scope: `user.change_password`.
     *
     * Possible RPC errors:
     * - `unauthorised` (HTTP 403)
     * - `scopenotcovered(user.change_password)` (HTTP 401)
     * - `badformat(new_password)` (HTTP 400)
     * @param userid
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static changePasswordUsersUseridChangePasswordPost(
        userid: number,
        requestBody: PasswordChangeRequest,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/{userid}/~change-password',
            path: {
                'userid': userid,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get User Public Information
     * Get user public information of `userid`. Including:
     *
     * - username
     *
     * Possible RESTful Errors:
     * - `notfound(userid)`, `404`
     * @param userid
     * @returns UserPublicInformation Successful Response
     * @throws ApiError
     */
    public static getUserPublicInformationUsersUseridPublicGet(
        userid: number,
    ): CancelablePromise<UserPublicInformation> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{userid}/public',
            path: {
                'userid': userid,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get User Private Information
     * Get user public and private information of `userid`. Including:
     *
     * - username
     * - email address
     *
     * Possible RESTful Errors:
     * - `scopenotcovered(user.read)`, `403`
     * - `notfound(userid)`, `404`
     * @param userid
     * @returns UserPrivateInformation Successful Response
     * @throws ApiError
     */
    public static getUserPrivateInformationUsersUseridPrivateGet(
        userid: number,
    ): CancelablePromise<UserPrivateInformation> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{userid}/private',
            path: {
                'userid': userid,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * List Read Tags
     * List read tags the user created.
     *
     * Requires `tags.read` scope.
     *
     * Possible RESTful errors:
     * - `unauthorized` (HTTP 401)
     * @param userid
     * @param updatedSince
     * @param limit
     * @returns UserPrivateReadTagList Successful Response
     * @throws ApiError
     */
    public static listReadTagsUsersUseridTagsReadGet(
        userid: number,
        updatedSince?: number,
        limit: number = 64,
    ): CancelablePromise<UserPrivateReadTagList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{userid}/tags/_read',
            path: {
                'userid': userid,
            },
            query: {
                'updated_since': updatedSince,
                'limit': limit,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                422: `Validation Error`,
            },
        });
    }

}
