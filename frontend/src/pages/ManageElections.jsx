import React from 'react';
import { useNavigate } from 'react-router-dom';

const ELECTION_CATEGORIES = [
  {
    id: 'national',
    title: 'National Elections',
    subtitle: 'Lok Sabha, Rajya Sabha elections',
    icon: '🏛️',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500/30',
    elections: [
      { name: 'Lok Sabha', type: 'Lok Sabha' },
      { name: 'Rajya Sabha', type: 'Rajya Sabha' }
    ]
  },
  {
    id: 'state',
    title: 'State Elections',
    subtitle: 'Vidhan Sabha / Vidhan Parishad',
    icon: '🏛️',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-900/20',
    borderColor: 'border-indigo-500/30',
    elections: [
      { name: 'Vidhan Sabha', type: 'Vidhan Sabha' },
      { name: 'Vidhan Parishad', type: 'Vidhan Parishad' }
    ]
  },
  {
    id: 'local',
    title: 'Local Government Elections',
    subtitle: 'Gram Panchayat, Taluk Panchayat, Zilla Panchayat, Municipal Council',
    icon: '🏘️',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-900/20',
    borderColor: 'border-green-500/30',
    elections: [
      { name: 'Gram Panchayat', type: 'Gram Panchayat' },
      { name: 'Taluk Panchayat', type: 'Taluk Panchayat' },
      { name: 'Zilla Panchayat', type: 'Zilla Panchayat' },
      { name: 'Municipal Corporation', type: 'Municipal Council' },
      { name: 'Municipal Council', type: 'Municipal Council' },
      { name: 'Nagar Panchayat', type: 'Nagar Panchayat' }
    ]
  },
  {
    id: 'institutional',
    title: 'Institutional Elections',
    subtitle: 'College, University, Company Board, Society Association',
    icon: '🏫',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-500/30',
    elections: [
      { name: 'College Election', type: 'College' },
      { name: 'University Election', type: 'University' },
      { name: 'Company Board Voting', type: 'Company Board' },
      { name: 'Society Election', type: 'Society' }
    ]
  }
];

const ManageElections = () => {
  const navigate = useNavigate();

  const handleManage = (categoryId) => {
    // Navigate to the category-specific management page
    navigate(`/admin/elections/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Manage Elections</h1>
          <p className="text-gray-400">Select election category to create and manage elections</p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ELECTION_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className={`${category.bgColor} ${category.borderColor} border rounded-xl overflow-hidden backdrop-blur-sm transition-all hover:scale-[1.02]`}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                      {category.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">{category.title}</h2>
                      <p className="text-sm text-gray-400">{category.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleManage(category.id)}
                    className={`bg-gradient-to-r ${category.color} text-white px-6 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all`}
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats Footer */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">4</div>
            <div className="text-xs text-gray-400">Categories</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">2</div>
            <div className="text-xs text-gray-400">National</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">6</div>
            <div className="text-xs text-gray-400">Local Govt</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">4</div>
            <div className="text-xs text-gray-400">Institutional</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageElections;
