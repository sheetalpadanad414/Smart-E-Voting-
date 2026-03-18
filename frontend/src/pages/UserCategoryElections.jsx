import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { voterAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiCalendar, FiCheckCircle, FiClock, FiTag, FiArrowRight
} from 'react-icons/fi';
import { ElectionCardSkeleton } from '../components/LoadingSkeleton';

// ── Category → election_type keyword mapping ──────────────────────────────────
const CATEGORY_KEYWORDS = {
  National:      ['lok sabha', 'rajya sabha', 'national', 'presidential'],
  State:         ['state assembly', 'vidhan sabha', 'vidhan parishad', 'legislative assembly', 'state'],
  Local:         ['local body', 'gram panchayat', 'grama panchayat', 'zilla panchayat',
                  'taluk panchayat', 'municipal', 'nagar panchayat', 'panchayat', 'ward', 'local'],
  Institutional: ['college', 'university', 'company board', 'society', 'association', 'institutional'],
};

const CATEGORY_META = {
  National:      { icon: '🏛️', label: 'National Elections',           color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
  State:         { icon: '🏢', label: 'State Elections',              color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/30' },
  Local:         { icon: '🏘️', label: 'Local Government Elections',   color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/30' },
  Institutional: { icon: '🎓', label: 'Institutional Elections',      color: 'text-orange-600 dark:text-orange-400',bg: 'bg-orange-50 dark:bg-orange-900/30' },
};

// Match an election to a category using type/subtype/title keywords
const matchesCategory = (election, category) => {
  const keywords = CATEGORY_KEYWORDS[category] || [];
  const haystack = [
    election.election_type,
    election.election_subtype,
    election.type_name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // If no type info at all, fall back to title match
  const titleHaystack = (election.title || '').toLowerCase();

  return keywords.some((kw) => haystack.includes(kw) || titleHaystack.includes(kw));
};

// Derive display status from dates + DB status
const getStatusInfo = (election) => {
  const now   = new Date();
  const start = new Date(election.start_date);
  const end   = new Date(election.end_date);

  if (election.status === 'completed' || now > end) {
    return {
      label: 'Completed',
      badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      icon: <FiCheckCircle />,
    };
  }
  if (election.status === 'draft' || now < start) {
    return {
      label: 'Upcoming',
      badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      icon: <FiClock />,
    };
  }
  return {
    label: 'Active',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: <FiCheckCircle />,
  };
};

// ── Component ─────────────────────────────────────────────────────────────────
const UserCategoryElections = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'National';
  const meta     = CATEGORY_META[category] || CATEGORY_META.National;

  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const PER_PAGE = 9;

  useEffect(() => {
    setPage(1);
    loadElections();
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadElections = async () => {
    try {
      setLoading(true);
      const response = await voterAPI.getAvailableElections(1, 200);
      const all      = response.data.elections || [];
      setFiltered(all.filter((e) => matchesCategory(e, category)));
    } catch {
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const paginated   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages  = Math.ceil(filtered.length / PER_PAGE);

  // ── Action button ────────────────────────────────────────────────────────────
  const ActionButton = ({ election }) => {
    const { label } = getStatusInfo(election);

    if (label === 'Active') {
      return (
        <a
          href={`/elections/${election.id}/vote`}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 dark:from-green-600 dark:to-green-700 text-white py-3 rounded-lg transition-all font-semibold shadow-md"
        >
          Vote Now <FiArrowRight />
        </a>
      );
    }
    if (label === 'Completed') {
      return (
        <a
          href={`/results/${election.id}`}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 dark:from-purple-600 dark:to-purple-700 text-white py-3 rounded-lg transition-all font-semibold shadow-md"
        >
          View Results <FiArrowRight />
        </a>
      );
    }
    return (
      <div className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 py-3 rounded-lg text-center font-semibold cursor-not-allowed select-none">
        Upcoming
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 animate-slideIn">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/elections')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Back to categories"
            >
              <FiArrowLeft size={22} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{meta.icon}</span>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{meta.label}</h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5 ml-10">
                {loading ? 'Loading…' : `${filtered.length} election${filtered.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <ElectionCardSkeleton key={i} />)}
          </div>

        /* ── Empty ── */
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">{meta.icon}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Elections Found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              There are no elections in this category right now. Check back later.
            </p>
          </div>

        /* ── Election cards ── */
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginated.map((election, index) => {
                const status = getStatusInfo(election);
                const typeLabel = election.election_type || election.type_name || null;

                return (
                  <div
                    key={election.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl p-6 card-hover animate-fadeIn transition-colors flex flex-col"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Status + type row */}
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${status.badgeClass}`}>
                        {status.icon}
                        {status.label}
                      </span>
                      {typeLabel && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${meta.bg} ${meta.color} truncate max-w-[140px]`}>
                          <FiTag size={11} />
                          {typeLabel}
                          {election.election_subtype ? ` · ${election.election_subtype}` : ''}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 flex-1">
                      {election.title}
                    </h3>

                    {/* Dates */}
                    <div className="space-y-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <FiCalendar size={13} className="flex-shrink-0" />
                        <span>Start: {new Date(election.start_date).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar size={13} className="flex-shrink-0" />
                        <span>End: {new Date(election.end_date).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <ActionButton election={election} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 animate-fadeIn">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
                >
                  Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-md"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserCategoryElections;
