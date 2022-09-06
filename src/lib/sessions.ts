import { AllRemoteErrors } from './errors';
import { aeither, either, Fork, unwrap } from './fpcore';
import { ApiError, OpenAPI, SessionsService } from './internal';
import { AccessToken, ClientConfig, Session, UserAgent } from './types';
import {
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
