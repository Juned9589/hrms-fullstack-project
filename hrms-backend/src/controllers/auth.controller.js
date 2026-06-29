import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';

// Generate JWT access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role, tenantId: user.tenantId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Generate refresh token and store hash
const generateRefreshToken = async (user) => {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.refreshToken = hashed;
  await user.save();
  return rawToken;
};

// @desc    Login user & issue tokens
// @route   POST /api/auth/login
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, tenantId, role } = req.body;
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }
  // If tenantId is not provided, allow creation without a tenant (e.g., admin creates first user)
  const tenant = tenantId || null;
  // Check if user already exists with same email (ignore tenant if null)
  const existing = await User.findOne({ email, tenantId: tenant });
  if (existing) {
    throw new ApiError(409, 'User already exists');
  }
  const user = new User({ name, email, password, tenantId: tenant, role });
  await user.save();
  res.status(201).json({
    message: 'User registered successfully',
    user: { _id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password required');

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  // Set httpOnly cookies for both access and refresh tokens
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Also return the access token in body for client‑side store (optional)
  res.status(200).json({
    accessToken,
    user: {
      _id: user._id,
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
      employeeId: user.employeeId
    }
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public (requires valid refresh cookie)
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new ApiError(401, 'Refresh token missing');

  const hashed = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const user = await User.findOne({ refreshToken: hashed });
  if (!user) throw new ApiError(401, 'Invalid refresh token');

  const newAccess = generateAccessToken(user);
  res.status(200).json({ accessToken: newAccess });
});

// @desc    Logout user – clear refresh cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  // Invalidate stored refresh token and clear cookies
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save();
  }
  res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict' });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  res.status(200).json({ message: 'Logged out successfully' });
});

// Get current authenticated user info
export const me = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  const { _id, name, email, role, tenantId, employeeId } = req.user;
  res.status(200).json({ user: { _id, name, email, role, tenantId, employeeId } });
});
