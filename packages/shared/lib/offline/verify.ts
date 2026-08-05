/** SHA-256 helpers for verifying downloaded bundles, using Web Crypto
 * (available in browsers, workers, and Node's webcrypto). */

/** Lowercase hex SHA-256 of the given bytes. Both ArrayBuffer and typed-array
 * views satisfy crypto.subtle.digest's BufferSource parameter directly. */
export async function sha256Hex(bytes: BufferSource): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** True iff the bytes hash to the expected (case-insensitive) hex digest. */
export async function verifySha256(bytes: BufferSource, expectedHex: string): Promise<boolean> {
  const actual = await sha256Hex(bytes)
  return actual === expectedHex.toLowerCase()
}
