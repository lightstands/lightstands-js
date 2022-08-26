/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PasswordChangeRequest } from '../models/PasswordChangeRequest';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserInformationService {

    /**
     * Change Password
     * Change password for a user. A user can change it's password.
     * Requires scope: `user.change_password`.
     *
     * Possible errors:
     * - `unauthorised`
     * - `scopenotcovered`
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
                401: `Unauthorized`,
                403: `Forbidden`,
                422: `Validation Error`,
            },
        });
    }

}
