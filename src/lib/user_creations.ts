import {
  BadFormatError,
  BotError,
  CaptchaRequiredError,
  ExistsError,
  isLightStandsError,
  NotFoundError,
} from './errors';
import { aeither, Fork } from './fpcore';
import {
  CreationRequestResolved,
  CreationRequestsService,
  VerificationInitFailed,
} from './internal';
import {
  ClientConfig,
  CreationRequest,
  CreationVerificationStatus,
  ResolvedCreationRequest,
  SupportedCaptchaResponse,
} from './types';
import {
  creationRequestAdapter,
  ensureOpenAPIEnv,
  internalAccessTokenAdaptor,
  unreachable,
  wrapOpenAPI,
} from './utils';

export type CreationRequestId = { readonly email: string };

function creationRequestId2String(id: CreationRequestId): string {
  if (typeof id.email !== 'undefined') {
    return `email@${id.email}`;
  } else {
    unreachable();
  }
}

export function newCreationRequest(
  client: ClientConfig,
  requestId: CreationRequestId,
  captcha: SupportedCaptchaResponse,
): Fork<BotError | CaptchaRequiredError | BadFormatError, CreationRequest> {
  return ensureOpenAPIEnv(() => {
    return aeither(
      {
        left(l) {
          if (isLightStandsError(l.body)) {
            const body = l.body;
            const errors = body.errors;
            if (errors['badformat(req_id)']) {
              return new BadFormatError(
                ['req_id'],
                errors['badformat(req_id)'],
              );
            } else if (errors['bot']) {
              return new BotError(errors['bot']);
            } else if (errors['hcaptcharequired']) {
              return new CaptchaRequiredError(errors['hcaptcharequired']);
            }
          }
          throw l;
        },
        right(r): CreationRequest {
          const o = r.creation_request;
          return creationRequestAdapter(o);
        },
      },
      wrapOpenAPI(
        CreationRequestsService.putCreationRequestCreationRequestsReqIdPut(
          creationRequestId2String(requestId),
          {
            h_captcha_response: captcha.hCaptcha,
          },
        ),
      ),
    );
  }, client);
}

export function requestCreationVerification(
  client: ClientConfig,
  requestId: CreationRequestId,
): Fork<BadFormatError, CreationVerificationStatus> {
  return ensureOpenAPIEnv(() => {
    return aeither(
      {
        left(l) {
          const body = l.body;
          if (isLightStandsError(body)) {
            const errors = body.errors;
            if (errors['badformat(req_id)']) {
              return new BadFormatError(
                ['req_id'],
                errors['badformat(req_id)'],
              );
            }
          }
          throw l;
        },
        right(r): CreationVerificationStatus {
          const creq = creationRequestAdapter(r.creation_request);
          return {
            request: creq,
            ok: r.ok || false,
            reason: !r.ok ? (r as VerificationInitFailed).reason : undefined,
          };
        },
      },
      wrapOpenAPI(
        CreationRequestsService.requestCreationVerificationCreationRequestsReqIdRequestVerifyPost(
          creationRequestId2String(requestId),
        ),
      ),
    );
  }, client);
}

export type CreationRequestResolvingResult = {
  readonly ok: boolean;
  readonly resolved?: ResolvedCreationRequest;
  readonly challenge: string;
};

export function resolveCreationRequest(
  client: ClientConfig,
  requestId: CreationRequestId,
  challenge: string,
  conf: { readonly username: string },
): Fork<NotFoundError | ExistsError, CreationRequestResolvingResult> {
  return ensureOpenAPIEnv(() => {
    return aeither(
      {
        left(l) {
          const body = l.body;
          if (isLightStandsError(body)) {
            const errors = body.errors;
            if (errors['exists(username)']) {
              return new ExistsError(['username'], errors['exists(username)']);
            } else if (errors['notfound(req_id)']) {
              return new NotFoundError(['req_id'], errors['notfound(req_id)']);
            }
          }
          throw l;
        },
        right(r) {
          if (r.ok) {
            const o = r as CreationRequestResolved;
            return {
              ok: true,
              challenge: r.challenge,
              resolved: {
                creationRequest: creationRequestAdapter(r.creation_request),
                accessToken: {
                  ...internalAccessTokenAdaptor(o.access_token),
                  token: o.access_token.token,
                },
                user: {
                  userid: o.user.userid,
                  createdAt: o.user.created_at,
                  email: o.user.email,
                  username: o.user.username,
                },
              },
            };
          } else {
            return {
              ok: false,
              challenge: r.challenge,
            };
          }
        },
      },
      wrapOpenAPI(
        CreationRequestsService.resolveCreationRequestCreationRequestsReqIdResolvePost(
          creationRequestId2String(requestId),
          {
            username: conf.username,
            challenge,
          },
        ),
      ),
    );
  }, client);
}

export function checkCreationChallenge(
  client: ClientConfig,
  requestId: CreationRequestId,
  challenge: string,
): Fork<NotFoundError, boolean> {
  return ensureOpenAPIEnv(() => {
    return aeither(
      {
        left(l) {
          const body = l.body;
          if (isLightStandsError(body)) {
            const errors = body.errors;
            if (errors['notfound(req_id)']) {
              return new NotFoundError(['req_id'], errors['notfound(req_id)']);
            }
          }
          throw l;
        },
        right(r) {
          return r.ok;
        },
      },
      wrapOpenAPI(
        CreationRequestsService.checkChallengeCreationRequestsReqIdCheckChallengePost(
          creationRequestId2String(requestId),
          { challenge: challenge },
        ),
      ),
    );
  }, client);
}
