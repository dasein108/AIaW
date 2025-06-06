class EncryptionService {
  // Encrypt mnemonic
  static async encryptMnemonic(mnemonic: string, pin: string): Promise<string> {
    try {
      // Use PIN as encryption key
      const key = await this.deriveKeyFromPin(pin)
      const iv = crypto.getRandomValues(new Uint8Array(12))

      // Encrypt mnemonic
      const encodedMnemonic = new TextEncoder().encode(mnemonic)
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedMnemonic
      )

      // Save encrypted data and IV
      const encryptedMnemonic = {
        data: Array.from(new Uint8Array(encryptedData)),
        iv: Array.from(iv)
      }

      return JSON.stringify(encryptedMnemonic)
    } catch (error) {
      console.error('Error encrypting mnemonic:', error)
      throw new Error('Failed to encrypt mnemonic')
    }
  }

  // Decrypt mnemonic
  static async decryptMnemonic(encryptedData: string, pin: string): Promise<string> {
    try {
      const { data, iv } = JSON.parse(encryptedData)
      const key = await this.deriveKeyFromPin(pin)

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(data)
      )

      return new TextDecoder().decode(decryptedData)
    } catch (error) {
      console.error('Error decrypting mnemonic:', error)
      throw new Error('Failed to decrypt mnemonic')
    }
  }

  // Derive key from PIN
  private static async deriveKeyFromPin(pin: string): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const pinData = encoder.encode(pin)

    // Use PBKDF2 to derive key from PIN
    const baseKey = await crypto.subtle.importKey(
      'raw',
      pinData,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('aiaw-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    )
  }
}

export { EncryptionService }
