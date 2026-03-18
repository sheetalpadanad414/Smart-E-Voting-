import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
  {
    id: 'National',
    name: 'National Elections',
    description: 'Lok Sabha and Rajya Sabha elections.',
    icon: '🏛️',
    gradient: 'from-indigo-600 to-purple-600',
  },
  {
    id: 'State',
    name: 'State Elections',
    description: 'Vidhan Sabha and Vidhan Parishad elections.',
    icon: '🏢',
    gradient: 'from-blue-600 to-cyan-600',
  },
  {
    id: 'Local',
    name: 'Local Government Elections',
    description: 'Gram Panchayat, Zilla Panchayat, Taluk Panchayat, Municipal, Nagar Panchayat elections.',
    icon: '🏘️',
    gradient: 'from-green-600 to-teal-600',
  },
  {
    id: 'Institutional',
    name: 'Institutional Elections',
    description: 'College Student Election, University Election, Company Board Voting, Society / Apartment Association Election.',
    icon: '🎓',
    gradient: 'from-orange-600 to-red-600',
  },
];

const VoterElectionsEnhanced = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Elections</h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            Select a category to view and participate in elections
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {categories.map((cat, index) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/user/elections?category=${cat.id}`)}
              className="group relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-3xl"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12" />

              {/* Content */}
              <div className="relative p-8">
                <div className="text-6xl mb-6">{cat.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-3">{cat.name}</h2>
                <p className="text-gray-300 text-sm leading-relaxed">{cat.description}</p>

                {/* Arrow indicator */}
                <div className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${cat.gradient} bg-clip-text text-transparent group-hover:gap-4 transition-all duration-300`}>
                  View Elections
                  <span className="text-white opacity-70 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-gray-800 rounded-xl px-6 py-4 shadow-lg">
            <p className="text-gray-300 text-sm">
              💡 Click any card to view elections in that category
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VoterElectionsEnhanced;
