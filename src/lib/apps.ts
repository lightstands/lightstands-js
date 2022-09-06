import { NotFoundError } from './errors';
import { aeither, Fork } from './fpcore';
import { ApplicationsService, OpenAPI } from './internal';
import { App, ClientConfig } from './types';
import { internalAppAdapter, wrapOpenAPI } from './utils';

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
