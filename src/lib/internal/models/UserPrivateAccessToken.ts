/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserAgent } from './UserAgent';

export type UserPrivateAccessToken = {
    userid: number;
    refresh_token: string;
    expired_at: string;
    created_at: string;
    active: boolean;
    appid?: number;
    scope: string;
    updated_at: string;
    user_agent?: UserAgent;
    token: string;
};

