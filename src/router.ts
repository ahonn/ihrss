import { Router } from 'itty-router';
import storiesRouter from './routers/stories';
import groupRouter from './routers/group';
import topRouter from './routers/top';
import withCache from './cache';

const router = Router();

router.get('/', () => Response.redirect('https://github.com/ahonn/ihrss', 301));
router.get('/:type', withCache(storiesRouter, 60 * 10));
router.get('/group/:name', withCache(groupRouter, 60 * 10));
router.get('/top/:type', withCache(topRouter, 60 * 10));

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
