// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a192f]">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col items-start space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Welcome to Movie Tracker
          </h1>
          
          <p className="text-xl text-gray-300 max-w-2xl">
            Track your favorite movies, create watchlists, and discover new films. Join our community of movie enthusiasts today.
          </p>
          
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Go to Your Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Get Started for Free
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-indigo-600 text-indigo-400 hover:bg-indigo-600 hover:text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;