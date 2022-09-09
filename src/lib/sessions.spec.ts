import anyTest, { TestFn } from 'ava';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { NotFoundError } from './errors';
import { isLeft, isRight, Left, unboxLeft } from './fpcore';
import { refreshSession } from './sessions';
import { ClientConfig, Session } from './types';

interface TestCtx {
  readonly client: ClientConfig;
  readonly axiosMock: MockAdapter;
  readonly fakeSession: Session;
}

const test = anyTest as TestFn<TestCtx>;

test.before((t) => {
  t.context = {
    client: {
      endpointBase: '',
      clientId: '',
      clientSecret: '',
    },
    axiosMock: new MockAdapter(axios),
    fakeSession: {
      accessToken: 'aacctoken',
      accessTokenObject: {
        userid: 0,
        refreshToken: 'atoken',
        expiredAt: 0,
        updatedAt: 0,
        createdAt: 0,
        active: true,
        scope: '',
      },
    },
  };
});

test.beforeEach((t) => {
  t.context.axiosMock.reset();
});

test.after((t) => {
  t.context.axiosMock.restore();
});

test('refreshSession return NotFoundError if got 404', async (t) => {
  const mock = t.context.axiosMock;
  mock.onPost('/access-tokens/specific/atoken/~refresh').reply(404);
  const client = t.context.client;
  const result = await refreshSession(client, t.context.fakeSession);
  t.true(isLeft(result));
  t.true(unboxLeft(result as Left<NotFoundError>) instanceof NotFoundError);
});

test('refreshSession return Session if success', async (t) => {
  const mock = t.context.axiosMock;
  mock.onPost('/access-tokens/specific/atoken/~refresh').reply(200, {
    ok: true,
    access_token: {
      userid: 0,
      refresh_token: 'atoken',
      expired_at: new Date(Date.now()).toISOString(),
      updated_at: new Date(Date.now()).toISOString(),
      created_at: new Date(Date.now()).toISOString(),
      active: true,
      scope: '',
    },
  });
  const client = t.context.client;
  const result = await refreshSession(client, t.context.fakeSession);
  t.true(isRight(result));
});
