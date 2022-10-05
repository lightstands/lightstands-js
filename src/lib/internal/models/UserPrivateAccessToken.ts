/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserAgent } from './UserAgent';

export type UserPrivateAccessToken = {
    userid: number;
    refresh_token: string;
    expired_at: number;
    created_at: number;
    active: boolean;
    appid?: number;
    scope: string;
    updated_at: number;
    user_agent?: UserAgent;
    token: string;
};

