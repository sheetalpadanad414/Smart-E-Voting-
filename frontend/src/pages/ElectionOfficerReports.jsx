import React, { useState } from 'react';
import { FiDownload, FiFilter } from 'react-icons/fi';

const ElectionOfficerReports = () => {
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [selectedElection, setSelectedElection] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const mockElections = [
    {
      id: '1',
      title: 'Municipal Elections 2024',
      date: '2024-02-20',
      votes: 8234,
      candidates: 12,
      turnout: 68.6
    },
    {
      id: '2',
      title: 'State Assembly Elections',
      date: '2024-03-10',
      votes: 7000,
      candidates: 48,
      turnout: 65.0
    },
    {
      id: '3',
      title: 'Board Division Elections',
      date: '2024-01-20',
      votes: 2500,
      candidates: 8,
      turnout: 58.0
    }
  ];

  const mockReports = [
    {
      id: 1,
      name: 'Municipal Elections Final Report',
      election: 'Municipal Elections 2024',
      type: 'Final Summary',
      date: '2024-02-20',
      size: '2.4 MB',
      status: 'completed'
    },
    {
      id: 2,
      name: 'State Elections Live Snapshot',
      election: 'State Assembly Elections',
      type: 'Live Snapshot',
      date: '2024-03-10 02:30 PM',
      size: '1.8 MB',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Board Elections Summary',
      election: 'Board Division Elections',
      type: 'Final Summary',
      date: '2024-01-20',
      size: '0.9 MB',
      status: 'completed'
    },
    {
      id: 4,
      name: 'Turnout Analysis Report',
      election: 'All Elections',
      type: 'Analytical',
      date: '2024-03-15',
      size: '3.2 MB',
      status: 'completed'
    }
  ];

  const handleDownload = (report) => {
    alert(`Downloading "${report.name}" in ${selectedFormat.toUpperCase()} format`);
  };

  const handleGenerateReport = () => {
    alert(`Generating new report for ${selectedElection === 'all' ? 'all elections' : selectedElection}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Election Reports</h1>
          <p className="text-gray-600">Generate and download detailed election reports</p>
        </div>

        {/* Report Generator */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Generate New Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Election Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Election</label>
              <select 
                value={selectedElection}
                onChange={(e) => setSelectedElection(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Elections</option>
                {mockElections.map((election) => (
                  <option key={election.id} value={election.id}>{election.title}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="thismonth">This Month</option>
                <option value="lastmonth">Last Month</option>
                <option value="thisyear">This Year</option>
              </select>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Final Summary</option>
                <option>Live Snapshot</option>
                <option>Turnout Analysis</option>
                <option>Candidate Ranking</option>
              </select>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select 
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
                <option value="xlsx">Excel</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerateReport}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center space-x-2"
          >
            <FiFilter size={20} />
            <span>Generate Report</span>
          </button>
        </div>

        {/* Previously Generated Reports */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Generated Reports</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Report Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Election</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockReports.map((report) => (
                  <tr key={report.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-800">{report.name}</td>
                    <td className="px-6 py-4 text-gray-700">{report.election}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{report.date}</td>
                    <td className="px-6 py-4 text-gray-600">{report.size}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDownload(report)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        <FiDownload size={18} />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Templates */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Available Report Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Final Results', desc: 'Complete election results' },
              { name: 'Turnout Analysis', desc: 'Voter participation data' },
              { name: 'Candidate Ranking', desc: 'Candidates ranked by votes' },
              { name: 'Geographical Data', desc: 'Results by region/area' }
            ].map((template, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500 hover:shadow-lg transition cursor-pointer">
                <h3 className="font-semibold text-gray-800 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionOfficerReports;
