//authMiddleware.js

import jwt from 'jsonwebtoken';
import User from '../models/User.js';


/*Without middleware:

Any user could access any API

No authentication

No role control

No security

Middleware acts like a security + rule-check layer */


/*You have two middlewares:

protect

authorize */


//protect Middleware – “Is the user logged in?”
//authorize Middleware – “Is the user allowed?”


/* ❓ What happens if middleware check fails?

👉 The request is STOPPED immediately.
👉 Controller is NOT executed.
👉 A response is sent back with an error status. */


/* “If middleware validation fails, it sends an error response immediately 
    and prevents the request from reaching the controller.”*/
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  //Bearer is just a type of authorization scheme.
  //Whoever BEARS (carries) this token is allowed
  //No username, no password — just the token.

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles) => { //👉 It allows you to pass any number of roles to the middleware.
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next(); 
    //...roles = Collect all arguments into an array called roles
    //authorize('admin', 'faculty') => roles = ['admin', 'faculty']
  };
};