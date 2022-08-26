/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserPrivateAccessToken } from './UserPrivateAccessToken';

export type AccessTokenCreated = {
    ok?: boolean;
    access_token: UserPrivateAccessToken;
};

