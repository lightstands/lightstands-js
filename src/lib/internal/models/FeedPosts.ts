/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PublicPost } from './PublicPost';

export type FeedPosts = {
    number: number;
    last_ref?: number;
    posts: Array<PublicPost>;
};

