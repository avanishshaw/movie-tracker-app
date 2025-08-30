import jwt from 'jsonwebtoken';

const generateToken = (userId, role) => {
  const payload = { 
    id: userId,
    role: role 
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export { generateToken };