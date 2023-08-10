import apiRouter from './router';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return apiRouter.handle(request, env, ctx);
	},
};
