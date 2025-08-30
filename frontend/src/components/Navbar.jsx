// src/components/Navbar.jsx
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <RouterLink to="/" className="text-white text-2xl font-bold">
              Movie Tracker
            </RouterLink>
          </div>
          <div className="flex items-baseline space-x-4">
            <RouterLink to="/login" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Login
            </RouterLink>
            <RouterLink to="/register" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
              Register
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;