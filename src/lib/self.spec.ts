import anyTest, { TestFn } from 'ava';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { isRight, unboxRight } from './fpcore';
import { ApiError } from './internal';
import { get204, getPublicSettings } from './self';
import { ClientConfig } from './types';

interface TestContext {
  readonly axiosMock: MockAdapter;
  readonly client: ClientConfig;
}

const test = anyTest as TestFn<TestContext>;

test.before((t) => {
  t.context = {
    axiosMock: new MockAdapter(axios),
    client: {
      clientId: 'anyclientid',
      clientSecret: 'anyclientsecret',
      endpointBase: '',
    },
  };
});

test.beforeEach((t) => {
  t.context.axiosMock.reset();
});

test.after((t) => {
  t.context.axiosMock.restore();
});

test('get204 return void if thr remote reply 204', async (t) => {
  const mock = t.context.axiosMock;
  mock.onGet('/self/~generate-204').reply(204);
  const client = t.context.client;
  const result = await get204(client);
  t.true(isRight(result) && typeof unboxRight(result) == 'undefined');
});

test('getPublicSettings can return settings if the remote do', async (t) => {
  const mock = t.context.axiosMock;
  mock.onGet('/self/settings').reply(200, {
    api_layer_version: 0,
    hcaptcha_site_key: 'anysitekey',
  });
  const client = t.context.client;
  const result = await getPublicSettings(client);
  t.true(
    isRight(result) &&
      unboxRight(result).apiLayerVersion === 0 &&
      unboxRight(result).hcaptchaSiteKey === 'anysitekey'
  );
});

test('getPublicSettings will throw ApiError if the remote return 404', async (t) => {
  const mock = t.context.axiosMock;
  mock.onGet('self/settigns').reply(404);
  const client = t.context.client;
  const reason = await t.throwsAsync(getPublicSettings(client));
  t.true(reason instanceof ApiError);
});
