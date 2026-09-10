/**
 * Core HTTP Message Signatures (RFC 9421) verification logic.
 * 
 * This module contains the pure verification logic for HTTP message signatures,
 * separated from the HTTP request handler and web UI.
 * 
 * @see https://www.rfc-editor.org/rfc/rfc9421.html
 */

import { verifySignature as verifyHttpSignature, type UntrustedSignatureCandidate, type Verifier } from 'http-message-sig';
import {
	constants,
	createHash,
	createPublicKey,
	timingSafeEqual,
	verify as cryptoVerify,
	type KeyObject,
} from 'node:crypto';
import { algorithmMap, type SupportedAlgorithm } from './config.js';
import { normalizePem } from './utils.js';

/**
 * Result of signature verification.
 */
export interface VerificationResult {
	verified: boolean;
	error?: string;
}

function assertPublicKeyMatchesAlgorithm(publicKey: KeyObject, algorithm: SupportedAlgorithm): void {
	const details = publicKey.asymmetricKeyDetails;

	switch (algorithm) {
		case 'ed25519':
			if (publicKey.asymmetricKeyType !== 'ed25519') throw new Error('Algorithm ed25519 requires an Ed25519 public key');
			break;
		case 'ecdsa-p256-sha256':
			if (publicKey.asymmetricKeyType !== 'ec' || details?.namedCurve !== 'prime256v1') {
				throw new Error('Algorithm ecdsa-p256-sha256 requires a P-256 public key');
			}
			break;
		case 'ecdsa-p384-sha384':
			if (publicKey.asymmetricKeyType !== 'ec' || details?.namedCurve !== 'secp384r1') {
				throw new Error('Algorithm ecdsa-p384-sha384 requires a P-384 public key');
			}
			break;
		case 'rsa-pss-sha512':
		case 'rsa-v1_5-sha256':
			if (publicKey.asymmetricKeyType !== 'rsa' && publicKey.asymmetricKeyType !== 'rsa-pss') {
				throw new Error(`Algorithm ${algorithm} requires an RSA public key`);
			}
			if ((details?.modulusLength ?? 0) < 2048) throw new Error('RSA public keys must be at least 2048 bits');
			break;
	}
}

function verifyWithAlgorithm(
	algorithm: SupportedAlgorithm,
	publicKey: KeyObject,
	data: Uint8Array,
	signature: Uint8Array
): boolean {
	assertPublicKeyMatchesAlgorithm(publicKey, algorithm);

	if (algorithm === 'rsa-pss-sha512') {
		return cryptoVerify('sha512', data, {
			key: publicKey.export({ type: 'spki', format: 'pem' }),
			padding: constants.RSA_PKCS1_PSS_PADDING,
			saltLength: 64,
		}, signature);
	}
	if (algorithm === 'rsa-v1_5-sha256') {
		return cryptoVerify('sha256', data, {
			key: publicKey.export({ type: 'spki', format: 'pem' }),
			padding: constants.RSA_PKCS1_PADDING,
		}, signature);
	}
	return cryptoVerify(algorithmMap[algorithm], data, publicKey, signature);
}

async function validateContentDigest(request: Request, coveredComponents: readonly { name: string }[]): Promise<void> {
	if (request.body === null) return;
	if (!coveredComponents.some((component) => component.name.toLowerCase() === 'content-digest')) {
		throw new Error('Requests with a body must cover the content-digest header');
	}

	const header = request.headers.get('content-digest');
	const match = header?.match(/(?:^|,\s*)(sha-256|sha-512)=:([A-Za-z0-9+/]+={0,2}):(?:\s*(?:,|$))/i);
	if (!match) throw new Error('Missing or unsupported Content-Digest header');

	const digestName = match[1].toLowerCase() === 'sha-256' ? 'sha256' : 'sha512';
	const expected = Buffer.from(match[2], 'base64');
	const actual = createHash(digestName).update(Buffer.from(await request.clone().arrayBuffer())).digest();
	if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
		throw new Error('Content-Digest does not match the request body');
	}
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
		if (!/^-----BEGIN PUBLIC KEY-----/.test(pemKey.trim()) || !/-----END PUBLIC KEY-----$/.test(pemKey.trim())) {
			throw new Error('Only SPKI PUBLIC KEY PEM input is accepted');
		}

		let publicKey;
		try {
			publicKey = createPublicKey(normalizePem(pemKey));
		} catch (error) {
			throw new Error(`Failed to parse public key: ${error instanceof Error ? error.message : String(error)}`);
		}

		const verifiedSignature = await verifyHttpSignature(request, {
			label: request.headers.get('x-signature-label') ?? undefined,
			policy: {
				algorithms: Object.keys(algorithmMap),
				requiredComponents: ['@method', '@path'],
				requiredParameters: ['alg'],
			},
			resolveVerifier(candidate: UntrustedSignatureCandidate): Verifier {
				if (!candidate.algorithm || !(candidate.algorithm in algorithmMap)) {
					throw new Error(`Unsupported or missing algorithm: ${candidate.algorithm}`);
				}

				const algorithm = candidate.algorithm as SupportedAlgorithm;
				return {
					algorithm,
					verify: (data, signature) => verifyWithAlgorithm(algorithm, publicKey, data, signature),
				};
			},
		});

		await validateContentDigest(request, verifiedSignature.components);
		return { verified: true };
	} catch (error) {
		return {
			verified: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}
