import { Author } from 'feed';

interface IndieHackerPost {
	link: string;
	title: string;
	description: string;
	author: Author;
	date: Date;
	group: string;
}
