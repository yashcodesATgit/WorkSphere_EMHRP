import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Explicitly select password since it is excluded by default
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    // Use the same generic message for both "user not found" and "wrong password"
    // to avoid leaking whether an email is registered
    const invalidCredentialsMsg = 'Invalid email or password.';

    if (!user) {
      return res.status(401).json({ success: false, message: invalidCredentialsMsg });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: invalidCredentialsMsg });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Returns the currently authenticated user's profile
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
