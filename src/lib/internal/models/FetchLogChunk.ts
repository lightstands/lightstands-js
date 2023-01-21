/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FetchLogEntry } from './FetchLogEntry';

export type FetchLogChunk = {
    number: number;
    chunk: Array<FetchLogEntry>;
};

