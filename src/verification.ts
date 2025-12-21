/**
 * Core HTTP Message Signatures (RFC 9421) verification logic.
 * 
 * This module contains the pure verification logic for HTTP message signatures,
 * separated from the Cloudflare Worker handler and web UI.
 * 
 * @see https://www.rfc-editor.org/rfc/rfc9421.html
 */

import { verify, type Algorithm, type Parameters } from 'http-message-sig';
import { createPublicKey, verify as cryptoVerify } from 'node:crypto';
import { algorithmMap } from './config';
import { normalizePem } from './utils';

/**
 * Result of signature verification.
 */
export interface VerificationResult {
	verified: boolean;
	error?: string;
}

/**
 * Verify an HTTP message signature using RFC 9421.
 * 
 * This function:
 * 1. Parses the provided PEM-encoded public key
 * 2. Uses the http-message-sig library to reconstruct the signature base
 * 3. Verifies the cryptographic signature using Node.js crypto
 * 4. Returns verification result
 * 
 * @param request - The HTTP request containing Signature and Signature-Input headers
 * @param pemKey - PEM-encoded public key (single-line or multi-line format)
 * @returns Verification result indicating success or failure with error details
 * 
 * @throws Never throws - all errors are caught and returned in VerificationResult
 * 
 * @example
 * ```typescript
 * const result = await verifySignature(request, publicKeyPem);
 * if (result.verified) {
 *   console.log('Signature is valid!');
 * } else {
 *   console.error('Verification failed:', result.error);
 * }
 * ```
 */
export async function verifySignature(request: Request, pemKey: string): Promise<VerificationResult> {
	try {
		/**
		 * Verify the HTTP message signature per RFC 9421.
		 * 
		 * The verify() function from http-message-sig:
		 * 1. Extracts Signature and Signature-Input headers
		 * 2. Reconstructs the signature base (what was signed)
		 * 3. Calls our callback to verify the signature cryptographically
		 * 4. Throws an error if verification fails
		 * 
		 * Our callback receives:
		 * - data: The signature base string (what should be signed)
		 * - signature: The actual signature bytes from the Signature header
		 * - params: Parsed parameters from Signature-Input (alg, keyid, created, etc.)
		 * 
		 * @see https://www.rfc-editor.org/rfc/rfc9421.html#name-signature-verification
		 */
		await verify(request, async (data: string, signature: Uint8Array, params: Parameters) => {
			// Parse the PEM-encoded public key
			let publicKey;
			try {
				/**
				 * Parse the PEM-encoded public key into a KeyObject.
				 * 
				 * createPublicKey() supports multiple formats:
				 * - PEM (what we use): -----BEGIN PUBLIC KEY----- base64 -----END PUBLIC KEY-----
				 * - DER: Raw binary format
				 * - JWK: JSON Web Key format
				 * 
				 * The parsed KeyObject can be used with crypto.verify() for
				 * signature verification with various algorithms.
				 * 
				 * @throws Error if PEM format is invalid or key type is unsupported
				 */
				const normalizedPem = normalizePem(pemKey);
				publicKey = createPublicKey(normalizedPem);
			} catch (err) {
				throw new Error(`Failed to parse public key: ${err instanceof Error ? err.message : String(err)}`);
			}

			/**
			 * Extract and validate the signature algorithm.
			 * 
			 * RFC 9421 requires the 'alg' parameter in Signature-Input header.
			 * Example: sig1=(...);alg="ecdsa-p256-sha256"
			 * 
			 * We validate that:
			 * 1. The 'alg' parameter is present
			 * 2. The algorithm is in our supported list (algorithmMap)
			 * 
			 * Without a valid algorithm, we cannot verify the signature.
			 * 
			 * @see https://www.rfc-editor.org/rfc/rfc9421.html#name-signature-algorithm
			 */
			if (!params.alg || !(params.alg in algorithmMap)) {
				throw new Error(`Unsupported or missing algorithm: ${params.alg}`);
			}

			/**
			 * Map RFC 9421 algorithm name to Node.js hash algorithm.
			 * 
			 * For most algorithms, we need to specify the hash separately:
			 * - ecdsa-p256-sha256 → sha256
			 * - rsa-pss-sha512 → sha512
			 * 
			 * Exception: Ed25519 uses null (built-in SHA-512)
			 */
			const hashAlgorithm = algorithmMap[params.alg as Algorithm];

			/**
			 * Verify the cryptographic signature.
			 * 
			 * crypto.verify() checks that:
			 * 1. The signature was created by the private key matching this public key
			 * 2. The signature covers the exact data provided
			 * 3. The signature hasn't been tampered with
			 * 
			 * Parameters:
			 * - hashAlgorithm: Hash function used (sha256, sha384, sha512, or null for ed25519)
			 * - data: The signature base string from RFC 9421 (what was signed)
			 * - publicKey: The parsed public key
			 * - signature: The signature bytes from the Signature header
			 * 
			 * Returns:
			 * - true: Signature is valid (request authentically signed with matching private key)
			 * - false: Signature is invalid (wrong key, tampered data, or corrupted signature)
			 * 
			 * @see https://nodejs.org/api/crypto.html#cryptoverifyalgorithm-data-key-signature-callback
			 */
			const isValid = cryptoVerify(hashAlgorithm, Buffer.from(data), publicKey, signature);

			if (!isValid) {
				throw new Error('Invalid signature');
			}
		});

		// Verification succeeded
		return { verified: true };
	} catch (error) {
		/**
		 * Common verification errors:
		 * - "Invalid signature": Signature doesn't match (wrong key, tampered data)
		 * - "Failed to parse public key": Invalid PEM format
		 * - "Unsupported or missing algorithm": Invalid or missing 'alg' parameter
		 * - "Missing Signature header": No Signature header in request
		 * - "Missing Signature-Input header": No Signature-Input header in request
		 */
		return {
			verified: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
