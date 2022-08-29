/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublicApplication } from '../models/PublicApplication';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ApplicationsService {

    /**
     * Get App By Client Id
     * Get application information by client identity.
     * @param clientId
     * @returns PublicApplication Successful Response
     * @throws ApiError
     */
    public static getAppByClientIdAppsByClientIdClientIdGet(
        clientId: string,
    ): CancelablePromise<PublicApplication> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/apps/by-client-id/{client_id}',
            path: {
                'client_id': clientId,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get App By Appid
     * Get application information by application id.
     * @param appid
     * @returns PublicApplication Successful Response
     * @throws ApiError
     */
    public static getAppByAppidAppsByIdAppidGet(
        appid: number,
    ): CancelablePromise<PublicApplication> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/apps/by-id/{appid}',
            path: {
                'appid': appid,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

}
