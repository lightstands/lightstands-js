import { AllRemoteErrors, NotFoundError } from './errors';
import { aeither, either, Fork, unwrap } from './fpcore';
import { ApiError, OpenAPI, SessionsService } from './internal';
import { AccessToken, ClientConfig, Session, UserAgent } from './types';
import {
  date2DateTime,
  internalAccessTokenAdaptor,
  parseLightStandsError,
  wrapOpenAPI,
} from './utils';

export async function tokenDetailByRefTok(
  client: ClientConfig,
  refreshToken: string,
): Promise<AccessToken | null> {
  OpenAPI.BASE = client.endpointBase;
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
}

export async function newSession(
  client: ClientConfig,
  session: Session,
  scope: string,
  userAgentId?: string,
  userAgent?: UserAgent,
  authCode?: string,
): Fork<AllRemoteErrors, Session> {
  OpenAPI.BASE = client.endpointBase;
  OpenAPI.TOKEN = session.accessToken;
  const result = await wrapOpenAPI(
    SessionsService.createAccessTokenAccessTokensCreatePost({
      client_id: client.clientId,
      scope,
      user_agent_id: userAgentId,
      auth_code: authCode,
      user_agent: userAgent,
    }),
  );
  return either(
    {
      left: (err) => {
        return unwrap(parseLightStandsError(err));
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
): Fork<AllRemoteErrors, Session> {
  OpenAPI.BASE = client.endpointBase;
  return aeither(
    {
      left: (v) => unwrap(parseLightStandsError(v)),
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
