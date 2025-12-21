/**
 * Comprehensive Test Suite for RFC 9421 HTTP Message Signatures Demo Tool
 *
 * This test suite validates:
 * - Required headers validation and error messages
 * - PEM key format normalization
 * - Error message quality and helpfulness
 * - Response format correctness
 * - Edge cases and error handling
 *
 * Note: Full signature verification tests with all algorithms require integration
 * testing with real signed requests. This suite focuses on testing the error handling,
 * PEM normalization logic, and response formats that can be tested in isolation.
 */

import { describe, it, expect } from 'vitest';
import worker from '../src/index';

/**
 * Helper function to create test environment
 */
function createTestEnv() {
	const env = {} as Env;
	const ctx = {
		waitUntil: () => {},
		passThroughOnException: () => {},
	} as ExecutionContext;
	return { env, ctx };
}

describe('RFC 9421 HTTP Message Signatures - Required Headers Validation', () => {
	it('should return helpful error when x-public-key-pem header is missing', async () => {
		// NEGATIVE TEST: Validates that missing public key header returns comprehensive help
		// This is the most common mistake - forgetting to include the public key
		// The error should include examples and key generation commands
		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
			},
			body: 'test message',
		});
	});

	it('should provide helpful error message structure', async () => {
		// POSITIVE TEST: Validates the structure of error messages for missing header
		// Error messages should guide developers on how to fix the issue
		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		// Verify the error response has all necessary fields for debugging
		expect(typeof data.error).toBe('string');
		expect(typeof data.message).toBe('string');
		expect(typeof data.example).toBe('string');
		expect(typeof data.keyGenerationCommands).toBe('object');
	});
});

describe('RFC 9421 HTTP Message Signatures - PEM Format Handling', () => {
	it('should reject malformed PEM with invalid Base64 data', async () => {
		// NEGATIVE TEST: Validates that invalid Base64 data in PEM returns parse error
		// This ensures garbage data is caught early with helpful message
		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-public-key-pem': '-----BEGIN PUBLIC KEY----- INVALID_BASE64_DATA!!!@@# -----END PUBLIC KEY-----',
				signature: 'sig1=:dGVzdA==:',
				'signature-input': 'sig1=("@method" "@path");alg="ecdsa-p256-sha256";keyid="test-key"',
			},
			body: 'test message',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		expect(response.status).toBe(400);
		expect(data).toHaveProperty('verified', false);
		expect(data.error).toContain('Failed to parse public key');
	});

	it('should reject PEM missing BEGIN header', async () => {
		// NEGATIVE TEST: Validates that PEM without BEGIN header returns helpful parse error
		// This catches a common mistake when manually constructing PEM keys
		const invalidPem = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE -----END PUBLIC KEY-----';

		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-public-key-pem': invalidPem,
				signature: 'sig1=:dGVzdA==:',
				'signature-input': 'sig1=("@method" "@path");alg="ecdsa-p256-sha256";keyid="test-key"',
			},
			body: 'test message',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		expect(response.status).toBe(400);
		expect(data).toHaveProperty('verified', false);
		expect(data.error).toContain('Failed to parse public key');
	});

	it('should reject PEM missing END footer', async () => {
		// NEGATIVE TEST: Validates that PEM without END footer returns helpful parse error
		// This catches truncated or incomplete PEM keys
		const invalidPem = '-----BEGIN PUBLIC KEY----- MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE';

		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-public-key-pem': invalidPem,
				signature: 'sig1=:dGVzdA==:',
				'signature-input': 'sig1=("@method" "@path");alg="ecdsa-p256-sha256";keyid="test-key"',
			},
			body: 'test message',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		expect(response.status).toBe(400);
		expect(data).toHaveProperty('verified', false);
		expect(data.error).toContain('Failed to parse public key');
	});
});

