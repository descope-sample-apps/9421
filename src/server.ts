import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { Writable } from 'node:stream';
import { handleRequest } from './index';

async function toRequest(request: IncomingMessage): Promise<Request> {
	const forwardedProtocol = request.headers['x-forwarded-proto'];
	const protocol = Array.isArray(forwardedProtocol) ? forwardedProtocol[0] : forwardedProtocol ?? 'http';
	const forwardedHost = request.headers['x-forwarded-host'];
	const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ?? request.headers.host ?? 'localhost';
	const method = request.method ?? 'GET';
	const headers = new Headers();

	for (let index = 0; index < request.rawHeaders.length; index += 2) {
		headers.append(request.rawHeaders[index], request.rawHeaders[index + 1]);
	}

	const chunks: Buffer[] = [];
	if (method !== 'GET' && method !== 'HEAD') {
		for await (const chunk of request) {
			chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
		}
	}
	const body = chunks.length === 0 ? undefined : Buffer.concat(chunks);

	return new Request(new URL(request.url ?? '/', `${protocol}://${host}`), {
		method,
		headers,
		body,
	});
}

async function sendResponse(response: Response, destination: ServerResponse): Promise<void> {
	destination.statusCode = response.status;
	for (const [name, value] of response.headers) {
		destination.setHeader(name, value);
	}

	if (response.body === null) {
		destination.end();
		return;
	}

	await response.body.pipeTo(Writable.toWeb(destination));
}

const server = createServer(async (request, response) => {
	try {
		await sendResponse(await handleRequest(await toRequest(request)), response);
	} catch (error) {
		console.error(error);
		if (!response.headersSent) {
			response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
			response.end(JSON.stringify({ error: 'Internal Server Error' }));
		} else {
			response.destroy();
		}
	}
});

server.listen(Number(process.env.PORT ?? 3000));
