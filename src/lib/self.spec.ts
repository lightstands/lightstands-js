import anyTest, { TestFn } from 'ava';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { isRight, unboxRight } from './fpcore';
import { get204 } from './self';
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
  const mock = t.context.axiosMock;
  mock.onGet('/self/~generate-204').reply(204);
});

test.after((t) => {
  t.context.axiosMock.restore();
});

test('get204 return void if thr remote reply 204', async (t) => {
  const client = t.context.client;
  const result = await get204(client);
  t.true(isRight(result) && typeof unboxRight(result) == 'undefined');
});
