import { describe, it, expect } from 'vitest'
import { hashSharePassword, verifySharePassword } from './share-password'

describe('share password hashing', () => {
  it('should hash a password and verify it correctly', async () => {
    const password = 'my-secret-password'
    const hash = await hashSharePassword(password)

    const isValid = await verifySharePassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject an incorrect password', async () => {
    const hash = await hashSharePassword('correct-password')

    const isValid = await verifySharePassword('wrong-password', hash)
    expect(isValid).toBe(false)
  })

  it('should produce different hashes for the same password (salted)', async () => {
    const password = 'same-password'
    const hash1 = await hashSharePassword(password)
    const hash2 = await hashSharePassword(password)

    expect(hash1).not.toBe(hash2)

    // Both should still verify
    expect(await verifySharePassword(password, hash1)).toBe(true)
    expect(await verifySharePassword(password, hash2)).toBe(true)
  })

  it('should produce a bcrypt hash string', async () => {
    const hash = await hashSharePassword('test')

    // bcrypt hashes start with $2a$ or $2b$
    expect(hash).toMatch(/^\$2[ab]\$\d{2}\$/)
  })

  it('should not store the password in plain text', async () => {
    const password = 'plaintext-should-not-appear'
    const hash = await hashSharePassword(password)

    expect(hash).not.toBe(password)
    expect(hash).not.toContain(password)
  })

  it('should handle empty string password', async () => {
    const hash = await hashSharePassword('')

    // Empty string should still hash and verify
    expect(await verifySharePassword('', hash)).toBe(true)
    expect(await verifySharePassword('not-empty', hash)).toBe(false)
  })

  it('should handle unicode passwords', async () => {
    const password = 'p@$$w0rd-with-unicode-'
    const hash = await hashSharePassword(password)

    expect(await verifySharePassword(password, hash)).toBe(true)
    expect(await verifySharePassword('p@$$w0rd-with-unicode', hash)).toBe(false)
  })
})
