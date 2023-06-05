import * as express from 'express';
import authRouter from './auth/auth';
import usersRouter from './users/users';
import postsRouter from './posts/posts';
import profileRouter from './profile/profile';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/profile', profileRouter);
router.use('/posts', postsRouter);

export = router;
