import { encodeBase64 } from './crypto/base64';
import { blake3 } from './crypto/blake3';
import { string2utf8 } from './crypto/util';
import { NotFoundError } from './errors';
import { aeither, Fork, Left, map, Right } from './fpcore';
import { FeedsService } from './internal';
import { ClientConfig } from './types';
import { PublicFeed, PublicPost } from './types';
import {
  ensureOpenAPIEnv,
  internalPublicFeedAdapter,
  internalPublicPostAdapter,
  unreachable,
  wrapOpenAPI,
} from './utils';

/** Get information of the feed.
 *
 * This function comes with two variants: `*Blake3` and `*ByUrl`.
 * - `*Blake3` variant receive an `UInt8Array`, the blake3 hash, instead of its base64 coding version
 * - `*ByURl` variant receive a string, the original url.
 *
 * @param client client config
 * @param feedUrlBlake3Base64 the urlsafe base64 blake3-hash of the feed url
 * @returns NotFoundError or the feed metadata
 */
export function getFeedInfo(
  client: ClientConfig,
  feedUrlBlake3Base64: string,
): Fork<NotFoundError, PublicFeed> {
  return ensureOpenAPIEnv(() => {
    return aeither(
      {
        left(l) {
          if (l.status == 404) {
            return new NotFoundError('feed_url_blake3');
          }
          throw l;
        },
        right(r) {
          return internalPublicFeedAdapter(r);
        },
      },
      wrapOpenAPI(
        FeedsService.getFeedInfoFeedsFeedUrlBlake3Get(feedUrlBlake3Base64),
      ),
    );
  }, client);
}

/** It's an variant of `getFeedInfo`, see the document for detail. */
export function getFeedInfoBlake3(
  client: ClientConfig,
  feedUrlBlake3: Uint8Array,
) {
  return getFeedInfo(client, encodeBase64(feedUrlBlake3));
}

/** It's an variant of `getFeedInfo`, see the document for detail. */
export async function getFeedInfoByUrl(client: ClientConfig, feedUrl: string) {
  return getFeedInfoBlake3(client, await blake3(string2utf8(feedUrl)));
}

export type FeedPostListPage = {
  readonly nextRefGt?: number;
  readonly posts: readonly PublicPost[];
};

/** List the metadata of the posts of a feed.
 *
 * This function comes with two variants: `*Blake3` and `*ByUrl`.
 * - `*Blake3` variant receive an `UInt8Array`, the blake3 hash, instead of its base64 coding version
 * - `*ByURl` variant receive a string, the original url.
 *
 * @param client client config
 * @param feedUrlBlake3Base64 the urlsafe base64 blake3-hash of the feed url
 * @param refGt
 * @param limit the max number fetching, default to `16`
 * @returns NotFoundError or the page of the list
 */
export async function getFeedPosts(
  client: ClientConfig,
  feedUrlBlake3Base64: string,
  refGt?: number,
  limit?: number,
) {
  if (typeof limit != 'undefined' && (limit > 128 || limit < 0)) {
    throw new RangeError('limit must between 0 to 128');
  }
  return ensureOpenAPIEnv(() => {
    return aeither(
      {
        left(l) {
          if (l.status == 404) {
            return new NotFoundError('feed_url_blake3');
          } else {
            throw l;
          }
        },
        right(r): FeedPostListPage {
          return {
            nextRefGt: r.last_ref,
            posts: Array.from(map(internalPublicPostAdapter, r.posts)),
          };
        },
      },
      wrapOpenAPI(
        FeedsService.getFeedPostsFeedsFeedUrlBlake3PostsGet(
          feedUrlBlake3Base64,
          refGt,
          limit,
        ),
      ),
    );
  }, client);
}

/** It's an variant of `getFeedPosts`, see the document for detail. */
export function getFeedPostsBlake3(
  client: ClientConfig,
  feedUrlBlake3: Uint8Array,
  refGt?: number,
  limit?: number,
) {
  return getFeedPosts(client, encodeBase64(feedUrlBlake3), refGt, limit);
}

/** It's an variant of `getFeedPosts`, see the document for detail. */
export async function getFeedPostsByUrl(
  client: ClientConfig,
  feedUrl: string,
  refGt?: number,
  limit?: number,
) {
  return getFeedPostsBlake3(
    client,
    await blake3(string2utf8(feedUrl)),
    refGt,
    limit,
  );
}

/** Fetch content from remote.
 *
 * Platform must support [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to use this function.
 *
 * @param client client config
 * @param feedUrlBlake3Base64
 * @param postIdBlake3Base64
 * @param opts Options to picking specific content.
 * @returns NotFoundError or Response (from Fetch API).
 */
export async function fetchContent(
  client: ClientConfig,
  feedUrlBlake3Base64: string,
  postIdBlake3Base64: string,
  opts: {
    readonly contentType?: string;
    readonly langs?: readonly (readonly [string, number | undefined])[];
  } = {},
): Fork<NotFoundError, Response> {
  const url = new URL(
    `feeds/${encodeURIComponent(
      feedUrlBlake3Base64,
    )}/posts/${encodeURIComponent(postIdBlake3Base64)}/content`,
    client.endpointBase,
  );
  const contentType = opts.contentType || '*/*';
  const acceptLangs = opts.langs
    ? opts.langs
        .map(([name, q]) =>
          typeof q == 'number' ? `${name};q=${q.toFixed(2)}` : name,
        )
        .join(', ')
    : '*';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: contentType,
      'Accept-Language': acceptLangs,
    },
    mode: 'cors',
  });
  if (response.status == 404) {
    return Left(new NotFoundError('*'));
  } else if (response.status == 200) {
    return Right(response);
  } else {
    unreachable();
  }
}

/** Get specific post metadata.
 *
 * @param client client config
 * @param feedUrlBlake3Base64 the urlsafe base64 blake3-hash of the feed url
 * @param postIdBlake3Base64 the urlsafe base64 blake3-hash of the post id
 * @returns NotFoundError or the post metadata
 */
export function getPost(
  client: ClientConfig,
  feedUrlBlake3Base64: string,
  postIdBlake3Base64: string,
): Fork<NotFoundError, PublicPost> {
  return ensureOpenAPIEnv(() => {
    return aeither(
      {
        left(l) {
          if (l.status == 404) {
            return new NotFoundError('feed_url_blake3', 'post_id_blake3');
          } else {
            throw l;
          }
        },
        right(r) {
          return internalPublicPostAdapter(r);
        },
      },
      wrapOpenAPI(
        FeedsService.getPostFeedsFeedUrlBlake3PostsPostIdBlake3Get(
          feedUrlBlake3Base64,
          postIdBlake3Base64,
        ),
      ),
    );
  }, client);
}

/** Resolve the feed url and tell the server software listen to the feed if possible.
 *
 * The endpoint always return unknown error when failed to fetch, so it's no sence to read the left side of result;
 * and the endpoint have 1 second delay for each call, it's recommended to set the timeout > 2s, or it may fail frequently.
 *
 * @param client client config
 * @param url the url need resolving
 * @returns error or resolved `PublicFeed`
 */
export function resolveFeed(client: ClientConfig, url: string) {
  return ensureOpenAPIEnv(() => {
    return aeither(
      {
        left(l) {
          if (l.status == 400) {
            return l;
          } else {
            throw l;
          }
        },
        right(r) {
          return internalPublicFeedAdapter(r.feed);
        },
      },
      wrapOpenAPI(
        FeedsService.resolveFeedFeedsResolvePost({
          url,
        }),
      ),
    );
  }, client);
}
