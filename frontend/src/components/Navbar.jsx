// src/components/Navbar.jsx
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-[#0a192f] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Left side - Logo */}
          <div className="mr-auto">
            <RouterLink 
              to="/" 
              className="text-white text-2xl font-bold tracking-[0.3em] hover:text-indigo-400 transition-colors duration-200"
            >
              MOVIE TRACKER
            </RouterLink>
          </div>
          
          {/* Right side - Navigation */}
          <div className="flex items-center space-x-6">
            <RouterLink 
              to="/login" 
              className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors duration-200"
            >
              Login
            </RouterLink>
            <RouterLink 
              to="/register" 
              className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors duration-200"
            >
              Register
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;