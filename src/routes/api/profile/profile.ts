import * as express from 'express';
import auth from './../../../middleware/auth';
import Profile from './../../../models/Profile';
import User from './../../../models/User';
import Post from './../../../models/Post';
import { config } from './../../../config/config';
import { check, validationResult } from 'express-validator';
import axios from 'axios';

const router = express.Router();

router.get('/me', auth, async (req: any, res: any) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(profile);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.post(
  '/',
  [
    auth,
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skills is required').not().isEmpty(),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    const profileFields: any = {};

    profileFields.user = req.user.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills
        .split(',')
        .map((skill: any) => skill.trim());
    }

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile: any = await Profile.findOne({ user: req.user.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.user.id },
          { $set: profileFields },
          { new: true },
        );
        return res.json(profile);
      }

      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) res.status(400).json({ msg: 'Profile not found' });

    res.json(profile);
  } catch (err: any) {
    console.error(err);
    if (err.kind == 'ObjectId') {
      res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

router.delete('/', auth, async (req: any, res) => {
  try {
    await Post.deleteMany({ user: req.user.user.id });

    await Profile.findOneAndRemove({ user: req.user.user.id });

    await User.findOneAndRemove({ _id: req.user.user.id });

    res.json({ msg: 'removed' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put(
  '/education',
  auth,
  [
    check('school', 'school is required').not().isEmpty(),
    check('degree', 'degree is required').not().isEmpty(),
    check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
    check('from', 'from is required').not().isEmpty(),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.user.id });

      if (!profile) {
        return res.status(400).send({ msg: 'Profile not found' });
      }

      profile.education.unshift(newEdu);
      await profile.save();

      res.json(profile);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

router.delete('/education/:edu_id', auth, async (req: any, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.user.id });

    if (!profile) {
      return res.status(400).send({ msg: 'Profile not found' });
    }

    profile.education = profile.education.filter(
      (exp: any) => exp._id.toString() !== req.params.edu_id,
    );

    await profile.save();

    res.json(profile);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put(
  '/experience',
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('from', 'from is required').not().isEmpty(),
    check('company', 'company is required').not().isEmpty(),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.user.id });

      if (!profile) {
        return res.status(400).send({ msg: 'Profile not found' });
      }

      profile.experience.unshift(newExp);
      await profile.save();

      res.json(profile);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

router.delete('/experience/:exp_id', auth, async (req: any, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.user.id });

    if (!profile) {
      return res.status(400).send({ msg: 'Profile not found' });
    }

    profile.experience = profile.experience.filter(
      (exp: any) => exp._id.toString() !== req.params.exp_id,
    );

    await profile.save();

    res.json(profile);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/github/:username', async (req: any, res: any) => {
  try {
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`,
    );
    const headers = {
      'user-agent': 'node.js',
      Authorization: `token ${config.GITHUB_TOKEN}`,
    };

    const gitHubResponse = await axios.get(uri, { headers });
    return res.json(gitHubResponse.data);
  } catch (err: any) {
    console.error(err);
    return res.status(404).send('No Github profile found');
  }
});

export default router;
