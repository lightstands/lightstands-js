/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type UserPrivateCreationRequest = {
    identifier: string;
    challenge_failed_counter: number;
    created_at: number;
    request_verification_at?: number;
    request_verification_counter: number;
    resolved: boolean;
};

