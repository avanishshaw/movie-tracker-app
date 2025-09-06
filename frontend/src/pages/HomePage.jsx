// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const HomePage = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Track Your
              <span className="gradient-text block">Cinema Journey</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover, organize, and share your favorite movies and TV shows. 
              Join thousands of cinema enthusiasts in building the ultimate media collection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-base bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 px-6 rounded-xl py-3 text-lg"
                >
                  🎬 Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-base bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 px-8 py-3 text-lg"
                  >
                    🚀 Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="btn-base border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/50 backdrop-blur-sm border-t border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything you need to track cinema
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful features designed for movie and TV show enthusiasts
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="card p-6 text-center animate-slide-up">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Organize Your Collection</h3>
                <p className="text-gray-600">
                  Keep track of all your favorite movies and TV shows in one beautiful, organized place.
                </p>
              </div>

              <div className="card p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Discovery</h3>
                <p className="text-gray-600">
                  Find new content with advanced filtering and search capabilities across your collection.
                </p>
              </div>

              <div className="card p-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Driven</h3>
                <p className="text-gray-600">
                  Share your collection with friends and discover what others are watching.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;