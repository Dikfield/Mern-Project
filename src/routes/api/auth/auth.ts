import jwt from 'jsonwebtoken';
import * as express from 'express';
import User from './../../../models/User';
import { check, validationResult } from 'express-validator';
import { config } from './../../../config/config';
import * as bcrypt from 'bcryptjs';
import auth from './../../../middleware/auth';

const router = express.Router();

router.get('/', auth, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.user.id).select('-password');
    res.send(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post(
  '/',
  [
    check('email', 'Include email').isEmail(),
    check('password', 'password is required').exists(),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

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
