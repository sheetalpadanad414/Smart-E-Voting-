import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiDownload, FiFilter, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const AdminVoters = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    verified: '',
    otp_verified: '',
    has_voted: ''
  });

  useEffect(() => {
    fetchVoters();
  }, [page, filters]);

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 50 };
      if (filters.verified !== '') params.verified = filters.verified;
      if (filters.otp_verified !== '') params.otp_verified = filters.otp_verified;
      if (filters.has_voted !== '') params.has_voted = filters.has_voted;

      const response = await adminAPI.getVotersWithStatus(params);
      setVoters(response.data.voters);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load voters');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = {};
      if (filters.verified !== '') params.verified = filters.verified;
      if (filters.otp_verified !== '') params.otp_verified = filters.otp_verified;
      if (filters.has_voted !== '') params.has_voted = filters.has_voted;

      const response = await adminAPI.exportVotersCSV(params);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `voters-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const resetFilters = () => {
    setFilters({
      verified: '',
      otp_verified: '',
      has_voted: ''
    });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Voter Verification Status</h1>
            <p className="text-gray-600 mt-1">Track voter verification and voting status</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition flex items-center gap-2 font-semibold"
          >
            <FiDownload /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verified</label>
              <select
                value={filters.verified}
                onChange={(e) => {
                  setFilters({ ...filters, verified: e.target.value });
                  setPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">OTP Verified</label>
              <select
                value={filters.otp_verified}
                onChange={(e) => {
                  setFilters({ ...filters, otp_verified: e.target.value });
                  setPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">OTP Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Has Voted</label>
              <select
                value={filters.has_voted}
                onChange={(e) => {
                  setFilters({ ...filters, has_voted: e.target.value });
                  setPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Voted</option>
                <option value="false">Not Voted</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition font-semibold"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Voters</h3>
            <p className="text-3xl font-bold text-gray-800">{total}</p>
          </div>
          <div className="bg-green-50 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-green-600 mb-2">Verified</h3>
            <p className="text-3xl font-bold text-green-700">
              {voters.filter(v => v.is_verified).length}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-blue-600 mb-2">OTP Verified</h3>
            <p className="text-3xl font-bold text-blue-700">
              {voters.filter(v => v.otp_verified).length}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-purple-600 mb-2">Has Voted</h3>
            <p className="text-3xl font-bold text-purple-700">
              {voters.filter(v => v.has_voted).length}
            </p>
          </div>
        </div>

        {/* Voters Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">Loading...</div>
          ) : voters.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No voters found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-6 py-3 text-left font-semibold">Name</th>
                      <th className="px-6 py-3 text-left font-semibold">Email</th>
                      <th className="px-6 py-3 text-left font-semibold">Phone</th>
                      <th className="px-6 py-3 text-left font-semibold">Voter ID</th>
                      <th className="px-6 py-3 text-center font-semibold">Verified</th>
                      <th className="px-6 py-3 text-center font-semibold">OTP Verified</th>
                      <th className="px-6 py-3 text-center font-semibold">Has Voted</th>
                      <th className="px-6 py-3 text-left font-semibold">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voters.map((voter) => (
                      <tr key={voter.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 font-semibold text-gray-800">{voter.name}</td>
                        <td className="px-6 py-3 text-gray-600">{voter.email}</td>
                        <td className="px-6 py-3 text-gray-600">{voter.phone || '-'}</td>
                        <td className="px-6 py-3 text-gray-600">{voter.voter_id || '-'}</td>
                        <td className="px-6 py-3 text-center">
                          {voter.is_verified ? (
                            <FiCheckCircle className="inline text-green-500 text-xl" />
                          ) : (
                            <FiXCircle className="inline text-red-500 text-xl" />
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {voter.otp_verified ? (
                            <FiCheckCircle className="inline text-blue-500 text-xl" />
                          ) : (
                            <FiXCircle className="inline text-gray-400 text-xl" />
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          {voter.has_voted ? (
                            <FiCheckCircle className="inline text-purple-500 text-xl" />
                          ) : (
                            <FiXCircle className="inline text-gray-400 text-xl" />
                          )}
                        </td>
                        <td className="px-6 py-3 text-gray-600 text-sm">
                          {voter.last_login ? new Date(voter.last_login).toLocaleString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-2 p-6 border-t">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {Math.ceil(total / 50)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 50)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVoters;
