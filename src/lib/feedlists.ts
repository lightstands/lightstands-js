import {
  InsufficientStorageError,
  PaymentRequiredError,
  UnauthorizedError,
} from './errors';
import { aeither, Fork, map } from './fpcore';
import { FeedListsService, PrivateFeedList } from './internal';
import {
  ClientConfig,
  FeedListDetail,
  FeedListMetadata,
  FeedListPatch,
  SessionAccess,
} from './types';
import { ensureOpenAPIEnv, wrapOpenAPI } from './utils';

export async function getAllFeedLists(
  client: ClientConfig,
  session: SessionAccess,
): Fork<UnauthorizedError, Iterable<FeedListMetadata>> {
  return ensureOpenAPIEnv(
    () => {
      return aeither(
        {
          left(l) {
            if (l.status === 401) {
              return new UnauthorizedError();
            } else {
              throw l;
            }
          },
          right(r) {
            return map(({ id, owner_id, created_at, updated_at, tags }) => {
              return {
                id,
                ownerId: owner_id,
                createdAt: created_at,
                updatedAt: updated_at,
                tags: tags,
              };
            }, r.metas);
          },
        },
        wrapOpenAPI(FeedListsService.listFeedListsFeedlistsGet()),
      );
    },
    client,
    session,
  );
}

function feedListDetailAdapter(r: PrivateFeedList) {
  const { id, owner_id, created_at, updated_at, tags, rm, size } = r;
  return {
    id,
    ownerId: owner_id,
    createdAt: created_at,
    updatedAt: updated_at,
    tags,
    in: Array.from(map(([hash, euid]) => ({ euid, feedUrlHash: hash }), r.in)),
    rm,
    size,
  };
}

export function getFeedList(
  client: ClientConfig,
  session: SessionAccess,
  listId: number,
): Fork<UnauthorizedError, FeedListDetail> {
  return ensureOpenAPIEnv(
    () => {
      return aeither(
        {
          left(l) {
            if (l.status === 401) {
              return new UnauthorizedError();
            } else {
              throw l;
            }
          },
          right(r): FeedListDetail {
            return feedListDetailAdapter(r);
          },
        },
        wrapOpenAPI(FeedListsService.getFeedListFeedlistsListIdGet(listId)),
      );
    },
    client,
    session,
  );
}

function transfromPatch(patch: FeedListPatch) {
  return {
    in: patch.in
      ? Array.from(
          map(({ feedUrlHash, euid }) => [feedUrlHash, euid], patch.in),
        )
      : undefined,
    // eslint-disable-next-line functional/prefer-readonly-type
    rm: patch.rm as number[] | undefined,
    // eslint-disable-next-line functional/prefer-readonly-type
    tags: patch.tags as string[] | undefined,
    // eslint-disable-next-line functional/prefer-readonly-type
    untags: patch.untags as string[] | undefined,
  };
}

export function patchFeedList(
  client: ClientConfig,
  session: SessionAccess,
  listId: number,
  patch: FeedListPatch,
): Fork<InsufficientStorageError, FeedListPatch> {
  return ensureOpenAPIEnv(
    () => {
      return aeither(
        {
          left(l) {
            if (l.status === 507) {
              return new InsufficientStorageError();
            } else {
              throw l;
            }
          },
          right() {
            return patch;
          },
        },
        wrapOpenAPI(
          FeedListsService.patchFeedListFeedlistsListIdPatch(
            listId,
            transfromPatch(patch),
          ),
        ),
      );
    },
    client,
    session,
  );
}

/** Create a new feed list on remote.
 *
 * @param client the client config
 * @param session the user session
 * @param name the feed list name
 * @param patch the initial content should be patched in
 * @returns the detail of the feed list
 */
export function newFeedList(
  client: ClientConfig,
  session: SessionAccess,
  name: string,
  patch?: FeedListPatch,
): Fork<
  InsufficientStorageError | UnauthorizedError | PaymentRequiredError,
  FeedListDetail
> {
  return ensureOpenAPIEnv(
    () => {
      return aeither(
        {
          left(l) {
            if (l.status === 507) {
              return new InsufficientStorageError();
            } else if (l.status === 401) {
              return new UnauthorizedError();
            } else if (l.status === 402) {
              return new PaymentRequiredError();
            }
            throw l;
          },
          right(r) {
            return feedListDetailAdapter(r);
          },
        },
        wrapOpenAPI(
          FeedListsService.createFeedListFeedlistsPut({
            name,
            ...(patch ? transfromPatch(patch) : {}),
          }),
        ),
      );
    },
    client,
    session,
  );
}
