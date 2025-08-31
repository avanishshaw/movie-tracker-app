// src/pages/HomePage.jsx
import { Link as RouterLink } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="relative text-center bg-gray-800 text-white py-20 px-4">
      <div className="relative z-10">
        <h1 className="text-5xl font-extrabold mb-4">
          Your Personal Movie & TV Show Tracker
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
          Keep a record of every movie and TV show you've watched. Add new entries, manage your list, and never forget a title again.
        </p>
        <div>
          {isAuthenticated ? (
            <RouterLink
              to="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
            >
              Go to Your Dashboard
            </RouterLink>
          ) : (
            <RouterLink
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
            >
              Get Started for Free
            </RouterLink>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;