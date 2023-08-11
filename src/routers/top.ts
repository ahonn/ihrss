import { IRequest } from 'itty-router';
import * as cheerio from 'cheerio';
import { capitalize } from 'lodash-es';
import puppeteer from '@cloudflare/puppeteer';
import { Feed } from 'feed';
import pkg from '../../package.json';
import { getFeedItemFromPost, parserPost } from '../utils';
import format from 'date-fns/format';
import previousMonday from 'date-fns/previousMonday';

export default async function topRouter({ params }: IRequest, env: Env) {
	if (!['today', 'week', 'month', 'all-time'].includes(params.type)) {
		return new Response(`Not found`, { status: 404 });
	}

	const browser = await puppeteer.launch(env.MY_BROWSER);

	const posts: IndieHackerPost[] = [];
	const getTopPosts = async (slug: string) => {
		const page = await browser.newPage();
		await page.setViewport({ width: 1280, height: 800 });
		await page.goto(env.BASE_URL! + `/top/${slug}`);
		console.log(env.BASE_URL! + `/top/${slug}`);
		await page.waitForSelector('.community__posts-section');

		const html = await page.content();
		await page.close();

		const $ = cheerio.load(html);
		const $section = $('.posts-section__posts');
		const $links = $section.find('a.feed-item__title-link');

		const urls = Array.from($links).map((el) => $(el).attr('href'));
		const items = await Promise.all(urls.map((url) => parserPost(env.BASE_URL + url!)));
		return items;
	};

	switch (params.type) {
		case 'today': {
			const res = await fetch(env.BASE_URL!);
			const html = await res.text();
			const $ = cheerio.load(html);
			const $homepage = $(`.homepage`);
			const $links = $homepage.find('a.story__text-link');
			const urls = Array.from($links).map((el) => $(el).attr('href'));
			const items = await Promise.all(urls.map((url) => parserPost(env.BASE_URL + url!)));
			posts.push(...items);
			break;
		}
		case 'week': {
			const slug = 'week-of-' + format(previousMonday(new Date()), 'yyyy-MM-dd');
			const items = await getTopPosts(slug);
			posts.push(...items);
			break;
		}
		case 'month': {
			const slug = 'month-of-' + format(new Date(), 'yyyy-MM');
			const items = await getTopPosts(slug);
			posts.push(...items);
			break;
		}
		case 'all-time': {
			const items = await getTopPosts('all-time');
			posts.push(...items);
			break;
		}
		default:
	}
	await browser.close();

	const feed = new Feed({
		title: `${env.RSS_TITLE}: ${params.type
			.split('-')
			.map((t) => capitalize(t))
			.join(' ')}`,
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
