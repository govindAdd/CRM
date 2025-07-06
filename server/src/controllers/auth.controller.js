import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/ApiResponse.js';

export const googleCallback = (req, res) => {
  const accessToken = jwt.sign(
    { _id: req.user._id, role: req.user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '180m' }
  );

  const refreshToken = jwt.sign(
    { _id: req.user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 1000 * 60 * 60 * 3,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  res.redirect(`${process.env.CORS_ORIGIN}/dashboard`);
};

export const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  req.logout(() => {
    res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
  });
};
