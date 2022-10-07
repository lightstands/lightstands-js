export function string2utf8(src: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(src);
}

export function utf82string(src: Uint8Array): string {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(src);
}
