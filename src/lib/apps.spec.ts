import anyTest, { TestFn } from 'ava';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { getAppDetail } from './apps';
import { NotFoundError } from './errors';
import { isLeft, isRight, unboxLeft, unwrap } from './fpcore';
import { ClientConfig } from './types';

interface TestContext {
  readonly axiosMock: MockAdapter;
  readonly clientConf: ClientConfig;
}

const test = anyTest as TestFn<TestContext>;

const TEST_APP_DATA = {
  appid: 19890604,
  name: 'Sample',
  owner_id: 0,
  client_id: 'anyclientid',
  client_secret: 'anyclientsecret',
  scope: '',
  redirect_uri: 'https://app',
  created_at: new Date(Date.now()).toISOString(),
  updated_at: new Date(Date.now()).toISOString(),
};

test.before((t) => {
  t.context = {
    axiosMock: new MockAdapter(axios),
    clientConf: {
      clientId: 'anyid',
      clientSecret: 'anysecret',
      endpointBase: '',
    },
  };
  const mock = t.context.axiosMock;
  mock.onGet('/apps/by-id/19890604').reply(200, TEST_APP_DATA);
  mock.onGet('/apps/by-client-id/anyclientid').reply(200, TEST_APP_DATA);
});

test.after((t) => {
  t.context.axiosMock.restore();
});

test('getAppDetail by appid return NotFoundError if the remote return 404', async (t) => {
  const client = t.context.clientConf;
  const val = await getAppDetail(client, {
    appid: 19890603,
  });
  t.true(isLeft(val) && unboxLeft(val) instanceof NotFoundError);
});

test('getAppDetail by client id return NotFoundError if the remote return 404', async (t) => {
  const client = t.context.clientConf;
  const val = await getAppDetail(client, {
    client_id: 'anyclient',
  });
  t.true(isLeft(val) && unboxLeft(val) instanceof NotFoundError);
});

test('getAppDetail by app id return object if the remote return object', async (t) => {
  const client = t.context.clientConf;
  const box = await getAppDetail(client, { appid: 19890604 });
  t.true(isRight(box));
  const val = unwrap(box);
  t.is(TEST_APP_DATA.appid, val.appid);
});

test('getAppDetail by client id return object if the remote return object', async (t) => {
  const client = t.context.clientConf;
  const box = await getAppDetail(client, { client_id: 'anyclientid' });
  t.true(isRight(box));
  const val = unwrap(box);
  t.is(TEST_APP_DATA.appid, val.appid);
});
