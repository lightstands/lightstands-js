/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserPrivateCreationRequest } from './UserPrivateCreationRequest';

export type VerificationRequested = {
    ok?: boolean;
    creation_request: UserPrivateCreationRequest;
};

