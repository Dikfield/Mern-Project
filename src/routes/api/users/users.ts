import * as express from 'express';
import { check, validationResult } from 'express-validator';
import gravatar from 'gravatar';
import bcrypt from 'bcryptjs';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';
import { config } from '../../../config/config';

const router = express.Router();

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Include email').isEmail(),
    check('password', 'password musthave min 6 length').isLength({ min: 6 }),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.JWT_SECRET!,
        { expiresIn: 36000 },
        (err: any, token: any) => {
          if (err) throw err;
          res.json({ token });
        },
      );
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  },
);

export default router;
