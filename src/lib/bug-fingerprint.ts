import { createHash } from 'crypto'

/** Normalize an error message into a "shape" so similar errors group together
 *  regardless of the specific ids/numbers/urls embedded in them. */
export function shapeOf(msg: string): string {
  return msg
    .toLowerCase()
    .replace(/[0-9a-f]{8,}/g, '<id>')          // hex ids / hashes
    .replace(/\b\d+\b/g, '<n>')                 // numbers
    .replace(/https?:\/\/\S+/g, '<url>')        // urls
    .replace(/[a-z0-9]{20,}/g, '<token>')       // long tokens
    .slice(0, 140)
    .trim()
}

/** Stable fingerprint for a (route, error-shape) pattern — used to persist
 *  an admin's "fixed / not fixed" verdict across analysis runs. */
export function fingerprintFor(route: string, message: string): string {
  return createHash('sha1').update(`${route}::${shapeOf(message)}`).digest('hex')
}
