import { Router } from 'itty-router';
import * as cheerio from 'cheerio';
import { capitalize } from 'lodash-es';
import { Feed } from 'feed';
// import puppeteer from '@cloudflare/puppeteer';
import pkg from '../package.json';
import parserPost from './post';

const router = Router();

const SUPORTED_TYPES = ['organic', 'newest', 'featured'];

router.get('/', () => new Response(`Indie Hackers RSS!`));

router.get('/:type', async ({ params }, env) => {
	if (!SUPORTED_TYPES.includes(params.type)) {
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

	posts.map((post) => {
		feed.addItem({
			title: post.title,
			link: post.link,
			description: post.description,
			author: [post.author],
			category: [{ name: post.group }],
			date: post.date,
			published: post.date,
		});
	});

	return new Response(feed.rss2(), {
		status: 200,
		headers: { 'Content-Type': `application/xml` },
	});
});

// router.get('/group/:name', async ({ params }, env) => {
// 	const browser = await puppeteer.launch(env.MYBROWSER);
// 	const page = await browser.newPage();
// 	await page.goto(env.BASE_URL! + `/groups/${params.name}`);
// 	const img = await page.screenshot();
// 	await browser.close();
// 	return new Response(img, {
// 		headers: {
// 			'content-type': 'image/jpeg',
// 		},
// 	});
// });

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
