import { registerUser, loginUser } from '../services/auth.service.js';
import { registerSchema, loginSchema } from '../utils/validators.js';

const register = async (req, res) => {
  try {
    const validatedBody = registerSchema.parse(req.body);
    const { user, token } = await registerUser(validatedBody);
    res.status(201).json({ success: true, message: 'User registered successfully', data: { user, token } });
  } catch (error) {
    if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const validatedBody = loginSchema.parse(req.body);
    const { user, token } = await loginUser(validatedBody);
    res.status(200).json({ success: true, message: 'Login successful', data: { user, token } });
  } catch (error) {
     if (error.name === 'ZodError') return res.status(400).json({ success: false, errors: error.errors });
     if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
     res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export { register, login };