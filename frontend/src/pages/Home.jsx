import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../contexts/authStore';
import { FiArrowRight, FiShield, FiTrendingUp, FiBarChart2, FiLock } from 'react-icons/fi';

const Home = () => {
  const { user, isAdmin } = useAuthStore((state) => ({
    user: state.user,
    isAdmin: state.isAdmin
  }));
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate(isAdmin ? '/admin/dashboard' : '/elections');
    }
  }, [user, isAdmin, navigate]);

  const features = [
    {
      icon: <FiShield size={32} />,
      title: 'Secure Voting',
      description: 'End-to-end encryption ensures your vote is secure and private'
    },
    {
      icon: <FiLock size={32} />,
      title: 'Authentication',
      description: 'Multi-factor authentication with OTP verification'
    },
    {
      icon: <FiTrendingUp size={32} />,
      title: 'Real-time Results',
      description: 'Live vote counting and instant results dashboard'
    },
    {
      icon: <FiBarChart2 size={32} />,
      title: 'Analytics',
      description: 'Detailed reports and statistics with PDF export'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Secure Digital Voting Platform
              </h1>
              <p className="text-lg text-blue-100 mb-8">
                Experience transparent, secure, and modern voting with our advanced e-voting system. 
                Your voice matters, and we ensure it's counted correctly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="flex items-center justify-center space-x-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  <span>Get Started</span>
                  <FiArrowRight />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center space-x-2 border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition"
                >
                  <span>Login to Vote</span>
                  <FiArrowRight />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-blue-400 bg-opacity-20 rounded-lg p-8 backdrop-blur">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-4">1000+</div>
                  <p className="text-blue-100 mb-6">Elections Conducted Successfully</p>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-white bg-opacity-10 rounded p-4">
                      <div className="text-3xl font-bold">50K+</div>
                      <p className="text-sm text-blue-100">Registered Voters</p>
                    </div>
                    <div className="bg-white bg-opacity-10 rounded p-4">
                      <div className="text-3xl font-bold">99.9%</div>
                      <p className="text-sm text-blue-100">Uptime</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Smart E-Voting?</h2>
            <p className="text-lg text-gray-600">Advanced features designed for secure and transparent elections</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">48K+</div>
              <p className="text-gray-600">Total Votes Cast</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
              <p className="text-gray-600">Active Elections</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">25K+</div>
              <p className="text-gray-600">Completed Elections</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <p className="text-gray-600">Secure Voting</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Vote?</h2>
          <p className="text-lg text-blue-100 mb-8">Join thousands of voters using our secure voting platform</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center justify-center space-x-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <span>Register Now</span>
              <FiArrowRight />
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center space-x-2 border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition"
            >
              <span>Sign In</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
