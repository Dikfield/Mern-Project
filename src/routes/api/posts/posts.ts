import * as express from 'express';
import auth from './../../../middleware/auth';
import { check, validationResult } from 'express-validator';
import User from './../../../models/User';
import Post from './../../../models//Post';

const router = express.Router();

router.post(
  '/comment/:id',
  auth,
  [check('text', 'Text is required').not().isEmpty()],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      if (!user || !post) {
        return res.status(404).send('User or Post not found');
      }

      const newComment: any = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

router.get('/', auth, async (req: any, res: any) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    res.json(posts);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', auth, async (req: any, res: any) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (err: any) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, async (req: any, res: any) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send('Post not found');
    }

    if (post.user?.toString() !== req.user.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.deleteOne();

    res.json({ msg: 'Post removed' });
  } catch (err: any) {
    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.status(500).send('Server Error');
  }
});

router.put('/like/:id', auth, async (req: any, res: any) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send('Post not found');
    }

    if (
      post.likes.filter(
        (like: any) => like.user.toString() === req.user.user.id,
      ).length > 0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/unlike/:id', auth, async (req: any, res: any) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).send('Post not found');
    }

    if (
      post.likes.filter(
        (like: any) => like.user.toString() === req.user.user.id,
      ).length === 0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    post.likes = post.likes.filter(
      ({ user }: any) => user.toString() !== req.user.user.id,
    );

    await post.save();

    res.json(post.likes);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post(
  '/',
  auth,
  [check('text', 'Text is required').not().isEmpty()],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.user.id).select('-password');

      if (!user) {
        return res.status(404).send('User not found');
      }
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.user.id,
      });

      const post = newPost.save();

      res.json(post);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

router.delete('/comment/:id/:comment_id', auth, async (req: any, res: any) => {
  try {
    const post = await Post.findById(req.params.id);

    const comment = post?.comments.find(
      (comment: any) => comment.id == req.params.comment_id,
    );

    if (!comment || !post) {
      return res.status(404).json({ msg: 'Comment does not exists' });
    }

    if (comment.user?.toString() !== req.user.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    post.comments = post.comments.filter(
      ({ id }: any) => id.toString() !== req.params.comment_id,
    );

    await post.save();

    res.send(post.comments);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;
