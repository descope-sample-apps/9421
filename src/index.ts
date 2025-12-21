/**
 * HTTP Message Signatures (RFC 9421) Demo & Testing Tool
 *
 * ⚠️ DEMO/TESTING ONLY - NOT FOR PRODUCTION USE ⚠️
 *
 * This service verifies HTTP message signatures according to RFC 9421.
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
 * - Store public keys server-side (key-value store, database, environment variables)
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
 * @see https://github.com/cloudflare/web-bot-auth/tree/main/packages/http-message-sig - Signing library
 */

import { keyGenerationCommands } from './config';
import { verifySignature } from './verification';

export default {
	/**
	 * Main request handler for HTTP Message Signature verification.
	 *
	 * This handler routes requests to appropriate handlers:
	 * - OPTIONS: CORS preflight
	 * - GET: Interactive web UI
	 * - POST: Signature verification
	 *
	 * ⚠️ SECURITY WARNING:
	 * This accepts public keys from request headers, which is ONLY appropriate
	 * for demo/testing. In production, keys MUST be stored and managed server-side.
	 *
	 * @param request - Incoming HTTP request
	 * @param env - Environment bindings (platform-specific)
	 * @param ctx - Execution context (platform-specific)
	 * @returns JSON response with verification results or HTML for web UI
	 */
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
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
					keyGenerationCommands,
				},
				{ status: 400 }
			);
		}

		/**
		 * Verify the HTTP message signature.
		 *
		 * The verifySignature function handles:
		 * 1. PEM key normalization
		 * 2. RFC 9421 signature verification
		 * 3. Cryptographic validation
		 * 4. Error handling
		 */
		const result = await verifySignature(request, pemKey);

		if (result.verified) {
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
		} else {
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
					error: result.error,
					Signature: request.headers.get('Signature'),
					'Signature-Input': request.headers.get('Signature-Input'),
					pemKey,
				},
				{ status: 400 }
			);
		}
	},
} satisfies ExportedHandler<Env>;
