/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserAgent } from './UserAgent';

export type PasswordAccessTokenCreating = {
    clientid: string;
    scope: string;
    user_agent_id?: string;
    user_agent?: UserAgent;
    username: string;
    password: string;
};

