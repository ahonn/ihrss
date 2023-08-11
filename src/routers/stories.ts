import { IRequest } from 'itty-router';
import * as cheerio from 'cheerio';
import { capitalize } from 'lodash-es';
import { Feed } from 'feed';
import pkg from '../../package.json';
import { getFeedItemFromPost, parserPost } from '../utils';

export default async function storiesRouter({ params }: IRequest, env: Env) {
	if (!['organic', 'newest', 'featured'].includes(params.type)) {
		return new Response(`Not found`, { status: 404 });
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

	return new Response(feed.rss2(), {
		status: 200,
		headers: { 'Content-Type': `application/xml` },
	});
}
