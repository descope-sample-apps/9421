/**
 * HTTP Message Signatures (RFC 9421) Demo & Testing Tool
 * 
 * ⚠️ DEMO/TESTING ONLY - NOT FOR PRODUCTION USE ⚠️
 * 
 * This Cloudflare Worker verifies HTTP message signatures according to RFC 9421.
 * It's designed for testing signature implementations and learning HTTP signatures.
 * 
 * WHY THIS IS INSECURE FOR PRODUCTION:
 * - Accepts public keys from client headers (x-public-key-pem)
 * - Anyone can provide their own key pair and sign requests
 * - No identity verification or key ownership validation
 * - No key registration, rotation, or revocation mechanism
 * - Information disclosure (echoes keys and signatures in responses)
 * 
 * PRODUCTION REQUIREMENTS:
 * - Store public keys server-side (KV, D1, environment variables)
 * - Implement key registration and authentication
 * - Validate key ownership and permissions
 * - Add rate limiting and abuse prevention
 * - Implement audit logging
 * - Use nonces to prevent replay attacks
 * - Validate timestamps and expiration
 * 
 * For production guidance, see: README.md#production-alternatives
 * 
 * @see https://www.rfc-editor.org/rfc/rfc9421.html - RFC 9421 Specification
 * @see https://github.com/christianjeller/http-message-sig - Signing library
 */

import { verify, Algorithm, Parameters } from 'http-message-sig';
import { createPublicKey, verify as cryptoVerify } from 'node:crypto';

/**
 * Maps RFC 9421 algorithm names to Node.js crypto hash algorithm names.
 * 
 * RFC 9421 defines several signature algorithms with specific hash functions.
 * Node.js crypto.verify() requires the hash algorithm name separately from
 * the signature algorithm (except for Ed25519 which has a built-in hash).
 * 
 * @see https://www.rfc-editor.org/rfc/rfc9421.html#name-signature-algorithms
 * 
 * Special case: Ed25519
 * - Ed25519 uses SHA-512 internally but crypto.verify() doesn't need it specified
 * - Pass `null` as the hash algorithm for Ed25519 signatures
 * - Node.js will automatically use the correct hash (SHA-512)
 * 
 * Algorithm details:
 * - ecdsa-p256-sha256: ECDSA with P-256 curve and SHA-256 hash
 * - ecdsa-p384-sha384: ECDSA with P-384 curve and SHA-384 hash
 * - ed25519: EdDSA with Curve25519 (SHA-512 built-in)
 * - rsa-pss-sha512: RSA-PSS with SHA-512 hash
 * - rsa-v1_5-sha256: RSA PKCS#1 v1.5 with SHA-256 hash
 * - hmac-sha256: HMAC with SHA-256 hash
 */
const algorithmMap: Record<Algorithm, string | null> = {
	ed25519: null, // Ed25519 uses SHA-512 internally, no explicit hash needed
	'hmac-sha256': 'sha256',
	'rsa-pss-sha512': 'sha512',
	'rsa-v1_5-sha256': 'sha256',
	'ecdsa-p384-sha384': 'sha384',
	'ecdsa-p256-sha256': 'sha256',
};

