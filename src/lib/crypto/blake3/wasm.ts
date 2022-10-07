import { createBLAKE3 } from 'hash-wasm';
import { IHasher } from 'hash-wasm/dist/lib/WASMInterface';

function getInstanceFn() {
  // eslint-disable-next-line functional/no-let
  let instance: IHasher | undefined = undefined;
  return async function () {
    if (typeof instance == 'undefined') {
      instance = await createBLAKE3();
    }
    return instance;
  };
}

const getInstance = getInstanceFn();

export async function blake3(src: Uint8Array): Promise<Uint8Array> {
  const hasher = await getInstance();
  hasher.init();
  hasher.update(src);
  return hasher.digest('binary');
}
