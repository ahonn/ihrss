import * as cheerio from 'cheerio';

export async function parserPost(link: string): Promise<IndieHackerPost> {
	const res = await fetch(link);
	const html = await res.text();
	const $ = cheerio.load(html);
	const $title = $('.post-page__title');
	const $description = $('.post-page__body.content');
	const $author = $('.post-page__inline-author .user-link__link');
	const $date = $('.post-page__date span');
	const $group = $('.post-page__group-name');

	const title = $title.text().trim();
	const author = {
		name: $author.text().trim(),
		link: `${$author.attr('href')}`,
	};
	const description = $description.html()?.trim() ?? '';
	const date = new Date($date.text().trim());
	const group = $group.text().trim().toLowerCase();

	return {
		link,
		title,
		description,
		author,
		date,
		group,
	};
}

export function getFeedItemFromPost(post: IndieHackerPost) {
	return {
		title: post.title,
		link: post.link,
		description: post.description,
		author: [post.author],
		category: [{ name: post.group }],
		date: post.date,
		published: post.date,
	};
}
