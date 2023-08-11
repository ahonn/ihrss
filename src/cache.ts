import { IRequest, RouteHandler } from 'itty-router';

const withCache = (handler: RouteHandler, expiration?: number): RouteHandler => {
	return async (request: IRequest, env: Env) => {
		const cache = await env.MY_KV_NAMESPACE.get(request.url, { type: 'text' });
		if (cache) {
			return new Response(cache, {
				status: 200,
				headers: { 'Content-Type': `application/xml` },
			});
		}

		const response: Response = await handler(request, env);
		if (response.status === 200) {
			const body = await response.text();
			if (body.includes('<item>')) {
				env.MY_KV_NAMESPACE.put(request.url, body, { expirationTtl: expiration });
			}

			return new Response(body, {
				status: 200,
				headers: { 'Content-Type': `application/xml` },
			});
		}
		return response;
	};
};

export default withCache;
