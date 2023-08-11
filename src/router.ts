import { Router } from 'itty-router';
import storiesRouter from './routers/stories';
import groupRouter from './routers/group';
import topRouter from './routers/top';

const router = Router();

router.get('/', () => new Response(`Indie Hackers RSS!`));
router.get('/:type', storiesRouter);
router.get('/group/:name', groupRouter);
router.get('/top/:type', topRouter);

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
