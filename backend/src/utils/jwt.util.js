import jwt from 'jsonwebtoken';

const generateToken = (userId, role, expiresIn = '1d') => {
  const payload = { 
    id: userId,
    role: role 
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};

export { generateToken };