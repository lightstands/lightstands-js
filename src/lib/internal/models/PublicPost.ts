/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type PublicPost = {
    ref: number;
    id: string;
    id_blake3: string;
    title?: string;
    link?: string;
    published_at: number;
    updated_at: number;
    summary?: string;
    feed_ref: number;
    content_types: Array<string>;
};

