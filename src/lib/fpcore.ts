export type Left<L> = {
  readonly right: false;
  readonly value: L;
};

export type Right<R> = {
  readonly right: true;
  readonly value: R;
};

export type Either<L, R> = Left<L> | Right<R>;

export type Just<T> = Right<T>;

export type Nothing = Left<undefined>;

export type Maybe<T> = Just<T> | Nothing;

export function Left<L>(value: L): Left<L> {
  return {
    right: false,
    value,
  };
}

export function Right<R>(value: R): Right<R> {
  return {
    right: true,
    value,
  };
}

export function Just<T>(value: T): Maybe<T> {
  return Right(value);
}

export const None: Maybe<never> = Left(undefined);

type EitherMatcher<L, R, LN, RN> = {
  readonly left: (l: L) => LN;
  readonly right: (r: R) => RN;
};

export function either<L, R, LN, RN>(
  matcher: EitherMatcher<L, R, LN, RN>,
  e: Either<L, R>,
): Either<LN, RN> {
  if (e.right) {
    return Right(matcher.right(e.value));
  } else {
    return Left(matcher.left(e.value));
  }
}

export function isRight<R>(e: Either<unknown, R>): e is Right<R> {
  return e.right;
}

export function isLeft<L>(e: Either<L, unknown>): e is Left<L> {
  return !e.right;
}

export function unboxRight<R>(v: Right<R>): R {
  return v.value;
}

export function unboxLeft<L>(v: Left<L>): L {
  return v.value;
}

export function something<T>(v: Maybe<T>): v is Just<T> {
  return isRight(v);
}

export function nothing(v: Maybe<never>): v is Nothing {
  return isLeft(v);
}

/** Unwrap an `Either` object: return value when it's `Right` and throw error when is's `Left`.
 * The left must be an Error.
 *
 * @params e an `Either` object.
 */
export function unwrap<L = Error, R = unknown>(e: Either<L, R>): R {
  if (isRight(e)) {
    return e.value;
  } else {
    throw e.value;
  }
}

export function rmap<L, R, RN>(
  fn: (r: R) => RN,
  e: Either<L, R>,
): Either<L, RN> {
  return either(
    {
      left: (v) => v,
      right: (r) => fn(r),
    },
    e,
  );
}

export function lmap<L, R, LN>(
  fn: (l: L) => LN,
  e: Either<L, R>,
): Either<LN, R> {
  return either(
    {
      left: (v) => fn(v),
      right: (r) => r,
    },
    e,
  );
}

export type Fork<L, R> = Promise<Either<L, R>>;

export async function aunwrap<L = Error, R = unknown>(
  fork: Fork<L, R>,
): Promise<R> {
  const v = await fork;
  return unwrap(
    either(
      {
        left: (lvalue) => {
          throw lvalue;
        },
        right: (rvalue) => rvalue,
      },
      v,
    ),
  );
}

export async function aeither<L, R, LN, RN>(
  matcher: EitherMatcher<L, R, LN, RN>,
  fork: Fork<L, R>,
): Fork<LN, RN> {
  const v = await fork;
  return either(matcher, v);
}

export async function armap<L, R, RN>(
  fn: (val: R) => RN,
  fork: Fork<L, R>,
): Fork<L, RN> {
  const v = await fork;
  return rmap(fn, v);
}

export async function wrap<R>(promise: Promise<R>): Fork<unknown, R> {
  try {
    const value = await promise;
    return Right(value);
  } catch (e: unknown) {
    return Left(e);
  }
}

export async function almap<L, R, LN>(
  fn: (val: L) => LN,
  fork: Fork<L, R>,
): Fork<LN, R> {
  const v = await fork;
  return lmap(fn, v);
}

export function fold<E, C>(
  folder: (prev: C, next: E) => C,
  initial: C,
  values: Iterable<E>,
): C {
  let prev = initial;
  for (const el of values) {
    prev = folder(prev, el);
  }
  return prev;
}

export function* map<E, N>(
  fn: (val: E) => N,
  values: Iterable<E>,
): Iterable<N> {
  for (const el of values) {
    yield fn(el);
  }
}

export function* filter<E>(
  fn: (val: E) => boolean,
  values: Iterable<E>,
): Iterable<E> {
  for (const el of values) {
    if (fn(el)) {
      yield el;
    }
  }
}

export function* typeFilter<E, N extends E>(
  fn: (val: E) => val is N,
  values: Iterable<E>,
): Iterable<N> {
  for (const el of values) {
    if (fn(el)) {
      yield el;
    }
  }
}

export function filterMap<T, N>(
  fn: (val: T) => Maybe<N>,
  values: Iterable<T>,
): Iterable<N> {
  return map(unboxRight, typeFilter(something, map(fn, values)));
}

export function flatten<L, R>(
  e: Either<Either<L, R>, Either<L, R>>,
): Either<L, R> {
  return e.value;
}

export function flatEither<L, R, LN, RN>(
  matcher: EitherMatcher<L, R, Either<LN, RN>, Either<LN, RN>>,
  e: Either<L, R>,
): Either<LN, RN> {
  return flatten(either(matcher, e));
}

export function forEach<E>(
  effect: (val: E) => void,
  values: Iterable<E>,
): void {
  for (const el of values) {
    effect(el);
  }
}
