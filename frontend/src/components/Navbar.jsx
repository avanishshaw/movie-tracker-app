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
    <nav className="bg-gray-800 shadow-md sticky top-0 z-50  display flex justify-between items-center px-6 h-16">
      {/* This single div is now the flex container, pushing its children to the edges */}
        
        {/* Child 1: Brand */}
        <div className="flex-shrink-0">
          <RouterLink to="/" className="text-white text-2xl font-bold">
            Movie Tracker
          </RouterLink>
        </div>

        {/* Child 2: Links */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-300">Welcome, {user?.name}!</span>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <RouterLink to="/login" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Login
              </RouterLink>
              <RouterLink to="/register" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Register
              </RouterLink>
            </>
          )}
      </div>
    </nav>
  );
};

export default Navbar;