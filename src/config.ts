/**
 * Configuration and constants for HTTP Message Signatures verification.
 *
 * This module defines the supported signature algorithms and their mappings
 * to Node.js crypto hash algorithm names according to RFC 9421.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9421.html#name-signature-algorithms
 */

import type { Algorithm } from 'http-message-sig';

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
export const algorithmMap: Record<Algorithm, string | null> = {
	ed25519: null, // Ed25519 uses SHA-512 internally, no explicit hash needed
	'hmac-sha256': 'sha256',
	'rsa-pss-sha512': 'sha512',
	'rsa-v1_5-sha256': 'sha256',
	'ecdsa-p384-sha384': 'sha384',
	'ecdsa-p256-sha256': 'sha256',
};

/**
 * Key generation commands for supported algorithms.
 *
 * These OpenSSL commands help developers generate test key pairs
 * for each supported signature algorithm.
 */
export const keyGenerationCommands = {
	'ecdsa-p256-sha256': [
		'openssl ecparam -name prime256v1 -genkey -noout -out private-key.pem',
		'openssl ec -in private-key.pem -pubout -out public-key.pem',
	],
	'ecdsa-p384-sha384': [
		'openssl ecparam -name secp384r1 -genkey -noout -out private-key.pem',
		'openssl ec -in private-key.pem -pubout -out public-key.pem',
	],
	ed25519: ['openssl genpkey -algorithm ed25519 -out private-key.pem', 'openssl pkey -in private-key.pem -pubout -out public-key.pem'],
	'rsa-pss-sha512': [
		'openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private-key.pem',
		'openssl rsa -in private-key.pem -pubout -out public-key.pem',
	],
};
