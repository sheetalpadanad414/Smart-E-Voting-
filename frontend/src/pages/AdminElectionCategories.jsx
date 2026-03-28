import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowRight, FiTrendingUp } from 'react-icons/fi';

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
      gradient: 'from-blue-500 via-blue-600 to-indigo-700',
      bgGradient: 'from-blue-500/10 via-blue-600/5 to-transparent',
      icon: '🏛️',
      accentColor: 'blue',
      glowColor: 'rgba(59, 130, 246, 0.5)'
    },
    2: { // State Elections
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      bgGradient: 'from-purple-500/10 via-purple-600/5 to-transparent',
      icon: '🏢',
      accentColor: 'purple',
      glowColor: 'rgba(168, 85, 247, 0.5)'
    },
    3: { // Local Government
      gradient: 'from-green-500 via-emerald-600 to-teal-600',
      bgGradient: 'from-green-500/10 via-emerald-600/5 to-transparent',
      icon: '🏘️',
      accentColor: 'green',
      glowColor: 'rgba(34, 197, 94, 0.5)'
    },
    4: { // Institutional
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      bgGradient: 'from-orange-500/10 via-red-500/5 to-transparent',
      icon: '🎓',
      accentColor: 'orange',
      glowColor: 'rgba(249, 115, 22, 0.5)'
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-500 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-blue-500/20 mx-auto blur-sm"></div>
          </div>
          <p className="text-gray-300 text-lg font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:py-16 sm:px-6 lg:py-20 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20 animate-fadeIn">
          <div className="inline-block mb-6">
            <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-500/30">
              <FiTrendingUp className="text-blue-400 text-xl" />
              <span className="text-blue-300 font-semibold text-sm uppercase tracking-wider">Election Management</span>
            </div>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Manage Elections
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Select an election category to create and manage elections with ease
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-20">
          {categories.map((category, index) => {
            const style = categoryStyles[category.id] || categoryStyles[1];
            
            return (
              <div
                key={category.id}
                className="group relative animate-scaleIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Glow Effect */}
                <div 
                  className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-3xl blur-xl transition-all duration-700"
                  style={{ 
                    backgroundImage: `linear-gradient(to right, ${style.glowColor}, transparent)` 
                  }}
                ></div>
                
                {/* Card */}
                <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-2 shadow-2xl hover:shadow-[0_20px_80px_rgba(0,0,0,0.5)] min-h-[420px]">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${style.bgGradient} opacity-50`}></div>
                  
                  {/* Card Content */}
                  <div className="relative p-10">
                    {/* Icon & Stats Header */}
                    <div className="flex items-start justify-between mb-10">
                      <div className="relative">
                        <div className="text-8xl transform group-hover:scale-110 transition-transform duration-500 filter drop-shadow-2xl">
                          {style.icon}
                        </div>
                        <div className={`absolute -inset-4 bg-gradient-to-r ${style.gradient} opacity-0 group-hover:opacity-20 rounded-full blur-2xl transition-opacity duration-500`}></div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${style.gradient} px-4 py-2 rounded-xl mb-3 shadow-lg`}>
                          <span className="text-3xl font-bold text-white">{category.election_count || 0}</span>
                        </div>
                        <div className="text-sm text-gray-400 font-medium">Active Elections</div>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-300"
                        style={{ backgroundImage: `linear-gradient(to right, white, white)` }}>
                      {category.category_name}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-400 mb-8 min-h-[72px] leading-relaxed text-base">
                      {category.description}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-6 mb-10">
                      <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50">
                        <div className={`w-2 h-2 rounded-full bg-${style.accentColor}-400 animate-pulse`}></div>
                        <span className="text-gray-300 text-sm font-medium">{category.type_count || 0} Types</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50">
                        <div className={`w-2 h-2 rounded-full bg-${style.accentColor}-400 animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
                        <span className="text-gray-300 text-sm font-medium">{category.election_count || 0} Elections</span>
                      </div>
                    </div>

                    {/* Manage Button */}
                    <button
                      onClick={() => handleManageCategory(category.id)}
                      className={`w-full bg-gradient-to-r ${style.gradient} hover:shadow-2xl text-white font-bold py-5 px-8 rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 group-hover:gap-5 shadow-xl relative overflow-hidden text-lg`}
                    >
                      <span className="relative z-10">Manage Elections</span>
                      <FiArrowRight className="text-2xl relative z-10 transition-transform duration-500 group-hover:translate-x-2" />
                      <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </button>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24 group-hover:scale-150 transition-transform duration-1000"></div>
                  
                  {/* Border Gradient */}
                  <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                       style={{ 
                         background: `linear-gradient(135deg, ${style.glowColor} 0%, transparent 50%, ${style.glowColor} 100%)`,
                         padding: '2px',
                         WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                         WebkitMaskComposite: 'xor',
                         maskComposite: 'exclude'
                       }}>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="text-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="inline-block bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl px-10 py-6 shadow-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-105">
            <p className="text-gray-300 text-lg leading-relaxed flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <span>Click <span className="font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Manage Elections</span> to view and create elections in each category</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminElectionCategories;
