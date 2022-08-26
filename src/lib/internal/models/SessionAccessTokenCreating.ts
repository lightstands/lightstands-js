/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserAgent } from './UserAgent';

export type SessionAccessTokenCreating = {
    clientid: string;
    scope: string;
    user_agent_id?: string;
    user_agent?: UserAgent;
    auth_code?: string;
};

