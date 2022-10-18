import { InsufficientStorageError, UnauthorizedError } from './errors';
import { aeither, Fork, map } from './fpcore';
import { FeedListsService } from './internal';
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
            const { id, owner_id, created_at, updated_at, tags, rm, size } = r;
            return {
              id,
              ownerId: owner_id,
              createdAt: created_at,
              updatedAt: updated_at,
              tags,
              in: Array.from(
                map(([hash, euid]) => ({ euid, feedUrlHash: hash }), r.in),
              ),
              rm,
              size,
            };
          },
        },
        wrapOpenAPI(FeedListsService.getFeedListFeedlistsListIdGet(listId)),
      );
    },
    client,
    session,
  );
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
          FeedListsService.patchFeedListFeedlistsListIdPatch(listId, {
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
          }),
        ),
      );
    },
    client,
    session,
  );
}
