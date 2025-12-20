import { verify, Algorithm, Parameters } from 'http-message-sig';
import { createPublicKey, verify as cryptoVerify } from 'node:crypto';

const algorithmMap: Record<Algorithm, string | null> = {
	ed25519: null,
	'hmac-sha256': 'sha256',
	'rsa-pss-sha512': 'sha512',
	'rsa-v1_5-sha256': 'sha256',
	'ecdsa-p384-sha384': 'sha384',
	'ecdsa-p256-sha256': 'sha256',
};

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const pemKey = request.headers.get('x-public-key-pem');

		if (!pemKey) {
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
			await verify(request, async (data: string, signature: Uint8Array, params: Parameters) => {
				let publicKey;
				try {
					// Normalize PEM format - ensure proper line breaks
					const normalizedPem = pemKey.includes('\n')
						? pemKey
						: pemKey
								.replace(/-----BEGIN PUBLIC KEY-----\s*/, '-----BEGIN PUBLIC KEY-----\n')
								.replace(/\s*-----END PUBLIC KEY-----/, '\n-----END PUBLIC KEY-----')
								.replace(/(.{64})/g, '$1\n');

					publicKey = createPublicKey(normalizedPem);
				} catch (err) {
					throw new Error(`Failed to parse public key: ${err instanceof Error ? err.message : String(err)}`);
				}

				// Get hash algorithm from the signature-input header's alg parameter
				if (!params.alg || !(params.alg in algorithmMap)) {
					throw new Error(`Unsupported or missing algorithm: ${params.alg}`);
				}

				const hashAlgorithm = algorithmMap[params.alg as Algorithm];

				const isValid = cryptoVerify(hashAlgorithm, Buffer.from(data), publicKey, signature);

				if (!isValid) {
					throw new Error('Invalid signature');
				}
			});

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
