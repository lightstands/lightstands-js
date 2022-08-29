import { NotFoundError } from "./errors";
import { aeither, Fork } from "./fpcore";
import { ApplicationsService, CancelablePromise, OpenAPI, PublicApplication } from "./internal";
import { App, ClientConfig } from "./types";
import { internalAppAdapter, wrapOpenAPI } from "./utils";

type ClientIdObject = {client_id: string};
type AppIdObject = {appid: number};

export function getAppDetail(client: ClientConfig, selector: ClientIdObject): Fork<Error, App>
export function getAppDetail(client: ClientConfig, selector: AppIdObject): Fork<Error, App>

export async function getAppDetail(client: ClientConfig, selector: Record<string, unknown>): Fork<NotFoundError, App> {
  OpenAPI.BASE = client.endpointBase
  let promise: CancelablePromise<PublicApplication>
  if (typeof selector.client_id !== "undefined") {
    promise = ApplicationsService.getAppByClientIdAppsByClientIdClientIdGet((selector as ClientIdObject).client_id)
  } else if (typeof selector.appid !== "number") {
    promise = ApplicationsService.getAppByAppidAppsByIdAppidGet((selector as AppIdObject).appid)
  } else {
    throw new TypeError(`expect an object with field \"client_id\" or \"appid\", got ${selector}`)
  }
  return aeither({
    left: (e) => {
      if (e.status == 404) {
        return new NotFoundError()
      } else {
        throw e
      }
    },
    right: internalAppAdapter,
  },wrapOpenAPI(promise))
}
