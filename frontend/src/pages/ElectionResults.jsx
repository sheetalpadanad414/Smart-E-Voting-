import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { voterAPI } from '../services/api';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import toast from 'react-hot-toast';
import { FiDownload, FiTrendingUp } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ElectionResults = () => {
  const { id } = useParams();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await voterAPI.getElectionResults(id);
      setElection(response.data.election);
      setResults(response.data.results);
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const response = await voterAPI.exportResultsPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `election-results-${election.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('PDF exported successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!election || !results) {
    return <div className="flex items-center justify-center min-h-screen">Results not found</div>;
  }

  const chartData = {
    labels: results.candidates.map(c => c.name),
    datasets: [{
      label: 'Votes',
      data: results.candidates.map(c => c.vote_count),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  };

  const pieData = {
    labels: results.candidates.map(c => c.name),
    datasets: [{
      data: results.candidates.map(c => c.vote_count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(6, 182, 212, 0.8)',
      ]
    }]
  };

  const winner = results.candidates.reduce((max, c) => c.vote_count > max.vote_count ? c : max, results.candidates[0]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{election.title} - Results</h1>
              <p className="text-gray-600">{election.description}</p>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={loading}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2 font-semibold disabled:opacity-50"
            >
              <FiDownload />
              Export PDF
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-gray-800">{results.total_votes}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Registered Voters</p>
              <p className="text-2xl font-bold text-gray-800">{results.total_voters}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Voter Turnout</p>
              <p className="text-2xl font-bold text-green-600">{results.turnout}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-800">{results.candidates.length}</p>
            </div>
          </div>
        </div>

        {winner && (
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-md p-8 mb-8 text-white">
            <div className="flex items-center gap-4">
              <FiTrendingUp className="text-4xl" />
              <div>
                <h2 className="text-2xl font-bold">Election Winner</h2>
                <p className="text-lg mt-2">{winner.name}</p>
                <p className="text-sm opacity-90">{winner.vote_count} votes ({((winner.vote_count / results.total_votes) * 100).toFixed(2)}%)</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2 mb-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Vote Distribution (Bar Chart)</h3>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Vote Distribution (Pie Chart)</h3>
            <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-3 text-left font-semibold">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold">Candidate</th>
                  <th className="px-4 py-3 text-left font-semibold">Party/Symbol</th>
                  <th className="px-4 py-3 text-right font-semibold">Votes</th>
                  <th className="px-4 py-3 text-right font-semibold">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.candidates.map((candidate, index) => (
                  <tr key={candidate.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full font-semibold">{index + 1}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{candidate.name}</td>
                    <td className="px-4 py-3 text-gray-600">{candidate.party_name || candidate.symbol || 'N/A'}</td>
                    <td className="px-4 py-3 text-right font-semibold">{candidate.vote_count}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(candidate.vote_count / results.total_votes) * 100}%` }}
                          />
                        </div>
                        <span className="font-semibold min-w-12 text-right">
                          {((candidate.vote_count / results.total_votes) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionResults;
