/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserPrivateAccessToken } from './UserPrivateAccessToken';
import type { UserPrivateCreationRequest } from './UserPrivateCreationRequest';
import type { UserPrivateUser } from './UserPrivateUser';

export type CreationRequestResolved = {
    ok?: boolean;
    creation_request: UserPrivateCreationRequest;
    user: UserPrivateUser;
    access_token: UserPrivateAccessToken;
    challenge: string;
};

