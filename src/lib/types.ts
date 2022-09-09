export type ClientConfig = {
  readonly endpointBase: string;
  readonly clientId: string;
  readonly clientSecret: string | null;
};

export type UserAgent = {
  readonly p: string;
  readonly dev: string;
};

export type AccessToken = {
  readonly userid: number;
  readonly token?: string;
  readonly refreshToken: string;
  readonly expiredAt: number;
  readonly createdAt: number;
  readonly active: boolean;
  readonly appid?: number;
  readonly scope: string;
  readonly updatedAt: number;
  readonly userAgent?: UserAgent;
};

export type Session = {
  readonly accessToken: string;
  readonly accessTokenObject: AccessToken;
};

export type App = {
  readonly appid: number;
  readonly name: string;
  readonly ownerId?: number;
  readonly clientId: string;
  readonly scope: string;
  readonly redirectUri?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
};

export type PublicSettings = {
  readonly apiLayerVersion: number;
  readonly hcaptchaSiteKey?: string;
};

export type PublicUser = {
  readonly userid: number;
  readonly username: string;
};

export type PrivateUser = PublicUser & {
  readonly email?: string;
};
