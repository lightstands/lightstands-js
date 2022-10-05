/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FeedListMetaList } from '../models/FeedListMetaList';
import type { PrivateFeedList } from '../models/PrivateFeedList';
import type { PublicFeedListPatch } from '../models/PublicFeedListPatch';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FeedListsService {

    /**
     * Get Feed List
     * Get the content of the feed list.
     *
     * Requires scope "feedlist.read".
     * @param listId
     * @returns PrivateFeedList Successful Response
     * @throws ApiError
     */
    public static getFeedListFeedlistsListIdGet(
        listId: number,
    ): CancelablePromise<PrivateFeedList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/feedlists/{list_id}',
            path: {
                'list_id': listId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Patch Feed List
     * Patch a feed list.
     *
     * Tags start with "_" (underscore) are reserved, they may have special behaviour or be ignored by the server software.
     * Tag "_default" only have one in all lists of the user, if it present in a patch, all other lists will be untagged "_default" and the patch will be applied.
     *
     * Unreserved tags are ignored.
     *
     * If patched feed list size > 1MiB, the operation will failed with 507 Insufficient Storage.
     *
     * Requires scope "feedlist.write".
     * @param listId
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static patchFeedListFeedlistsListIdPatch(
        listId: number,
        requestBody: PublicFeedListPatch,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/feedlists/{list_id}',
            path: {
                'list_id': listId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                422: `Validation Error`,
                507: `Insufficient Storage`,
            },
        });
    }

    /**
     * List Feed Lists
     * List all feed lists this user can access.
     *
     * Requires scope "feedlist.list".
     * @param limit
     * @param afterId
     * @returns FeedListMetaList Successful Response
     * @throws ApiError
     */
    public static listFeedListsFeedlistsGet(
        limit: number = 64,
        afterId?: number,
    ): CancelablePromise<FeedListMetaList> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/feedlists/',
            query: {
                'limit': limit,
                'after_id': afterId,
            },
            errors: {
                401: `Unauthorized`,
                422: `Validation Error`,
            },
        });
    }

}
