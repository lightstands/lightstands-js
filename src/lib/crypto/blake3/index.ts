import { blake3 as blake3Js } from './js';
import { blake3 as blake3Wasm } from './wasm';

export const blake3 = typeof WebAssembly != 'undefined' ? blake3Wasm : blake3Js;
