import React, { useEffect, useState } from 'react';
import { voterAPI, locationAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiCalendar, FiCheckCircle, FiClock, FiMapPin, FiTag } from 'react-icons/fi';

const VoterElections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState({});

  // fetchElections intentionally runs when `page` changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchElections();
    fetchCountries();
  }, [page]);

  const fetchCountries = async () => {
    try {
      const response = await locationAPI.getAllCountries();
      setCountries(response.data.countries);
    } catch (error) {
      console.error('Failed to load countries');
    }
  };

  const fetchElections = async () => {
    try {
      setLoading(true);
      const response = await voterAPI.getAvailableElections(page, 10);
      setElections(response.data.elections);
      setTotal(response.data.total);

      // Fetch location names for elections with location restrictions
      const electionsWithLocation = response.data.elections.filter(e => e.country_id || e.state_id);
      for (const election of electionsWithLocation) {
        if (election.country_id && !states[election.country_id]) {
          try {
            const statesResponse = await locationAPI.getStatesByCountry(election.country_id);
            setStates(prev => ({ ...prev, [election.country_id]: statesResponse.data.states }));
          } catch (error) {
            console.error('Failed to load states');
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = (election) => {
    if (!election.country_id && !election.state_id) {
      return null;
    }

    const country = countries.find(c => c.id === election.country_id);
    const countryName = country ? country.name : 'Unknown';

    if (election.state_id && states[election.country_id]) {
      const state = states[election.country_id].find(s => s.id === election.state_id);
      const stateName = state ? state.name : 'Unknown';
      return `${countryName} - ${stateName}`;
    }

    return countryName;
  };

  const getStatusColor = (status, startDate, endDate) => {
    const now = new Date();
    if (status === 'completed') return 'bg-gray-100 text-gray-700';
    if (now < new Date(startDate)) return 'bg-blue-100 text-blue-700';
    if (now > new Date(endDate)) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  const getStatusIcon = (status, startDate, endDate) => {
    const now = new Date();
    if (status === 'completed') return <FiCheckCircle />;
    if (now < new Date(startDate)) return <FiClock />;
    return <FiCheckCircle />;
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Available Elections</h1>
          <a
            href="/results"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold flex items-center gap-2"
          >
            <FiCheckCircle />
            View Results
          </a>
        </div>

        {elections.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No elections available at the moment</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {elections.map((election) => (
              <div key={election.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800">{election.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{election.description}</p>
                    
                    {/* Election Type Badge */}
                    {election.election_type && (
                      <div className="flex items-center gap-2 mt-2">
                        <FiTag className="text-indigo-500 text-sm" />
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {election.election_type}
                          {election.election_subtype && ` - ${election.election_subtype}`}
                        </span>
                      </div>
                    )}
                    
                    {/* Location Badge */}
                    {getLocationName(election) && (
                      <div className="flex items-center gap-2 mt-2">
                        <FiMapPin className="text-blue-500 text-sm" />
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {getLocationName(election)}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(election.status, election.start_date, election.end_date)}`}>
                    {getStatusIcon(election.status, election.start_date, election.end_date)}
                    {election.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FiCalendar />
                    <span>Start: {new Date(election.start_date).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar />
                    <span>End: {new Date(election.end_date).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  {election.status === 'active' ? (
                    <a
                      href={`/elections/${election.id}/vote`}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition text-center font-semibold"
                    >
                      Vote Now
                    </a>
                  ) : election.status === 'completed' ? (
                    <a
                      href={`/results/${election.id}`}
                      className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition text-center font-semibold"
                    >
                      View Results
                    </a>
                  ) : (
                    <div className="w-full bg-gray-100 text-gray-600 py-2 rounded-lg text-center font-semibold">
                      Upcoming
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {page} of {Math.ceil(total / 10)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / 10)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoterElections;
