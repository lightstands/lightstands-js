import {
  ConditionRequiresError,
  isLightStandsError,
  NotFoundError,
  RemoteError,
  UnauthorizedError,
} from './errors';
import { aeither, either, Fork } from './fpcore';
import { ApiError, OpenAPI, SessionsService } from './internal';
import {
  AccessToken,
  ClientConfig,
  Session,
  SessionAccess,
  UserAgent,
} from './types';
import {
  date2DateTime,
  ensureOpenAPIEnv,
  internalAccessTokenAdaptor,
  wrapOpenAPI,
} from './utils';

export async function tokenDetailByRefTok(
  client: ClientConfig,
  session: SessionAccess,
  refreshToken: string,
): Promise<AccessToken | null> {
  return await ensureOpenAPIEnv(
    async () => {
      try {
        const response =
          await SessionsService.getAccessTokenByRefreshTokenAccessTokensSpecificRefTokGet(
            refreshToken,
          );
        const remoteTokObj = response.access_token;
        return internalAccessTokenAdaptor(remoteTokObj);
      } catch (e: unknown) {
        if (e instanceof ApiError) {
          if (e.status == 404) {
            return null;
          } else {
            throw e;
          }
        } else {
          throw e;
        }
      }
    },
    client,
    session,
  );
}

export async function newSession(
  client: ClientConfig,
  session: Session,
  clientId: string,
  scope: string,
  userAgentId?: string,
  userAgent?: UserAgent,
  authCode?: string,
): Fork<NotFoundError | ConditionRequiresError, Session> {
  const result = await ensureOpenAPIEnv(
    () =>
      wrapOpenAPI(
        SessionsService.createAccessTokenAccessTokensCreatePost({
          client_id: clientId,
          scope,
          user_agent_id: userAgentId,
          auth_code: authCode,
          user_agent: userAgent,
        }),
      ),
    client,
    session,
  );
  return either(
    {
      left: (err) => {
        if (isLightStandsError(err.body)) {
          const errors = err.body.errors;
          if (errors['notfound(auth_code)']) {
            return new NotFoundError(
              'auth_code',
              errors['notfound(auth_code)'],
            );
          } else if (errors['notfound(client_id)']) {
            return new NotFoundError(
              'client_id',
              errors['notfound(client_id)'],
            );
          } else if (errors['conditionrequires(scope,access_token.scope)']) {
            return new ConditionRequiresError(
              ['scope', 'access_token.scope'],
              errors['conditionrequires(scope,access_token.scope)'],
            );
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      },
      right: (val) => {
        return <Session>{
          accessToken: val.access_token.token,
          accessTokenObject: internalAccessTokenAdaptor(val.access_token),
        };
      },
    },
    result,
  );
}

export async function newSessionByPassword(
  client: ClientConfig,
  username: string,
  password: string,
  scope: string,
  userAgentId?: string,
  userAgent?: UserAgent,
): Fork<NotFoundError, Session> {
  OpenAPI.BASE = client.endpointBase;
  return aeither(
    {
      left: (v) => {
        if (isLightStandsError(v.body)) {
          if (v.body.errors['notfound(username,password)']) {
            return new NotFoundError(
              ['username', 'password'],
              v.body.errors['notfound(username,password)'],
            );
          } else {
            throw v;
          }
        } else {
          throw v;
        }
      },
      right: (v) => {
        return <Session>{
          accessToken: v.access_token.token,
          accessTokenObject: internalAccessTokenAdaptor(v.access_token),
        };
      },
    },
    wrapOpenAPI(
      SessionsService.createAccessTokenByPasswordAccessTokensCreateByPasswordPost(
        {
          client_id: client.clientId,
          username,
          password,
          scope,
          user_agent_id: userAgentId,
          user_agent: userAgent,
        },
      ),
    ),
  );
}

export async function refreshSession(
  client: ClientConfig,
  session: Session,
  expireIn: number = 60 * 60 * 24 * 30,
): Fork<NotFoundError, Session> {
  OpenAPI.BASE = client.endpointBase;
  const expiredAt = date2DateTime(new Date(Date.now() + expireIn));
  return aeither(
    {
      left(l) {
        if (l.status === 404) {
          return new NotFoundError('ref_tok');
        } else {
          throw l;
        }
      },
      right(r) {
        return {
          accessToken: session.accessToken,
          accessTokenObject: internalAccessTokenAdaptor(r.access_token),
        };
      },
    },
    wrapOpenAPI(
      SessionsService.updateTokenExpiringTimeAccessTokensSpecificRefTokRefreshPost(
        session.accessTokenObject.refreshToken,
        {
          target: expiredAt,
        },
      ),
    ),
  );
}

/**
 * Revoke the session.
 * Use `revokeSessionByRefreshToken` if you need to revoke session using refresh token.
 * @param client the client config
 * @param targetSession the session should be revoking
 * @returns AccessToken if success.
 */
export function revokeSession(
  client: ClientConfig,
  targetSession: SessionAccess,
): Fork<NotFoundError | UnauthorizedError, AccessToken> {
  return ensureOpenAPIEnv(() => {
    return aeither(
      {
        left(l) {
          const body = l.body;
          if (isLightStandsError(body)) {
            if (body.errors['notfound(token_type,token)']) {
              return new NotFoundError(['token_type', 'token']);
            } else if (body.errors['unauthorized']) {
              return new UnauthorizedError(body.errors['unauthorized']);
            }
          }
          throw l;
        },
        right(r) {
          return internalAccessTokenAdaptor(r.access_token);
        },
      },
      wrapOpenAPI(
        SessionsService.revokeSessionAccessTokensRevokePost({
          token_type: 'access_token',
          token: targetSession.accessToken,
        }),
      ),
    );
  }, client);
}

export class SessionAgeError extends RemoteError {
  constructor() {
    super('SessionAgeError');
  }
}

/**
 * Revoke a session by refresh token.
 * To revoke another session, your:
 * - current session must be active, or got a `UnauthorizedError`;
 * - current session must be created at least 24 hours, or got a `SessionAgeError`;
 * - current session must have scope `session.revoke_other`, or got a `UnauthorizedError`;
 * - the target session must be exists, or got a `NotFoundError`.
 * @param client the client config
 * @param session your current session
 * @param refreshToken the refresh token of the session you are revoking.
 * @returns AccessToken if success.
 */
export function revokeSessionByRefreshToken(
  client: ClientConfig,
  session: SessionAccess,
  refreshToken: string,
): Fork<SessionAgeError | NotFoundError | UnauthorizedError, AccessToken> {
  return ensureOpenAPIEnv(
    () => {
      return aeither(
        {
          left(l) {
            const body = l.body;
            if (isLightStandsError(body)) {
              const errors = body.errors;
              if (errors['conditionrequires(token_type,token,created_at)']) {
                return new SessionAgeError();
              } else if (errors['notfound(token_type,token)']) {
                return new NotFoundError('token_type', 'token');
              } else if (errors['unauthorized']) {
                return new UnauthorizedError(errors['unauthorized']);
              } else if (errors['scopenotcovered(session.revoke_other)']) {
                return new UnauthorizedError(
                  errors['scopenotcovered(session.revoke_other)'],
                );
              }
            }
            throw l;
          },
          right(r) {
            return internalAccessTokenAdaptor(r.access_token);
          },
        },
        wrapOpenAPI(
          SessionsService.revokeSessionAccessTokensRevokePost({
            token_type: 'refresh_token',
            token: refreshToken,
          }),
        ),
      );
    },
    client,
    session,
  );
}
