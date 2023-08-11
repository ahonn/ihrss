import { IRequest } from 'itty-router';
import * as cheerio from 'cheerio';
import puppeteer from '@cloudflare/puppeteer';
import { Feed } from 'feed';
import pkg from '../../package.json';
import parserPost from '../post';
import { getFeedItemFromPost } from '../utils';

export default async function groupRouter({ params }: IRequest, env: Env) {
	const key = `group:${params.name}`;
	const cache = await env.MY_KV_NAMESPACE.get(key, { type: 'text' });
	if (cache) {
		return new Response(cache, {
			status: 200,
			headers: { 'Content-Type': `application/xml` },
		});
	}

	const browser = await puppeteer.launch(env.MY_BROWSER);
	const page = await browser.newPage();
	await page.setViewport({ width: 1280, height: 800 });

	await page.goto(env.BASE_URL! + `/group/${params.name}`);
	await page.waitForSelector('.group');

	const html = await page.content();
	await browser.close();

	const $ = cheerio.load(html);
	const $group = $('.group__content');
	const $name = $group.find('.group__name');
	const $description = $group.find('.group__description');
	const $links = $group.find('a.feed-item__title-link');

	const urls = Array.from($links).map((el) => $(el).attr('href'));
	const posts = await Promise.all(urls.map((url) => parserPost(env.BASE_URL + url!)));

	const feed = new Feed({
		title: `${env.RSS_TITLE}: ${$name.text().trim()}`,
		description: $description.text().trim(),
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
