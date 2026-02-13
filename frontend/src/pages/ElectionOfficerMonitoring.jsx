import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiRefreshCw, FiDownload, FiAlertTriangle } from 'react-icons/fi';

const ElectionOfficerMonitoring = () => {
  const { electionId } = useParams();
  const [autoRefresh, setAutoRefresh] = useState(true);

  const mockElection = {
    id: electionId || '1',
    title: 'Municipal Elections 2024',
    status: 'active',
    startTime: '08:00 AM',
    endTime: '06:00 PM',
    votesReceived: 8234,
    totalEligibleVoters: 12000,
    voterTurnout: 68.6
  };

  const mockCandidates = [
    { id: 1, name: 'Candidate A', party: 'Party XYZ', votes: 3200, percentage: 38.8 },
    { id: 2, name: 'Candidate B', party: 'Party ABC', votes: 2800, percentage: 34.0 },
    { id: 3, name: 'Candidate C', party: 'Party DEF', votes: 1500, percentage: 18.2 },
    { id: 4, name: 'Candidate D', party: 'Party GHI', votes: 734, percentage: 8.9 }
  ];

  const mockAlerts = [
    {
      id: 1,
      type: 'SUSPICIOUS_TIMING',
      severity: 'medium',
      message: '3 votes detected within 5-minute window',
      time: '02:15 PM'
    },
    {
      id: 2,
      type: 'HIGH_TURNOUT',
      severity: 'info',
      message: 'Voter turnout exceeded 65% threshold',
      time: '01:30 PM'
    }
  ];

  const mockHourlyData = [
    { hour: '8-9 AM', votes: 145 },
    { hour: '9-10 AM', votes: 256 },
    { hour: '10-11 AM', votes: 342 },
    { hour: '11-12 PM', votes: 401 },
    { hour: '12-1 PM', votes: 389 },
    { hour: '1-2 PM', votes: 456 },
    { hour: '2-3 PM', votes: 521 },
    { hour: '3-4 PM', votes: 478 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{mockElection.title}</h1>
            <p className="text-gray-600">Live monitoring - Status: <span className="font-semibold text-green-600">Active</span></p>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <FiRefreshCw size={18} />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              <FiDownload size={18} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Votes Received</p>
            <p className="text-2xl font-bold text-gray-800">{mockElection.votesReceived.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Eligible Voters</p>
            <p className="text-2xl font-bold text-gray-800">{mockElection.totalEligibleVoters.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Voter Turnout</p>
            <p className="text-2xl font-bold text-green-600">{mockElection.voterTurnout}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Voting Hours</p>
            <p className="text-2xl font-bold text-gray-800">{mockElection.startTime} - {mockElection.endTime}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Vote Count */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Live Vote Distribution</h2>
              <div className="space-y-4">
                {mockCandidates.map((candidate) => (
                  <div key={candidate.id}>
                    <div className="flex justify-between mb-1">
                      <div>
                        <p className="font-semibold text-gray-800">{candidate.name}</p>
                        <p className="text-sm text-gray-500">{candidate.party}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">{candidate.votes.toLocaleString()} votes</p>
                        <p className="text-sm text-gray-600">{candidate.percentage}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${candidate.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Voting Trend */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Hourly Voting Trend</h2>
              <div className="flex items-end justify-around h-64 border-l-2 border-b-2 border-gray-300 p-4">
                {mockHourlyData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-400 cursor-pointer"
                      style={{ 
                        width: '30px',
                        height: `${(item.votes / 521) * 100}%`,
                        minHeight: '4px'
                      }}
                      title={`${item.votes} votes`}
                    ></div>
                    <p className="text-xs text-gray-600 mt-2 w-12 text-center">{item.hour}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-4">System Alerts</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mockAlerts.length > 0 ? (
                mockAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                      'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <FiAlertTriangle className={`mt-1 ${
                        alert.severity === 'high' ? 'text-red-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">All systems normal</p>
              )}
            </div>

            {/* Auto Refresh Toggle */}
            <div className="mt-6 pt-4 border-t">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Auto-refresh (30s)</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionOfficerMonitoring;
