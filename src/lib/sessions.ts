import { OpenAPI, SessionsService } from "./internal";
import { AccessToken, ClientConfig } from "./types";

export async function getAccessTokenByRefreshToken(client: ClientConfig, refreshToken: string): Promise<AccessToken | null> {
  OpenAPI.BASE = client.endpointBase
  const response = await SessionsService.getAccessTokenByRefreshTokenAccessTokensSpecificRefTokGet(refreshToken)
  const remoteTokObj = response.access_token
  return <AccessToken>{
    userid: remoteTokObj.userid,
    refreshToken: remoteTokObj.refresh_token,
    expiredAt: Date.parse(remoteTokObj.expired_at),
    createdAt: Date.parse(remoteTokObj.created_at),
    active: remoteTokObj.active,
    appid: remoteTokObj.appid,
    scope: remoteTokObj.scope,
    updatedAt: Date.parse(remoteTokObj.updated_at),
    userAgent: remoteTokObj.user_agent,
  }
}
