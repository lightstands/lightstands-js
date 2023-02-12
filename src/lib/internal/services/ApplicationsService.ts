/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppConfiguration } from '../models/AppConfiguration';
import type { AppListChunk } from '../models/AppListChunk';
import type { AppRecipe } from '../models/AppRecipe';
import type { PublicApplication } from '../models/PublicApplication';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ApplicationsService {

    /**
     * Get App By Client Id
     * Get application information by client identity.
     *
     * Possible RESTful errors:
     * - `notfound(client_id)` (HTTP 404)
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
     * Configure App
     * Set app configuration.
     *
     * Possible RESTful errors:
     * - `badformat(redirect_uri)` (HTTP 400)
     * - `forbidden` (HTTP 403)
     * - `notfound(client_id)` (HTTP 404)
     * @param clientId
     * @param requestBody
     * @returns PublicApplication Successful Response
     * @throws ApiError
     */
    public static configureAppAppsByClientIdClientIdPatch(
        clientId: string,
        requestBody: AppConfiguration,
    ): CancelablePromise<PublicApplication> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/apps/by-client-id/{client_id}',
            path: {
                'client_id': clientId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get App By Appid
     * Get application information by application id.
     *
     * Possible RESTful errors:
     * - `notfound(appid)` (HTTP 404)
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

    /**
     * List Apps By Userid
     * List apps for an user, `owner_id` is the userid.
     * This endpoint won't fail with 404 even if the userid `owner_id` is not found on LightStands.
     *
     * Requires `apps.x` scope.
     *
     * Possible RESTful errors:
     * - `forbidden` (HTTP 403)
     * @param ownerId
     * @param appidGt
     * @param limit
     * @returns AppListChunk Successful Response
     * @throws ApiError
     */
    public static listAppsByUseridAppsByOwnerIdOwnerIdGet(
        ownerId: number,
        appidGt?: number,
        limit: number = 32,
    ): CancelablePromise<AppListChunk> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/apps/by-owner-id/{owner_id}/',
            path: {
                'owner_id': ownerId,
            },
            query: {
                'appid_gt': appidGt,
                'limit': limit,
            },
            errors: {
                403: `Forbidden`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * New App
     * Create a new application. Requires "apps.w" scope.
     *
     * If `owner_id` not supplied, use the active session's user.
     *
     * Possible RESTful errors:
     * - `forbidden` (HTTP 403)
     * - `badformat(redirect_uri)` (HTTP 400)
     * - `unauthorised` (HTTP 401)
     * @param requestBody
     * @returns PublicApplication Successful Response
     * @throws ApiError
     */
    public static newAppAppsPut(
        requestBody: AppRecipe,
    ): CancelablePromise<PublicApplication> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/apps/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                422: `Validation Error`,
            },
        });
    }

}
