/**
 * Drop keys whose value is `undefined`.
 *
 * A PATCH payload distinguishes "not supplied" (undefined — leave it alone)
 * from "clear it" (null). Prisma's update inputs reject `undefined` under
 * `exactOptionalPropertyTypes`, so stripping those keys is both the correct
 * semantics and what makes the payload assignable.
 */
export function definedFields<T extends object>(data: T) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<{ [K in keyof T]: Exclude<T[K], undefined> }>;
}
