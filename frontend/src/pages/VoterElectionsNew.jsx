import React, { useState } from 'react';
import { FiVote, FiSearch, FiChevronRight, FiCalendar, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const VoterElectionsNew = () => {
  const [elections] = useState([
    {
      id: 1,
      title: 'Class President Election 2024',
      description: 'Vote for the next class president to lead and represent the class.',
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      status: 'active',
      candidates: 4,
      voters: 245,
      progress: 73,
      image: '🏛️'
    },
    {
      id: 2,
      title: 'Student Council Elections',
      description: 'Annual student council elections for various positions.',
      startDate: '2024-01-20',
      endDate: '2024-01-25',
      status: 'completed',
      candidates: 6,
      voters: 523,
      progress: 100,
      image: '👥'
    },
    {
      id: 3,
      title: 'Sports Committee Head',
      description: 'Select the new sports committee coordinator.',
      startDate: '2024-03-01',
      endDate: '2024-03-10',
      status: 'upcoming',
      candidates: 3,
      voters: 0,
      progress: 0,
      image: '⚽'
    },
    {
      id: 4,
      title: 'Cultural Fest Coordinator',
      description: 'Vote for the cultural fest coordinator for 2024.',
      startDate: '2024-02-10',
      endDate: '2024-02-12',
      status: 'completed',
      candidates: 3,
      voters: 156,
      progress: 100,
      image: '🎭'
    },
    {
      id: 5,
      title: 'Debate Club President',
      description: 'Choose the leader for the debate club.',
      startDate: '2024-02-22',
      endDate: '2024-02-28',
      status: 'active',
      candidates: 2,
      voters: 89,
      progress: 45,
      image: '🎤'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredElections = elections.filter(election =>
    (election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     election.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || election.status === filterStatus)
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Upcoming Elections</h1>
        <p className="text-gray-600">Browse and participate in elections</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <FiSearch className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search elections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
          >
            <option value="all">All Elections</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>

      {/* Elections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredElections.map((election) => (
          <Link key={election.id} to={`/elections/${election.id}`} className="group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden h-full transform hover:-translate-y-1">
              {/* Card Header with Image */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 flex items-center justify-center h-32">
                <span className="text-5xl">{election.image}</span>
              </div>

              {/* Card Content */}
              <div className="p-6">
                {/* Status Badge */}
                <div className="mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(election.status)}`}>
                    {getStatusText(election.status)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  {election.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {election.description}
                </p>

                {/* Info Row */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FiUsers size={16} />
                    <span>{election.candidates} Candidates</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FiVote size={16} />
                    <span>{election.voters} Votes</span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
                  <FiCalendar size={14} />
                  <span>{election.startDate} to {election.endDate}</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Voter Turnout</span>
                    <span className="text-xs font-semibold text-gray-900">{election.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-700 h-2 rounded-full transition-all"
                      style={{ width: `${election.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-semibold">
                  <span>View Election</span>
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredElections.length === 0 && (
        <div className="text-center py-12">
          <FiVote size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No elections found</p>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default VoterElectionsNew;
