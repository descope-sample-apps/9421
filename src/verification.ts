/**
 * Core HTTP Message Signatures (RFC 9421) verification logic.
 * 
 * This module contains the pure verification logic for HTTP message signatures,
 * separated from the Cloudflare Worker handler and web UI.
 * 
 * @see https://www.rfc-editor.org/rfc/rfc9421.html
 */

import { verifySignature as verifyHttpSignature, type UntrustedSignatureCandidate, type Verifier } from 'http-message-sig';
import { createPublicKey, verify as cryptoVerify } from 'node:crypto';
import { algorithmMap, type SupportedAlgorithm } from './config';
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
		let publicKey;
		try {
			publicKey = createPublicKey(normalizePem(pemKey));
		} catch (error) {
			throw new Error(`Failed to parse public key: ${error instanceof Error ? error.message : String(error)}`);
		}

		await verifyHttpSignature(request, {
			policy: {
				algorithms: Object.keys(algorithmMap),
				requiredComponents: [],
				requiredParameters: ['alg'],
			},
			resolveVerifier(candidate: UntrustedSignatureCandidate): Verifier {
				if (!candidate.algorithm || !(candidate.algorithm in algorithmMap)) {
					throw new Error(`Unsupported or missing algorithm: ${candidate.algorithm}`);
				}

				const algorithm = candidate.algorithm as SupportedAlgorithm;
				return {
					algorithm,
					verify: (data, signature) => cryptoVerify(algorithmMap[algorithm], data, publicKey, signature),
				};
			},
		});

		return { verified: true };
	} catch (error) {
		return {
			verified: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
