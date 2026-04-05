import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 10

export async function hashSharePassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_ROUNDS)
}

export async function verifySharePassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}
