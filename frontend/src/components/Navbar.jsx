// src/components/Navbar.jsx
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex-shrink-0">
            <RouterLink 
              to="/" 
              className="text-2xl font-bold gradient-text hover:scale-105 transition-transform duration-200"
            >
              🎬 Cinetrack
            </RouterLink>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <RouterLink
                  to="/dashboard"
                  className="btn-base text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  Dashboard
                </RouterLink>
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {user?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-base text-gray-600 hover:text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <RouterLink
                  to="/login"
                  className="btn-base text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  Sign In
                </RouterLink>
                <RouterLink
                  to="/register"
                  className="btn-base bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                >
                  Get Started
                </RouterLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;