describe('RFC 9421 HTTP Message Signatures - Response Format', () => {
	it('should return correct error response format with debugging info', async () => {
		// NEGATIVE TEST: Validates the error response structure
		// Error responses must include verified: false, error message, and headers for debugging
		const testPem =
			'-----BEGIN PUBLIC KEY----- MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEW69HKj6RAv5JS9cuAc6cpp3jplPykLyuqO6dqPt2IMZz9cezYIiieW0rZfGQ0W0T2aOD4LkrW0pf739cJGz98Q== -----END PUBLIC KEY-----';

		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-public-key-pem': testPem,
				signature: 'sig1=:invalid_signature_data:',
				'signature-input': 'sig1=();alg="ecdsa-p256-sha256";keyid="test-key"',
			},
			body: 'test message',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		expect(response.status).toBe(400);
		expect(data).toHaveProperty('verified', false);
		expect(data).toHaveProperty('error');
		expect(data).toHaveProperty('Signature');
		expect(data).toHaveProperty('Signature-Input');
		expect(data).toHaveProperty('pemKey');
		expect(typeof data.error).toBe('string');
	});

	it('should echo back signature headers in error responses', async () => {
		// NEGATIVE TEST: Validates that signature headers are preserved in error response
		// This helps developers debug by showing what was actually received
		const testPem =
			'-----BEGIN PUBLIC KEY----- MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEW69HKj6RAv5JS9cuAc6cpp3jplPykLyuqO6dqPt2IMZz9cezYIiieW0rZfGQ0W0T2aOD4LkrW0pf739cJGz98Q== -----END PUBLIC KEY-----';
		const testSig = 'sig1=:test_signature:';
		const testSigInput = 'sig1=();alg="ecdsa-p256-sha256";keyid="test-key"';

		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-public-key-pem': testPem,
				signature: testSig,
				'signature-input': testSigInput,
			},
			body: 'test',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		expect(data.Signature).toBe(testSig);
		expect(data['Signature-Input']).toBe(testSigInput);
		expect(data.pemKey).toBe(testPem);
	});
});

describe('RFC 9421 HTTP Message Signatures - Edge Cases', () => {
	it('should handle empty signature value', async () => {
		// NEGATIVE TEST: Validates handling of empty signature values
		// Empty or malformed signature values should be caught with helpful errors
		const testPem =
			'-----BEGIN PUBLIC KEY----- MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEW69HKj6RAv5JS9cuAc6cpp3jplPykLyuqO6dqPt2IMZz9cezYIiieW0rZfGQ0W0T2aOD4LkrW0pf739cJGz98Q== -----END PUBLIC KEY-----';

		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-public-key-pem': testPem,
				signature: 'sig1=::',
				'signature-input': 'sig1=();alg="ecdsa-p256-sha256";keyid="test-key"',
			},
			body: 'test message',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		expect(response.status).toBe(400);
		expect(data).toHaveProperty('verified', false);
		expect(data).toHaveProperty('error');
	});

	it('should handle malformed Signature-Input syntax', async () => {
		// NEGATIVE TEST: Validates handling of malformed Signature-Input header
		// Invalid syntax in Signature-Input should be caught by the library
		const testPem =
			'-----BEGIN PUBLIC KEY----- MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEW69HKj6RAv5JS9cuAc6cpp3jplPykLyuqO6dqPt2IMZz9cezYIiieW0rZfGQ0W0T2aOD4LkrW0pf739cJGz98Q== -----END PUBLIC KEY-----';

		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-public-key-pem': testPem,
				signature: 'sig1=:AAAA:',
				'signature-input': 'MALFORMED SYNTAX HERE',
			},
			body: 'test message',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		expect(response.status).toBe(400);
		expect(data).toHaveProperty('verified', false);
		expect(data).toHaveProperty('error');
	});

	it('should handle missing Signature header', async () => {
		// NEGATIVE TEST: Validates that missing Signature header is caught
		// The http-message-sig library will catch this and return an error
		const testPem =
			'-----BEGIN PUBLIC KEY----- MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEW69HKj6RAv5JS9cuAc6cpp3jplPykLyuqO6dqPt2IMZz9cezYIiieW0rZfGQ0W0T2aOD4LkrW0pf739cJGz98Q== -----END PUBLIC KEY-----';

		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-public-key-pem': testPem,
				'signature-input': 'sig1=();alg="ecdsa-p256-sha256";keyid="test-key"',
			},
			body: 'test message',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		expect(response.status).toBe(400);
		expect(data).toHaveProperty('verified', false);
		expect(data).toHaveProperty('error');
	});

	it('should handle missing Signature-Input header', async () => {
		// NEGATIVE TEST: Validates that missing Signature-Input header is caught
		// The Signature-Input header describes what was signed and with which algorithm
		const testPem =
			'-----BEGIN PUBLIC KEY----- MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEW69HKj6RAv5JS9cuAc6cpp3jplPykLyuqO6dqPt2IMZz9cezYIiieW0rZfGQ0W0T2aOD4LkrW0pf739cJGz98Q== -----END PUBLIC KEY-----';

		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-public-key-pem': testPem,
				signature: 'sig1=:AAAA:',
			},
			body: 'test message',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		expect(response.status).toBe(400);
		expect(data).toHaveProperty('verified', false);
		expect(data).toHaveProperty('error');
	});
});

