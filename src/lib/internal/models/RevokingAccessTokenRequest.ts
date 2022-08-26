/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type RevokingAccessTokenRequest = {
    token_type: ('access_token' | 'refresh_token');
    token: string;
};

