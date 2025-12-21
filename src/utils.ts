/**
 * Utility functions for HTTP Message Signatures verification.
 */

/**
 * Normalize PEM format for compatibility.
 * 
 * PEM keys can be provided in different formats:
 * 
 * Format 1 - Standard multi-line (preferred):
 * -----BEGIN PUBLIC KEY-----
 * MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
 * (base64 content split into 64-char lines)
 * -----END PUBLIC KEY-----
 * 
 * Format 2 - Single-line (URL-safe, no newlines):
 * -----BEGIN PUBLIC KEY----- MFkwEwYH... -----END PUBLIC KEY-----
 * 
 * This normalization:
 * 1. Checks if the key already has newlines (Format 1) - use as-is
 * 2. Otherwise, adds newlines after BEGIN marker and before END marker
 * 3. Splits base64 content into 64-character lines (PEM standard)
 * 
 * The regex (.{64}) captures 64-character chunks and replaces them
 * with the same chunk plus a newline, creating proper PEM formatting.
 * 
 * Why normalize?
 * - HTTP headers often strip or escape newlines
 * - URL encoding may convert \n to %0A
 * - Some clients send single-line keys for simplicity
 * - Node.js crypto.createPublicKey() expects standard PEM format
 * 
 * @param pemKey - The PEM-encoded public key (single-line or multi-line)
 * @returns Normalized PEM key with proper line breaks
 */
export function normalizePem(pemKey: string): string {
	// Already in multi-line format - use as-is
	if (pemKey.includes('\n')) {
		return pemKey;
	}

	// Single-line format - add newlines
	return pemKey
		.replace(/-----BEGIN PUBLIC KEY-----\s*/, '-----BEGIN PUBLIC KEY-----\n')
		.replace(/\s*-----END PUBLIC KEY-----/, '\n-----END PUBLIC KEY-----')
		.replace(/(.{64})/g, '$1\n');
}
