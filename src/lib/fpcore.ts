
export type Left<L> = {
  right: false, value: L
}

export type Right<R> = {
  right: true, value: R
}

export type Either<L, R> =
  | Left<L>
  | Right<R>

export type Maybe<T> = Either<undefined, T>

export function Left<L>(value: L): Left<L> {
  return {
    right: false,
    value,
  }
}

export function Right<R>(value: R): Right<R> {
  return {
    right: true,
    value,
  }
}

export function Just<T>(value: T): Maybe<T> {
  return Right(value)
}

export const None: Maybe<any> = Left(undefined)

export function either<L, R, LN, RN>(matcher: {
  left: ((l: L) => LN),
  right: ((r: R) => RN),
}, e: Either<L,R>): Either<LN, RN> {
  if (e.right) {
    return Right(matcher.right(e.value));
  } else {
    return Left(matcher.left(e.value));
  }
}

export function isRight<R>(e: Either<any, R>): e is Right<R> {
  return e.right
}

export function isLeft<L>(e: Either<L, any>): e is Left<L> {
  return !e.right
}

/** Unwrap an `Either` object: return value when it's `Right` and throw error when is's `Left`.
 * The left must be an Error.
 *
 * @params e an `Either` object.
 */
export function unwrap<L = Error, R = any>(e: Either<L, R>): R {
  if (isRight(e)) {
    return e.value
  } else {
    throw e.value
  }
}

export function rmap<L, R, RN>(fn: ((r: R) => RN), e: Either<L, R>): Either<L, RN> {
  return either({
    left: (v) => v,
    right: (r) => fn(r),
  }, e)
}
