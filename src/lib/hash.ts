import crypto from 'crypto'

const ALGORITHM = 'sha1'
export function Hash(value:string):string{
  return crypto.createHash(ALGORITHM).update(value).digest("hex")
}