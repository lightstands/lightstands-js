/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserPrivatePostTag } from './UserPrivatePostTag';

export type UserPrivateReadTagList = {
    number: number;
    tag: string;
    has_next: boolean;
    tags: Array<UserPrivatePostTag>;
};

