import User from '../models/user.model.js';
import { generateToken } from '../utils/jwt.util.js';

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const registerUser = async (userData) => {
  const { name, email, password } = userData;
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }
  const user = await User.create({ name, email, password });
  const token = generateToken(user._id, user.role);
  const userResponse = { id: user._id, name: user.name, email: user.email, role: user.role };
  return { user: userResponse, token };
};

const loginUser = async (loginData) => {
    const user = await User.findOne({ email: loginData.email });
    if (!user || !(await user.comparePassword(loginData.password))) {
        throw new ApiError(401, 'Incorrect email or password');
    }
    const token = generateToken(user._id, user.role);
    const userResponse = { id: user._id, name: user.name, email: user.email, role: user.role };
    return { user: userResponse, token };
};

export { registerUser, loginUser };