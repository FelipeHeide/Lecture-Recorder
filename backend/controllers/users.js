const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const usersRouter = require('express').Router();

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

usersRouter.get('/',  async (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
})

usersRouter.get('/:id',  async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() !== decoded.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.status(200).json({token, user});
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
})

usersRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username })
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      res.status(200).json({ token, user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })

  usersRouter.put('/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
  
      if (user._id.toString() !== decoded.userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
  
  
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
  
  
      if (!updatedUser) {
        console.error('Error updating user:', err);
        return res.status(500).json({ message: 'Error updating user' });
      }
  
      res.status(200).json(updatedUser);
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(401).json({ message: 'Invalid token' });
    }
  });

usersRouter.post('/', async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already taken' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      name,
      username,
      email,
      passwordHash,
      lectures: []
    });

    const savedUser = await newUser.save();

    const token = jwt.sign({ userId: savedUser._id }, JWT_SECRET);

    const userWithoutPassword = {
      _id: savedUser._id,
      name: savedUser.name,
      username: savedUser.username,
      email: savedUser.email,
      lectures: savedUser.lectures,
      subjects: savedUser.subjects

    };

    res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


module.exports = usersRouter;