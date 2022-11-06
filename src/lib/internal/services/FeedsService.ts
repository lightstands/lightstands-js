/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FeedPosts } from '../models/FeedPosts';
import type { PublicFeed } from '../models/PublicFeed';
import type { PublicPost } from '../models/PublicPost';
import type { ResolvedFeed } from '../models/ResolvedFeed';
import type { ResolveFeedOpts } from '../models/ResolveFeedOpts';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class FeedsService {

    /**
     * Resolve Feed
     * Resolve the feed url and tell the server software listen to the feed if possible.
     *
     * This endpoint have 1 second delay for each call to prevent abuse.
     * @param requestBody
     * @returns ResolvedFeed Successful Response
     * @throws ApiError
     */
    public static resolveFeedFeedsResolvePost(
        requestBody: ResolveFeedOpts,
    ): CancelablePromise<ResolvedFeed> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/feeds/~resolve',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Feed Info
     * Get feed info for `feed_url_blake3`.
     *
     * `feed_url_blake3` is the urlsafe base64 of the hashed url. The encoding or url must be UTF-8.
     *
     * Possible RESTful errors:
     * - `notfound(feed_url)` 404
     * @param feedUrlBlake3
     * @param ifModifiedSince
     * @param ifNoneMatch
     * @returns PublicFeed Successful Response
     * @throws ApiError
     */
    public static getFeedInfoFeedsFeedUrlBlake3Get(
        feedUrlBlake3: string,
        ifModifiedSince?: string,
        ifNoneMatch?: string,
    ): CancelablePromise<PublicFeed> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/feeds/{feed_url_blake3}/',
            path: {
                'feed_url_blake3': feedUrlBlake3,
            },
            headers: {
                'if-modified-since': ifModifiedSince,
                'if-none-match': ifNoneMatch,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Feed Posts
     * List posts of the feed.
     *
     * `pub_since` and `pub_before` are unix timestamps in seconds, to query specific ranges of the posts which published at.
     *
     * Changed in 0.3: the selector starting by `ref_` is deprecated.
     * LightStands Server Software does not promise the ref number order is time-dependent.
     * They will be removed in 0.4.
     * @param feedUrlBlake3
     * @param refGt
     * @param limit
     * @param refLe
     * @param pubOrder
     * @param refGe
     * @param pubSince
     * @param pubBefore
     * @param ifModifiedSince
     * @param ifNoneMatch
     * @returns FeedPosts Successful Response
     * @throws ApiError
     */
    public static getFeedPostsFeedsFeedUrlBlake3PostsGet(
        feedUrlBlake3: string,
        refGt?: number,
        limit: number = 16,
        refLe?: number,
        pubOrder?: ('asc' | 'desc'),
        refGe?: number,
        pubSince?: number,
        pubBefore?: number,
        ifModifiedSince?: string,
        ifNoneMatch?: string,
    ): CancelablePromise<FeedPosts> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/feeds/{feed_url_blake3}/posts/',
            path: {
                'feed_url_blake3': feedUrlBlake3,
            },
            headers: {
                'if-modified-since': ifModifiedSince,
                'if-none-match': ifNoneMatch,
            },
            query: {
                'ref_gt': refGt,
                'limit': limit,
                'ref_le': refLe,
                'pub_order': pubOrder,
                'ref_ge': refGe,
                'pub_since': pubSince,
                'pub_before': pubBefore,
            },
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Content
     * Get specific content for the post.
     *
     * Use `Accept-Language` to ask for specific language.
     * Only accepts [ISO 639-1 codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) and ignore most variants:
     * ```
     * af, ar, bg, bn, ca, cs, cy, da, de, el, en, es, et, fa, fi, fr, gu, he,
     * hi, hr, hu, id, it, ja, kn, ko, lt, lv, mk, ml, mr, ne, nl, no, pa, pl,
     * pt, ro, ru, sk, sl, so, sq, sv, sw, ta, te, th, tl, tr, uk, ur, vi, zh-cn, zh-tw
     * ```
     * The 9th and later lanaguages will be ignored.
     * It's very recommended to always include `*` in your selector.
     *
     * Use `Accept` to ask for specific content type, if this header is not present, any one will be picked.
     * Currently (API Version 0) only supports one specific content type (`**` is allowed) without weight mark. For example:
     *
     * - `Accept: **` work
     * - `Accept: text*` won't work
     * - `Accept: text/html` work
     * - `Accept: text/html;q=0.9` won't work
     * - `Accept: text/html;q=0.9, application/xhtml+xml, **;q=0.8` won't work
     *
     * We may support complete content neogtiation in future, but currently it's been delayed since it's very hard to implement.
     * You can use `/feeds/{feed_url_blake3}/posts/{post_id}` to discover avaliable content types.
     *
     * Possible RESTful errors:
     * - `notfound(feed_url_blake3)`
     * - `notfound(feed_url_blake3,post_id)`
     * - `notfound(feed_url_blake3,post_id,content_type)`
     * - `notfound(feed_url_blake3,post_id,content_type,lang)`
     * @param feedUrlBlake3
     * @param postIdBlake3
     * @param acceptLanguage
     * @param accept
     * @param ifModifiedSince
     * @param ifNoneMatch
     * @returns string Successful Response
     * @throws ApiError
     */
    public static getContentFeedsFeedUrlBlake3PostsPostIdBlake3ContentGet(
        feedUrlBlake3: string,
        postIdBlake3: string,
        acceptLanguage?: string,
        accept?: string,
        ifModifiedSince?: string,
        ifNoneMatch?: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/feeds/{feed_url_blake3}/posts/{post_id_blake3}/content',
            path: {
                'feed_url_blake3': feedUrlBlake3,
                'post_id_blake3': postIdBlake3,
            },
            headers: {
                'accept-language': acceptLanguage,
                'accept': accept,
                'if-modified-since': ifModifiedSince,
                'if-none-match': ifNoneMatch,
            },
            responseHeader: 'Content-Length',
            errors: {
                404: `Not Found`,
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Post
     * @param feedUrlBlake3
     * @param postIdBlake3
     * @param ifModifiedSince
     * @param ifNoneMatch
     * @returns PublicPost Successful Response
     * @throws ApiError
     */
    public static getPostFeedsFeedUrlBlake3PostsPostIdBlake3Get(
        feedUrlBlake3: string,
        postIdBlake3: string,
        ifModifiedSince?: string,
        ifNoneMatch?: string,
    ): CancelablePromise<PublicPost> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/feeds/{feed_url_blake3}/posts/{post_id_blake3}/',
            path: {
                'feed_url_blake3': feedUrlBlake3,
                'post_id_blake3': postIdBlake3,
            },
            headers: {
                'if-modified-since': ifModifiedSince,
                'if-none-match': ifNoneMatch,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
