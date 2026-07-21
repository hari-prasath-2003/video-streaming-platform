import argon2 from "argon2";

export async function verifyHash(
  hash: string,
  payload: string,
): Promise<boolean> {
  return argon2.verify(hash, payload);
}
