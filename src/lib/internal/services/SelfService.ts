/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ServerPublicSettings } from '../models/ServerPublicSettings';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SelfService {

    /**
     * Public Settings
     * Get server public settings.
     * @returns ServerPublicSettings Successful Response
     * @throws ApiError
     */
    public static publicSettingsSelfSettingsGet(): CancelablePromise<ServerPublicSettings> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/self/settings',
        });
    }

    /**
     * Generate 204
     * Generate a 204 response
     * @returns void
     * @throws ApiError
     */
    public static generate204SelfGenerate204Get(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/self/~generate-204',
        });
    }

}