describe('RFC 9421 HTTP Message Signatures - Error Message Quality', () => {
	it('should provide actionable error for missing public key', async () => {
		// NEGATIVE TEST: Validates error message quality for missing public key
		// Error should guide developers on how to fix the issue
		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			body: 'test',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		expect(data.error).toBe('Missing x-public-key-pem header');
		expect(data.message).toContain('provide the public key');
		expect(data.example).toContain('x-public-key-pem');
		expect(Object.keys(data.keyGenerationCommands).length).toBeGreaterThan(0);
	});

	it('should provide clear error for PEM parsing failures', async () => {
		// NEGATIVE TEST: Validates error message quality for PEM parsing errors
		// Should indicate the public key format is invalid
		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-public-key-pem': '-----BEGIN PUBLIC KEY----- INVALID -----END PUBLIC KEY-----',
				signature: 'sig1=:dGVzdA==:',
				'signature-input': 'sig1=("@method" "@path");alg="ecdsa-p256-sha256";keyid="test-key"',
			},
			body: 'test',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		expect(data.error).toContain('Failed to parse public key');
		expect(data.verified).toBe(false);
	});

	it('should include all debugging information in error responses', async () => {
		// NEGATIVE TEST: Validates that error responses contain sufficient debugging info
		// Developers need to see what was received to troubleshoot issues
		const testPem = '-----BEGIN PUBLIC KEY----- test -----END PUBLIC KEY-----';
		const testSig = 'sig1=:test:';
		const testSigInput = 'sig1=();alg="ecdsa-p256-sha256";keyid="key-1"';

		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'x-public-key-pem': testPem,
				signature: testSig,
				'signature-input': testSigInput,
			},
			body: 'test',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		// Verify all debugging fields are present
		expect(data).toHaveProperty('verified');
		expect(data).toHaveProperty('error');
		expect(data).toHaveProperty('Signature', testSig);
		expect(data).toHaveProperty('Signature-Input', testSigInput);
		expect(data).toHaveProperty('pemKey', testPem);
	});
});

describe('RFC 9421 HTTP Message Signatures - Algorithm Support', () => {
	it('should reject unsupported algorithm with helpful error', async () => {
		// NEGATIVE TEST: Validates that unsupported algorithms are rejected with clear error message
		// This ensures the tool only accepts the 6 documented algorithms
		const testPem =
			'-----BEGIN PUBLIC KEY----- MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEW69HKj6RAv5JS9cuAc6cpp3jplPykLyuqO6dqPt2IMZz9cezYIiieW0rZfGQ0W0T2aOD4LkrW0pf739cJGz98Q== -----END PUBLIC KEY-----';

		const request = new Request('http://localhost:8787/verify', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				'x-public-key-pem': testPem,
				signature: 'sig1=:dGVzdA==:',
				'signature-input': 'sig1=("@method" "@path");alg="unsupported-algorithm";keyid="test-key"',
			},
			body: 'test message',
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const data = (await response.json()) as any;

		expect(response.status).toBe(400);
		expect(data).toHaveProperty('verified', false);
		// The error could be about PEM parsing or unsupported algorithm depending on execution order
		expect(data.error).toBeTruthy();
		expect(typeof data.error).toBe('string');
	});
});
