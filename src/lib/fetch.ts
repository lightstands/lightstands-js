import { NetworkError } from './errors';

export type DFetchOpts = {
  readonly json: unknown;
};

/**
 * "dfetch" stands for "Default Fetch", which wrapping `fetch()` for this library use.
 *
 * Changed defaults:
 * - "mode" set to `'cors'`
 * - "credentials" set to `'omit'`
 *
 * New parameters:
 * - "json": set `Content-Type` to `application/json` and the value json string as `body`
 *
 * This wrapper will throw {@link NetworkError} instead of {@link TypeError}.
 * @param input
 * @param init
 * @returns
 */
export async function dfetch(
  input: URL | RequestInfo,
  init?: RequestInit & Partial<DFetchOpts>,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  const body = init?.json ? JSON.stringify(init.json) : init?.body;
  const args: RequestInit = {
    method: init?.method,
    mode: init?.mode ? init.mode : 'cors',
    credentials: init?.credentials ? init.credentials : 'omit',
    cache: init?.cache,
    redirect: init?.redirect,
    referrer: init?.referrer,
    integrity: init?.integrity,
    keepalive: init?.keepalive,
    signal: init?.signal,
    body,
    headers,
  };
  if (init?.json) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    return await fetch(input, args);
  } catch (reason) {
    if (reason instanceof Error) {
      throw new NetworkError(`failed to fetch ${input.toString()}`, reason);
    } else {
      throw reason;
    }
  }
}
