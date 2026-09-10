export function createApiDescription(baseUrl: string) {
	return {
		name: 'RFC 9421 Registered Message Verifier',
		description: 'Demo API for verifying RFC 9421 HTTP Message Signatures. Not an authentication service.',
		version: '1.0',
		endpoint: baseUrl,
		method: 'POST',
		requiredHeaders: {
			Signature: 'RFC 9421 Signature field',
			'Signature-Input': 'RFC 9421 Signature-Input field',
			'x-public-key-pem': 'SPKI PUBLIC KEY PEM; line breaks may be replaced with spaces',
		},
		requiredCoveredComponents: ['@method', '@path'],
		bodyRequirements: 'Requests with a body must include a valid, signed Content-Digest using sha-256 or sha-512',
		multipleSignatures: 'Set x-signature-label to the Signature-Input label to verify',
		algorithms: ['ed25519', 'ecdsa-p256-sha256', 'ecdsa-p384-sha384', 'rsa-pss-sha512', 'rsa-v1_5-sha256'],
		responses: {
			'200': { verified: true },
			'400': { verified: false, error: 'Human-readable verification error' },
		},
		humanInterface: baseUrl,
		llmsTxt: new URL('llms.txt', baseUrl).toString(),
		rfc: 'https://www.rfc-editor.org/rfc/rfc9421.html',
	};
}

export function createLlmsTxt(baseUrl: string): string {
	const llmsUrl = new URL('llms.txt', baseUrl).toString();
	return `# RFC 9421 Registered Message Verifier

> A testing and learning tool for HTTP Message Signatures. It verifies cryptographic validity using a caller-supplied public key; it does not establish identity and must not be used as production authentication.

## API

- Endpoint: ${baseUrl}
- Method: POST
- Required headers: Signature, Signature-Input, x-public-key-pem
- Required covered components: @method, @path
- Optional body: requires a signed Content-Digest header using sha-256 or sha-512
- Multiple signatures: set x-signature-label to the Signature-Input label to verify
- Success: HTTP 200 with {"verified":true,...}
- Failure: HTTP 400 with {"verified":false,"error":"...",...}

## Discovery

- Machine-readable API description: GET ${baseUrl} with Accept: application/json
- Interactive workbench: ${baseUrl}
- This document: ${llmsUrl}
- Specification: https://www.rfc-editor.org/rfc/rfc9421.html

## Constraints

- Demo and testing only
- Public keys are supplied by the caller as SPKI PUBLIC KEY PEM (private-key PEM is rejected)
- Supported algorithms: ed25519, ecdsa-p256-sha256, ecdsa-p384-sha384, rsa-pss-sha512, rsa-v1_5-sha256
`;
}
