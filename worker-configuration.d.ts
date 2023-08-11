interface Env {
	BASE_URL?: string;
	RSS_TITLE?: string;
	RSS_DESCRIPTION?: string;
	RSS_URL?: string;
	MY_KV_NAMESPACE: KVNamespace;
	MY_BROWSER: puppeteer.BrowserWorker;
}

interface IndieHackerPost {
	link: string;
	title: string;
	description: string;
	author: Author;
	date: Date;
	group: string;
}
