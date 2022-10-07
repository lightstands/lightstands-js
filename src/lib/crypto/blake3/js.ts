import { blake3 as blake3Impl } from '@noble/hashes/blake3';

export function blake3(src: Uint8Array): Promise<Uint8Array> {
  return Promise.resolve(blake3Impl(src));
}
