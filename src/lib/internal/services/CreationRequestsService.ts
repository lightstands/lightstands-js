/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChallengeAnswer } from '../models/ChallengeAnswer';
import type { ChallengeCheck } from '../models/ChallengeCheck';
import type { CreationRequest } from '../models/CreationRequest';
import type { CreationRequestCreated } from '../models/CreationRequestCreated';
import type { CreationRequestFinal } from '../models/CreationRequestFinal';
import type { CreationRequestResolved } from '../models/CreationRequestResolved';
import type { CreationRequestUnresolved } from '../models/CreationRequestUnresolved';
import type { VerificationInitFailed } from '../models/VerificationInitFailed';
import type { VerificationRequested } from '../models/VerificationRequested';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CreationRequestsService {

    /**
     * Put Creation Request
     * Request user creation (or registration) process. The `req_id` should be in format "\<verification_kind\>:\<verification_identity\>".
     *
     * Supported verification kind(s):
     * - `email`: the identity should be the email address
     *
     * Possible Restful errors:
     * - `badformat(req_id)`: the format of `req_id` could not be recognised. (HTTP 400)
     * - `bot`: You are being detected as a bot. (HTTP 403)
     * - `hcaptcharequired`: This endpoint requires hcaptcha verification. (HTTP 403)
     * @param reqId
     * @param requestBody
     * @returns CreationRequestCreated Successful Response
     * @throws ApiError
     */
    public static putCreationRequestCreationRequestsReqIdPut(
        reqId: string,
        requestBody: CreationRequest,
    ): CancelablePromise<CreationRequestCreated> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/creation_requests/{req_id}',
            path: {
                'req_id': reqId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                403: `Forbidden`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Request Creation Verification
     * Request verification for a creation request. The actual behaviour depends on the verification kind defined in identity.
     * The return is expected to have two states: Requested or InitFailed.
     *
     * Possible errors:
     * - `badformat(req_id)`: the format of `req_id` could not be recognised.
     *
     * InitFailed possible reasons:
     * - General:
     * - `unsupported`: the server is not configured to support this method.
     * - `not-required`: this method doesn't need this step.
     * - For `email` kind:
     * - `throttled`: your request is being throttled.
     * @param reqId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static requestCreationVerificationCreationRequestsReqIdRequestVerifyPost(
        reqId: string,
    ): CancelablePromise<(VerificationRequested | VerificationInitFailed)> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/creation_requests/{req_id}/~request-verify',
            path: {
                'req_id': reqId,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Resolve Creation Request
     * Try to resolve the creation request.
     *
     * Possible errors:
     * - `notfound(req_id)`
     * - `exists(username)`
     * @param reqId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resolveCreationRequestCreationRequestsReqIdResolvePost(
        reqId: string,
        requestBody: CreationRequestFinal,
    ): CancelablePromise<(CreationRequestResolved | CreationRequestUnresolved)> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/creation_requests/{req_id}/~resolve',
            path: {
                'req_id': reqId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not Found`,
                409: `Conflict`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Check Challenge
     * Check if the challenge can be completed by the code.
     *
     * Possible errors:
     * - `notfound(req_id)`
     * @param reqId
     * @param requestBody
     * @returns ChallengeAnswer Successful Response
     * @throws ApiError
     */
    public static checkChallengeCreationRequestsReqIdCheckChallengePost(
        reqId: string,
        requestBody: ChallengeCheck,
    ): CancelablePromise<ChallengeAnswer> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/creation_requests/{req_id}/~check-challenge',
            path: {
                'req_id': reqId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

}
