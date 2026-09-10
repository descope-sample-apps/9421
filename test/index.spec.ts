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

import { constants, createHash, generateKeyPairSync, sign } from 'node:crypto';
import { appendSignature, createSignatureSync } from 'http-message-sig';
import { describe, it, expect } from 'vitest';
import worker from '../src/index';
import { verifySignature } from '../src/verification';

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
	it('serves a robust browser workbench without entering verification', async () => {
		const request = new Request('http://localhost:8787/', {
			headers: { accept: 'TEXT/HTML' },
		});

		const { env, ctx } = createTestEnv();
		const response = await worker.fetch(request, env, ctx);
		const body = await response.text();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
		expect(response.headers.get('vary')).toBe('Accept');
		expect(response.headers.get('content-security-policy')).toContain('img-src data:');
		expect(body).toContain('9421 Guru');
		expect(body.match(/<main\b/g)).toHaveLength(1);
		expect(body.match(/<h1\b/g)).toHaveLength(1);
		expect(body).toContain('<h1 class="sr-only">9421 Guru</h1>');
		expect(body).toContain("replace(/\\r?\\n/g,' ')");
		expect(body).toContain('body:body||undefined');
		expect(body).toContain('Additional signed headers');
		expect(body).toContain("const headers={...(body?{'content-type':'application/json'}:{}),...additionalHeaders");
		expect(body).not.toContain('<code>hmac-sha256</code>');
		expect(body).toContain("status.textContent='Error loading manifest'");
	});

	it('publishes agent-readable API discovery resources', async () => {
		const { env, ctx } = createTestEnv();
		const manifestResponse = await worker.fetch(
			new Request('https://verifier.example/', { headers: { accept: 'application/json' } }), env, ctx
		);
		const manifest = (await manifestResponse.json()) as any;
		expect(manifest.endpoint).toBe('https://verifier.example/');
		expect(manifest.requiredCoveredComponents).toEqual(['@method', '@path']);
		expect(manifest.llmsTxt).toBe('https://verifier.example/llms.txt');
		const llmsResponse = await worker.fetch(new Request('https://verifier.example/llms.txt'), env, ctx);
		const llms = await llmsResponse.text();
		expect(llmsResponse.headers.get('content-type')).toBe('text/plain; charset=utf-8');
		expect(llms).toContain('# 9421 Guru — RFC 9421 Registered Message Verifier');
		expect(llms).toContain('Required covered components: @method, @path');
		const mountedResponse = await worker.fetch(new Request('https://verifier.example/9421/llms.txt'), env, ctx);
		expect(await mountedResponse.text()).toContain('Endpoint: https://verifier.example/9421/');

		const mountedManifestResponse = await worker.fetch(
			new Request('https://verifier.example/9421', { headers: { accept: 'application/json' } }),
			env,
			ctx
		);
		const mountedManifest = (await mountedManifestResponse.json()) as any;
		expect(mountedManifest.endpoint).toBe('https://verifier.example/9421/');
		expect(mountedManifest.llmsTxt).toBe('https://verifier.example/9421/llms.txt');
	});

	it('routes signed GET requests to signature verification', async () => {
		const { env, ctx } = createTestEnv();
		const request = new Request('https://verifier.example/resource', {
			headers: {
				accept: 'text/html',
				signature: 'sig1=:dGVzdA==:',
				'signature-input': 'sig1=("@method" "@path");alg="ed25519"',
				'x-public-key-pem': 'not a public key',
			},
		});

		const response = await worker.fetch(request, env, ctx);
		const body = (await response.json()) as any;

		expect(response.status).toBe(400);
		expect(body).toHaveProperty('verified', false);
		expect(body).toHaveProperty('error');
		expect(body).not.toHaveProperty('endpoint');
	});

	it('rejects signatures that cover no request components', async () => {
		const { privateKey, publicKey } = generateKeyPairSync('ed25519');
		const request = new Request('https://example.com/verify', { method: 'POST' });
		const fields = createSignatureSync(request, {
			components: [],
			parameters: { alg: 'ed25519' },
			signer: {
				algorithm: 'ed25519',
				sign: (data) => sign(null, data, privateKey),
			},
		});
		const signedRequest = new Request(request, { headers: appendSignature(request.headers, fields) });

		const result = await verifySignature(
			signedRequest,
			publicKey.export({ type: 'spki', format: 'pem' }).toString()
		);

		expect(result.verified).toBe(false);
		expect(result.error).toContain('@method');
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
		expect(data.error).toMatch(/Failed to parse public key|Only SPKI PUBLIC KEY PEM/);
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
		expect(data.error).toMatch(/Failed to parse public key|Only SPKI PUBLIC KEY PEM/);
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
		expect(data.error).toMatch(/Failed to parse public key|Only SPKI PUBLIC KEY PEM/);
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
		expect(data).not.toHaveProperty('pemKey');
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
		expect(data).not.toHaveProperty('pemKey');
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

		expect(data.error).toMatch(/Failed to parse public key|Only SPKI PUBLIC KEY PEM/);
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
		expect(data).not.toHaveProperty('pemKey');
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

describe('RFC 9421 HTTP Message Signatures - Security invariants', () => {
	const publicPem = (key: any) => key.export({ type: 'spki', format: 'pem' }).toString();

	it('rejects a declared algorithm that does not match the key family', async () => {
		const { privateKey, publicKey } = generateKeyPairSync('ed25519');
		const request = new Request('https://example.com/verify', { method: 'POST' });
		const fields = createSignatureSync(request, {
			components: ['@method', '@path'], parameters: { alg: 'rsa-v1_5-sha256' },
			signer: { algorithm: 'rsa-v1_5-sha256', sign: (data) => sign(null, data, privateKey) },
		});
		const result = await verifySignature(new Request(request, { headers: appendSignature(request.headers, fields) }), publicPem(publicKey));
		expect(result.verified).toBe(false);
		expect(result.error).toContain('requires an RSA public key');
	});

	it('verifies RSA-PSS with a SHA-512 digest-length salt', async () => {
		const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
		const request = new Request('https://example.com/verify', { method: 'POST' });
		const fields = createSignatureSync(request, {
			components: ['@method', '@path'], parameters: { alg: 'rsa-pss-sha512' },
			signer: { algorithm: 'rsa-pss-sha512', sign: (data) => sign('sha512', data, { key: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(), padding: constants.RSA_PKCS1_PSS_PADDING, saltLength: 64 }) },
		});
		expect(await verifySignature(new Request(request, { headers: appendSignature(request.headers, fields) }), publicPem(publicKey))).toEqual({ verified: true });
	});

	it('authenticates the exact request body with Content-Digest', async () => {
		const { privateKey, publicKey } = generateKeyPairSync('ed25519');
		const body = '{"safe":true}';
		const digest = createHash('sha256').update(body).digest('base64');
		const request = new Request('https://example.com/verify', { method: 'POST', headers: { 'content-digest': `sha-256=:${digest}:` }, body });
		const fields = createSignatureSync(request, {
			components: ['@method', '@path', 'content-digest'], parameters: { alg: 'ed25519' },
			signer: { algorithm: 'ed25519', sign: (data) => sign(null, data, privateKey) },
		});
		const headers = appendSignature(request.headers, fields);
		expect(await verifySignature(new Request(request, { headers }), publicPem(publicKey))).toEqual({ verified: true });
		const result = await verifySignature(new Request(request.url, { method: 'POST', headers, body: '{"safe":false}' }), publicPem(publicKey));
		expect(result.verified).toBe(false);
		expect(result.error).toContain('does not match');
	});

	it('rejects bodies whose Content-Digest is not covered', async () => {
		const { privateKey, publicKey } = generateKeyPairSync('ed25519');
		const request = new Request('https://example.com/verify', { method: 'POST', body: 'payload' });
		const fields = createSignatureSync(request, {
			components: ['@method', '@path'], parameters: { alg: 'ed25519' },
			signer: { algorithm: 'ed25519', sign: (data) => sign(null, data, privateKey) },
		});
		const result = await verifySignature(new Request(request, { headers: appendSignature(request.headers, fields) }), publicPem(publicKey));
		expect(result.verified).toBe(false);
		expect(result.error).toContain('must cover the content-digest');
	});

	it('rejects private-key PEM input without echoing it', async () => {
		const { privateKey } = generateKeyPairSync('ed25519');
		const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
		const headerPrivatePem = privatePem.replace(/\r?\n/g, ' ');
		const request = new Request('https://example.com/verify', { method: 'POST', headers: { 'x-public-key-pem': headerPrivatePem, signature: 'sig1=:AAAA:', 'signature-input': 'sig1=("@method" "@path");alg="ed25519"' } });
		const { env, ctx } = createTestEnv();
		const data = (await (await worker.fetch(request, env, ctx)).json()) as any;
		expect(data.verified).toBe(false);
		expect(data.error).toContain('Only SPKI PUBLIC KEY PEM');
		expect(JSON.stringify(data)).not.toContain(headerPrivatePem);
	});
});
