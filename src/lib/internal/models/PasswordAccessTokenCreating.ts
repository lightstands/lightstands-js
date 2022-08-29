/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserAgent } from './UserAgent';

export type PasswordAccessTokenCreating = {
    client_id: string;
    scope: string;
    user_agent_id?: string;
    user_agent?: UserAgent;
    username: string;
    password: string;
};

