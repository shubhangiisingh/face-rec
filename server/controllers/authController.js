const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const faceService = require('../services/faceService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user & face
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, images } = req.body;

  if (!name || !email || !password || !images || images.length === 0) {
    return res.status(400).json({ message: 'Please add all fields and capture face images' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      // Register face in Python service and get the embedding vector back
      try {
        const result = await faceService.registerFace(images);
        
        // Update user to indicate face is registered and store embedding
        user.faceEmbedding = result.embedding;
        user.hasFaceRegistered = true;
        await user.save();
        
        res.status(201).json({
          _id: user.id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
          message: 'User and face registered successfully'
        });
      } catch (faceError) {
        // Rollback user creation if face registration fails
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: `Face registration failed: ${faceError.message}` });
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login Phase 1: Verify Password
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Password is correct, require face verification
      res.json({
        status: 'MFA_REQUIRED',
        userId: user._id,
        message: 'Password correct. Proceed to face verification.'
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login Phase 2: Verify Face
// @route   POST /api/auth/verify-face
// @access  Public
const verifyFaceLogin = async (req, res) => {
  const { userId, image } = req.body;

  if (!userId || !image) {
    return res.status(400).json({ message: 'Missing user ID or face image' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.faceEmbedding || user.faceEmbedding.length === 0) {
      return res.status(400).json({ message: 'No face biometric registered for this user' });
    }

    // Call Python microservice to verify face
    const result = await faceService.verifyFace(user.faceEmbedding, image);

    if (result.match) {
      // Face matched successfully, issue JWT token
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ message: 'Face verification failed' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyFaceLogin,
  getMe,
};
