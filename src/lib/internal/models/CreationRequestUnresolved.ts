/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserPrivateCreationRequest } from './UserPrivateCreationRequest';

export type CreationRequestUnresolved = {
    ok?: boolean;
    creation_request: UserPrivateCreationRequest;
    challenge: string;
};

