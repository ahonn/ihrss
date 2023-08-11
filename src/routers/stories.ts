import { IRequest } from 'itty-router';
import * as cheerio from 'cheerio';
import { capitalize } from 'lodash-es';
import { Feed } from 'feed';
import pkg from '../../package.json';
import parserPost from '../post';
import { getFeedItemFromPost } from '../utils';

export default async function storiesRouter({ params }: IRequest, env: Env) {
	if (!['organic', 'newest', 'featured'].includes(params.type)) {
		return new Response(`Not found`, { status: 404 });
	}

	const key = `stories:${params.type}`;
	const cache = await env.MY_KV_NAMESPACE.get(key, { type: 'text' });
	if (cache) {
		return new Response(cache, {
			status: 200,
			headers: { 'Content-Type': `application/xml` },
		});
	}

	const res = await fetch(env.BASE_URL!);
	const html = await res.text();
	const $ = cheerio.load(html);
	const $organic = $(`.${params.type}`);
	const $links = $organic.find('a.story__text-link');

	const urls = Array.from($links).map((el) => $(el).attr('href'));
	const posts = await Promise.all(urls.map((url) => parserPost(env.BASE_URL + url!)));

	const feed = new Feed({
		title: `${env.RSS_TITLE}: ${capitalize(params.type)}`,
		description: env.RSS_DESCRIPTION,
		id: env.BASE_URL!,
		link: env.BASE_URL!,
		copyright: ``,
		generator: `${pkg.name} ${pkg.version}`,
		feedLinks: {
			rss2: `${env.RSS_URL}/rss.xml`,
		},
	});
	posts.map((post) => feed.addItem(getFeedItemFromPost(post)));

	if (feed.items.length !== 0) {
		await env.MY_KV_NAMESPACE.put(key, feed.rss2(), { expirationTtl: 60 * 5 });
	}

	return new Response(feed.rss2(), {
		status: 200,
		headers: { 'Content-Type': `application/xml` },
	});
}