export default {
	/**
	 * Main request handler for HTTP Message Signature verification.
	 * 
	 * This handler:
	 * 1. Extracts the public key from the x-public-key-pem header
	 * 2. Verifies the HTTP message signature using RFC 9421 rules
	 * 3. Returns verification results with detailed debugging information
	 * 
	 * ⚠️ SECURITY WARNING:
	 * This accepts public keys from request headers, which is ONLY appropriate
	 * for demo/testing. In production, keys MUST be stored and managed server-side.
	 * 
	 * @param request - Incoming HTTP request with Signature headers
	 * @param env - Cloudflare Workers environment bindings
	 * @param ctx - Execution context for Cloudflare Workers
	 * @returns JSON response with verification results
	 */
	async fetch(request, env, ctx): Promise<Response> {
		/**
		 * Extract public key from request header.
		 * 
		 * ⚠️ DEMO ONLY: In production, retrieve keys from server-side storage!
		 * 
		 * The x-public-key-pem header allows clients to provide their own
		 * public key for signature verification. This is useful for testing
		 * but defeats authentication in production environments.
		 */
		const pemKey = request.headers.get('x-public-key-pem');

		if (!pemKey) {
			/**
			 * Helpful error response when public key is missing.
			 * 
			 * Provides:
			 * - Clear error message
			 * - Example header format
			 * - Key generation commands for common algorithms
			 * 
			 * This assists developers in getting started quickly.
			 */
			return Response.json(
				{
					error: 'Missing x-public-key-pem header',
					message: 'Please provide the public key in PEM format via the x-public-key-pem header',
					example: 'x-public-key-pem: -----BEGIN PUBLIC KEY----- MHYwEAYH... -----END PUBLIC KEY-----',
					keyGenerationCommands: {
						'ecdsa-p256-sha256': [
							'openssl ecparam -name prime256v1 -genkey -noout -out private-key.pem',
							'openssl ec -in private-key.pem -pubout -out public-key.pem',
						],
						'ecdsa-p384-sha384': [
							'openssl ecparam -name secp384r1 -genkey -noout -out private-key.pem',
							'openssl ec -in private-key.pem -pubout -out public-key.pem',
						],
						ed25519: [
							'openssl genpkey -algorithm ed25519 -out private-key.pem',
							'openssl pkey -in private-key.pem -pubout -out public-key.pem',
						],
						'rsa-pss-sha512': [
							'openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private-key.pem',
							'openssl rsa -in private-key.pem -pubout -out public-key.pem',
						],
					},
				},
				{ status: 400 }
			);
		}

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
				let publicKey;
				try {
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
					 */
					const normalizedPem = pemKey.includes('\n')
						? pemKey
						: pemKey
								.replace(/-----BEGIN PUBLIC KEY-----\s*/, '-----BEGIN PUBLIC KEY-----\n')
								.replace(/\s*-----END PUBLIC KEY-----/, '\n-----END PUBLIC KEY-----')
								.replace(/(.{64})/g, '$1\n');

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

			/**
			 * Success response with verification details.
			 * 
			 * Returns:
			 * - verified: true (signature passed verification)
			 * - Signature: Echo of the Signature header (for debugging)
			 * - Signature-Input: Echo of the Signature-Input header (for debugging)
			 * - pemKey: Echo of the public key (for debugging)
			 * 
			 * ⚠️ PRODUCTION WARNING:
			 * Echoing keys and signatures helps attackers analyze your system.
			 * In production, return minimal success responses (e.g., just {"verified": true})
			 */
			return Response.json(
				{
					verified: true,
					Signature: request.headers.get('Signature'),
					'Signature-Input': request.headers.get('Signature-Input'),
					pemKey,
				},
				{ status: 200 }
			);
		} catch (error) {
			/**
			 * Error response with detailed debugging information.
			 * 
			 * Common errors:
			 * - "Invalid signature": Signature doesn't match (wrong key, tampered data)
			 * - "Failed to parse public key": Invalid PEM format
			 * - "Unsupported or missing algorithm": Invalid or missing 'alg' parameter
			 * - "Missing Signature header": No Signature header in request
			 * - "Missing Signature-Input header": No Signature-Input header in request
			 * 
			 * The response includes the signature headers and public key to help
			 * developers debug their signature generation code.
			 * 
			 * ⚠️ PRODUCTION WARNING:
			 * Detailed error messages help attackers probe your system.
			 * In production, return generic errors (e.g., "Verification failed")
			 */
			return Response.json(
				{
					verified: false,
					error: error instanceof Error ? error.message : String(error),
					Signature: request.headers.get('Signature'),
					'Signature-Input': request.headers.get('Signature-Input'),
					pemKey,
				},
				{ status: 400 }
			);
		}
	},
} satisfies ExportedHandler<Env>;
