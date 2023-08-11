import { IndieHackerPost } from './type';

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
