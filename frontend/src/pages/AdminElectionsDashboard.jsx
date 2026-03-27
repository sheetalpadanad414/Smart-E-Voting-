import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  FiSearch, FiFilter, FiPlus, FiChevronRight,
  FiHome, FiUsers, FiMapPin, FiBookOpen, FiBriefcase, FiGlobe
} from 'react-icons/fi';

const ELECTION_CATEGORIES = [
  {
    id: 'national',
    name: 'National Elections',
    icon: FiGlobe,
    color: 'blue',
    categories: [
      {
        type: 'Lok Sabha',
        title: 'Lok Sabha',
        description: 'Lower house of Parliament',
        details: ['Direct elections by citizens', 'Elections held every 5 years'],
        icon: FiHome,
        color: 'blue'
      },
      {
        type: 'Rajya Sabha',
        title: 'Rajya Sabha',
        description: 'Upper house of Parliament',
        details: ['Members elected by state legislatures', 'Reviews laws passed by Lok Sabha'],
        icon: FiUsers,
        color: 'indigo'
      }
    ]
  },
  {
    id: 'state',
    name: 'State Elections',
    icon: FiMapPin,
    color: 'purple',
    categories: [
      {
        type: 'Vidhan Sabha',
        title: 'Vidhan Sabha',
        description: 'Directly elected legislative body of the state',
        details: ['Responsible for law-making and governance', 'Elections held every 5 years'],
        icon: FiHome,
        color: 'purple'
      },
      {
        type: 'Vidhan Parishad',
        title: 'Vidhan Parishad',
        description: 'Upper house (not in all states)',
        details: ['Members elected by state legislatures', 'Reviews laws passed by Vidhan Sabha'],
        icon: FiUsers,
        color: 'violet'
      }
    ]
  },
  {
    id: 'local',
    name: 'Local Government Elections',
    icon: FiMapPin,
    color: 'green',
    categories: [
      {
        type: 'Gram Panchayat',
        title: 'Gram Panchayat',
        description: 'Governs rural villages',
        details: ['Direct elections by villagers', 'Manages local development'],
        icon: FiHome,
        color: 'green'
      },
      {
        type: 'Municipal Council',
        title: 'Municipality',
        description: 'Manages cities/towns',
        details: ['Responsible for urban services', 'Elected by city residents'],
        icon: FiMapPin,
        color: 'blue'
      },
      {
        type: 'Zilla Panchayat',
        title: 'Zilla Parishad',
        description: 'District-level governance',
        details: ['Coordinates development programs', 'Oversees block panchayats'],
        icon: FiGlobe,
        color: 'orange'
      }
    ]
  },
  {
    id: 'institutional',
    name: 'Institutional Elections',
    icon: FiBookOpen,
    color: 'teal',
    categories: [
      {
        type: 'College',
        title: 'College Election',
        description: 'Student council elections',
        details: ['Conducted within educational institutions', 'Student representation'],
        icon: FiBookOpen,
        color: 'teal'
      },
      {
        type: 'University',
        title: 'University Election',
        description: 'University-level governance',
        details: ['Student union elections', 'Academic representation'],
        icon: FiBookOpen,
        color: 'cyan'
      },
      {
        type: 'Company Board',
        title: 'Company Board Election',
        description: 'Corporate governance process',
        details: ['Elect board members', 'Shareholder voting'],
        icon: FiBriefcase,
        color: 'gray'
      },
      {
        type: 'Society',
        title: 'Society Election',
        description: 'Housing or community elections',
        details: ['Local member voting system', 'Community governance'],
        icon: FiUsers,
        color: 'pink'
      }
    ]
  }
];

const COLOR_SCHEMES = {
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  violet: 'bg-violet-100 text-violet-700 border-violet-200',
  green: 'bg-green-100 text-green-700 border-green-200',
  orange: 'bg-orange-100 text-orange-700 border-orange-200',
  teal: 'bg-teal-100 text-teal-700 border-teal-200',
  cyan: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200'
};

const BUTTON_COLORS = {
  blue: 'bg-blue-500 hover:bg-blue-600',
  indigo: 'bg-indigo-500 hover:bg-indigo-600',
  purple: 'bg-purple-500 hover:bg-purple-600',
  violet: 'bg-violet-500 hover:bg-violet-600',
  green: 'bg-green-500 hover:bg-green-600',
  orange: 'bg-orange-500 hover:bg-orange-600',
  teal: 'bg-teal-500 hover:bg-teal-600',
  cyan: 'bg-cyan-500 hover:bg-cyan-600',
  gray: 'bg-gray-500 hover:bg-gray-600',
  pink: 'bg-pink-500 hover:bg-pink-600'
};

const AdminElectionsDashboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [electionCounts, setElectionCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElectionCounts();
  }, []);

  const fetchElectionCounts = async () => {
    try {
      const response = await adminAPI.getAllElections(1, 1000);
      const elections = response.data.elections || [];
      
      const counts = {};
      elections.forEach(el => {
        const type = el.election_type || 'Other';
        counts[type] = (counts[type] || 0) + 1;
      });
      
      setElectionCounts(counts);
    } catch (error) {
      console.error('Failed to fetch election counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManage = (type) => {
    navigate(`/admin/elections/all?type=${encodeURIComponent(type)}`);
  };

  const handleCreateElection = () => {
    navigate('/admin/elections/all');
  };

  const filteredCategories = ELECTION_CATEGORIES.filter(group => 
    selectedCategory === 'all' || group.id === selectedCategory
  );

  const searchFiltered = filteredCategories.map(group => ({
    ...group,
    categories: group.categories.filter(cat =>
      cat.title.toLowerCase().includes(search.toLowerCase()) ||
      cat.description.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(group => group.categories.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Election Management</h1>
            <p className="text-gray-500 mt-1">Manage all types of elections from one dashboard</p>
          </div>
          <button
            onClick={handleCreateElection}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
          >
            <FiPlus size={18} />
            Create Election
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search election types..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" size={18} />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Categories</option>
                {ELECTION_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Election Category Groups */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading elections...</p>
          </div>
        ) : searchFiltered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-400">No election types found matching your search</p>
          </div>
        ) : (
          <div className="space-y-8">
            {searchFiltered.map(group => (
              <div key={group.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-lg ${COLOR_SCHEMES[group.color]} flex items-center justify-center`}>
                    <group.icon size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.categories.map(category => {
                    const Icon = category.icon;
                    const count = electionCounts[category.type] || 0;
                    
                    return (
                      <div
                        key={category.type}
                        className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all hover:border-gray-300 bg-gradient-to-br from-white to-gray-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`w-12 h-12 rounded-xl ${COLOR_SCHEMES[category.color]} flex items-center justify-center border`}>
                            <Icon size={22} />
                          </div>
                          {count > 0 && (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${COLOR_SCHEMES[category.color]} border`}>
                              {count} Active
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{category.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{category.description}</p>

                        <ul className="space-y-1.5 mb-4">
                          {category.details.map((detail, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleManage(category.type)}
                          className={`w-full ${BUTTON_COLORS[category.color]} text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 text-sm shadow-sm`}
                        >
                          Manage
                          <FiChevronRight size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminElectionsDashboard;
