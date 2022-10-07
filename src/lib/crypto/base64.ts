import { fromUint8Array, toUint8Array } from 'js-base64';

/** Encode `Uint8Array` into url-safe base64 coding.
 *
 * @param src
 * @returns
 */
export function encodeBase64(src: Uint8Array): string {
  return fromUint8Array(src, true);
}

/** Decode base64 string.
 *
 * @param src
 * @returns
 */
export function decodeBase64(src: string): Uint8Array {
  return toUint8Array(src);
}
