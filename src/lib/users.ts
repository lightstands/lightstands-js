import {
  ForbiddenError,
  isLightStandsError,
  NotFoundError,
  UnauthorizedError,
} from './errors';
import { aeither, Fork } from './fpcore';
import { UsersService } from './internal';
import {
  ClientConfig,
  PostTag,
  PrivateUser,
  PublicUser,
  Session,
  SessionAccess,
} from './types';
import { ensureOpenAPIEnv, wrapOpenAPI } from './utils';

export function getUserPublicInfo(
  client: ClientConfig,
  userid: number,
): Fork<NotFoundError, PublicUser> {
  return ensureOpenAPIEnv(
    () =>
      aeither(
        {
          left(l) {
            if (l.status == 404) {
              return new NotFoundError('userid');
            } else {
              throw l;
            }
          },
          right(r): PublicUser {
            return {
              userid: r.userid,
              username: r.username,
            };
          },
        },
        wrapOpenAPI(
          UsersService.getUserPublicInformationUsersUseridPublicGet(userid),
        ),
      ),
    client,
  );
}

export function getUserPrivateInfo(
  client: ClientConfig,
  session: Session,
  userid: number,
): Fork<NotFoundError | UnauthorizedError | ForbiddenError, PrivateUser> {
  return ensureOpenAPIEnv(
    () =>
      aeither(
        {
          left(l) {
            if (l.status === 404) {
              return new NotFoundError('userid');
            } else if (l.status === 401) {
              return new UnauthorizedError();
            } else if (l.status === 403) {
              return new ForbiddenError();
            } else {
              throw l;
            }
          },
          right(r): PrivateUser {
            return {
              userid: r.userid,
              username: r.username,
              email: r.email,
            };
          },
        },
        wrapOpenAPI(
          UsersService.getUserPrivateInformationUsersUseridPrivateGet(userid),
        ),
      ),
    client,
    session,
  );
}

export function setUserPassword<P extends string | undefined>(
  client: ClientConfig,
  session: SessionAccess,
  userId: number,
  newPassword: P,
): Fork<ForbiddenError | UnauthorizedError, P> {
  return ensureOpenAPIEnv(
    () => {
      return aeither(
        {
          left(l) {
            const body = l.body;
            if (isLightStandsError(body)) {
              const errors = body.errors;
              if (errors['unauthorised']) {
                return new UnauthorizedError(errors['unauthorised']);
              } else if (errors['scopenotcovered(user.change_password)']) {
                return new ForbiddenError(
                  errors['scopenotcovered(user.change_password)'],
                  ['user.change_password'],
                );
              }
            }
            throw l;
          },
          right() {
            return newPassword;
          },
        },
        wrapOpenAPI(
          UsersService.changePasswordUsersUseridChangePasswordPost(userId, {
            new_password: newPassword,
          }),
        ),
      );
    },
    client,
    session,
  );
}

interface ListTagsCursorOpts {
  readonly limit?: number;
  readonly updatedSince?: number;
}

interface ListTagsChunk {
  readonly name: string;
  readonly hasNext: boolean;
  readonly tags: readonly PostTag[];
}

/** List all `_read` tags.
 *
 * @param client the client config
 * @param session the session
 * @param userId the user id owns the tags
 * @param cursorOpts.limit the limit of the tags, the default is 64 and could not be greater than 128.
 * @param cursorOpts.updatedSince a unix timestamp (in second! or the server software may give you an error). The result tags should be have the `updated_at` greater than this.
 * @returns a chunk of the list.
 */
export function listReadTags(
  client: ClientConfig,
  session: SessionAccess,
  userId: number,
  cursorOpts: ListTagsCursorOpts,
): Fork<UnauthorizedError, ListTagsChunk> {
  return ensureOpenAPIEnv(
    () => {
      return aeither(
        {
          left(l) {
            if (l.status === 401) {
              return new UnauthorizedError();
            }
            throw l;
          },
          right(r) {
            return {
              hasNext: Boolean(r.has_next),
              name: '_read',
              tags: r.tags.map((v) => {
                return {
                  tag: v.tag,
                  createdAt: v.created_at,
                  updatedAt: v.updated_at,
                  postRef: v.post_ref,
                  untaggedAt: v.untagged_at,
                };
              }),
            };
          },
        },
        wrapOpenAPI(
          UsersService.listReadTagsUsersUseridTagsReadGet(
            userId,
            cursorOpts.updatedSince,
            cursorOpts.limit,
          ),
        ),
      );
    },
    client,
    session,
  );
}
