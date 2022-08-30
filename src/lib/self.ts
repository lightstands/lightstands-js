import { aeither, Fork } from './fpcore';
import { OpenAPI, SelfService } from './internal';
import { ClientConfig } from './types';
import { wrapOpenAPI } from './utils';

export function get204(client: ClientConfig): Fork<never, void> {
  OpenAPI.BASE = client.endpointBase;
  return aeither(
    {
      left: (e) => {
        throw e;
      },
      // eslint-disable-next-line functional/no-return-void, @typescript-eslint/no-empty-function
      right: (): void => {},
    },
    wrapOpenAPI(SelfService.generate204SelfGenerate204Get())
  );
}
