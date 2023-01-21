import { base64url } from 'rfc4648';

/** Encode `Uint8Array` into url-safe base64 coding.
 *
 * @param src
 * @returns
 */
export function encodeBase64(src: ArrayLike<number>): string {
  return base64url.stringify(src);
}

/** Decode base64 string.
 *
 * @param src
 * @returns
 */
export function decodeBase64(src: string): Uint8Array {
  return base64url.parse(src);
}
