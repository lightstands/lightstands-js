/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserPrivateCreationRequest } from './UserPrivateCreationRequest';

export type VerificationInitFailed = {
    ok?: boolean;
    creation_request: UserPrivateCreationRequest;
    reason: string;
};

