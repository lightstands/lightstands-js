import { ForbiddenError, NotFoundError, UnauthorizedError } from './errors';
import { dfetch } from './fetch';
import { aeither, Fork } from './fpcore';
import { AbortInspectable, ProgressInspectable } from './inspectCx';
import { ApplicationsService, OpenAPI, PublicApplication } from './internal';
import { App, ClientConfig, SessionAccess } from './types';
import { internalAppAdapter, transformStdResponse, wrapOpenAPI } from './utils';

type ClientIdObject = { readonly client_id: string };
type AppIdObject = { readonly appid: number };

function appDetailBySelector(selector: Record<string, unknown>) {
  if (typeof selector.client_id !== 'undefined') {
    return ApplicationsService.getAppByClientIdAppsByClientIdClientIdGet(
      (selector as ClientIdObject).client_id,
    );
  } else if (typeof selector.appid !== 'undefined') {
    return ApplicationsService.getAppByAppidAppsByIdAppidGet(
      (selector as AppIdObject).appid,
    );
  } else {
    throw new TypeError(
      `expect an object with field "client_id" or "appid", got ${selector}`,
    );
  }
}

export function getAppDetail(
  client: ClientConfig,
  selector: ClientIdObject,
): Fork<NotFoundError, App>;
export function getAppDetail(
  client: ClientConfig,
  selector: AppIdObject,
): Fork<NotFoundError, App>;

export async function getAppDetail(
  client: ClientConfig,
  selector: Record<string, unknown>,
): Fork<NotFoundError, App> {
  OpenAPI.BASE = client.endpointBase;
  const promise = appDetailBySelector(selector);
  return aeither(
    {
      left: (e) => {
        if (e.status == 404) {
          return new NotFoundError();
        } else {
          throw e;
        }
      },
      right: internalAppAdapter,
    },
    wrapOpenAPI(promise),
  );
}

type UserIdIncluded = { readonly userid: number };

export type ListAppsByOwnerSelector = {
  readonly appIdGt?: number;
  readonly limit?: number;
};

/**
 * List apps own by a owner. Requires `apps.x` scope.
 * @param client
 * @param session
 * @param owner the user object or the user's id
 * @param selector
 * @param inspectCx inspection context, supports: abort, progress
 * @returns
 */
export async function listAppsByOwner(
  client: ClientConfig,
  session: SessionAccess,
  owner: number | UserIdIncluded,
  selector?: ListAppsByOwnerSelector,
  inspectCx?: AbortInspectable & ProgressInspectable,
): Fork<UnauthorizedError | ForbiddenError, readonly App[]> {
  const ownerId = typeof owner == 'number' ? owner : owner.userid;
  const endpoint = new URL(
    `./apps/by-owner-id/${ownerId.toString()}/`,
    client.endpointBase,
  );
  if (selector) {
    if (typeof selector.appIdGt !== 'undefined') {
      endpoint.searchParams.set('appid_gt', selector.appIdGt.toString(10));
    }
    if (typeof selector.limit !== 'undefined') {
      endpoint.searchParams.set('limit', selector.limit.toString(10));
    }
  }
  const response = await dfetch(endpoint, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    signal: inspectCx?.abortSignal,
  });
  return transformStdResponse(
    response,
    async (response) => {
      const payload = await response.json();
      return payload['chunk'] as readonly App[];
    },
    (e) => {
      if (e instanceof UnauthorizedError || e instanceof ForbiddenError) {
        return e;
      } else {
        throw e;
      }
    },
    inspectCx,
  );
}

export type AppReceipt = {
  readonly name: string;
  readonly scope: string;
  readonly ownerId?: number;
  readonly redirectUri?: string | URL;
};

export async function newApp(
  client: ClientConfig,
  session: SessionAccess,
  receipt: AppReceipt,
  inspectCx?: AbortInspectable,
): Fork<ForbiddenError | UnauthorizedError, App> {
  const endpoint = new URL('./apps/', client.endpointBase);
  const args = {
    name: receipt.name,
    scope: receipt.scope,
    owner_id: receipt.ownerId,
    redirect_uri: receipt.redirectUri?.toString(),
  };
  const response = await dfetch(endpoint, {
    method: 'put',
    json: args,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    signal: inspectCx?.abortSignal,
  });
  return transformStdResponse(
    response,
    async (response) => {
      const payload = await response.json();
      return internalAppAdapter(payload as PublicApplication);
    },
    (e) => {
      if (e instanceof UnauthorizedError || e instanceof ForbiddenError) {
        return e;
      } else {
        throw e;
      }
    },
  );
}
