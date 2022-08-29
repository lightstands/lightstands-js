
export type ClientConfig = {
  readonly endpointBase: string
  readonly clientId: string
  readonly clientSecret: string | null
}

export type UserAgent = {
  readonly p: string
  readonly dev: string
}

export type AccessToken = {
  readonly userid: number
  readonly token?: string
  readonly refreshToken: string
  readonly expiredAt: number
  readonly createdAt: number
  readonly active: boolean
  readonly appid?: number
  readonly scope: string
  readonly updatedAt: number
  readonly userAgent?: UserAgent
}

export type Session = {
  accessToken: string
  accessTokenObject: AccessToken
}

export type App = {
  appid: number
  name: string
  ownerId?: number
  clientId: string
  scope: string
  redirectUri?: string
  createdAt: number
  updatedAt: number
}
