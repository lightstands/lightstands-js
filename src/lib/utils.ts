import { BadResponseError } from "./errors";
import { Either, Left, Right } from "./fpcore";

/**
 *
 */
export function ensureErrors(jsonBody: unknown): Either<(TypeError | BadResponseError), Record<string, unknown>> {
  if (typeof jsonBody === "object" && jsonBody !== null) {
    if (typeof (jsonBody as {errors: unknown}).errors === "object") {
      const errors = (jsonBody as {errors: Record<string | number | symbol, unknown>}).errors;
      for (const k in errors) {
        if (typeof k !== "string") {
          return Left(new TypeError(`expected string, got ${typeof k}`))
        }
      }
      return Right(errors as Record<string, unknown>)
    } else {
      return Left(new BadResponseError(JSON.stringify(jsonBody), "could not found 'errors' object"))
    }
  } else {
    return Left(new BadResponseError(JSON.stringify(jsonBody), "could not found 'errors' object"))
  }
}
