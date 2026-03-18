import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowRight } from 'react-icons/fi';

const AdminElectionCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/election-categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data.categories);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleManageCategory = (categoryId) => {
    navigate(`/admin/elections/category/${categoryId}`);
  };

  // Category card data with icons and colors
  const categoryStyles = {
    1: { // National Elections
      gradient: 'from-indigo-600 to-purple-600',
      icon: '🏛️',
      bgLight: 'bg-indigo-50',
      bgDark: 'dark:bg-indigo-900/20',
      borderLight: 'border-indigo-200',
      borderDark: 'dark:border-indigo-800'
    },
    2: { // State Elections
      gradient: 'from-blue-600 to-cyan-600',
      icon: '🏢',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-900/20',
      borderLight: 'border-blue-200',
      borderDark: 'dark:border-blue-800'
    },
    3: { // Local Government
      gradient: 'from-green-600 to-teal-600',
      icon: '🏘️',
      bgLight: 'bg-green-50',
      bgDark: 'dark:bg-green-900/20',
      borderLight: 'border-green-200',
      borderDark: 'dark:border-green-800'
    },
    4: { // Institutional
      gradient: 'from-orange-600 to-red-600',
      icon: '🎓',
      bgLight: 'bg-orange-50',
      bgDark: 'dark:bg-orange-900/20',
      borderLight: 'border-orange-200',
      borderDark: 'dark:border-orange-800'
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Manage Elections
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Select election category to create and manage elections
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {categories.map((category, index) => {
            const style = categoryStyles[category.id] || categoryStyles[1];
            
            return (
              <div
                key={category.id}
                className="group relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 animate-scaleIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                
                {/* Card Content */}
                <div className="relative p-8">
                  {/* Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-6xl">{style.icon}</div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">{category.election_count || 0}</div>
                      <div className="text-sm text-gray-400">Elections</div>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {category.category_name}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-300 mb-6 min-h-[60px]">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span className="text-gray-400">{category.type_count || 0} Types</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-gray-400">{category.election_count || 0} Elections</span>
                    </div>
                  </div>

                  {/* Manage Button */}
                  <button
                    onClick={() => handleManageCategory(category.id)}
                    className={`w-full bg-gradient-to-r ${style.gradient} hover:opacity-90 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-4 shadow-lg`}
                  >
                    <span>Manage</span>
                    <FiArrowRight className="transition-transform duration-300" />
                  </button>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 text-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="inline-block bg-gray-800 rounded-xl px-6 py-4 shadow-lg">
            <p className="text-gray-300 text-sm">
              💡 Click <span className="font-semibold text-white">Manage</span> to view and create elections in each category
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminElectionCategories;
