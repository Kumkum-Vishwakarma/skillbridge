import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { getDashboardStats } from "../api/dashboardService.js";
import Loader from "../components/common/Loader.jsx";

const STAT_CONFIG = [
  { key: "totalTeachingSkills", label: "Teaching Skills" },
  { key: "totalLearningSkills", label: "Learning Skills" },
  { key: "smartMatchCount", label: "Smart Matches" },
  { key: "totalSentRequests", label: "Requests Sent" },
  { key: "totalReceivedRequests", label: "Requests Received" },
  { key: "pendingRequestsSent", label: "Pending (Sent)" },
  { key: "pendingRequestsReceived", label: "Pending (Received)" },
  { key: "acceptedExchanges", label: "Accepted" },
  { key: "rejectedRequests", label: "Rejected" },
];

const StatCard = ({ label, value }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </p>
    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const RecentRequestRow = ({ request, perspective }) => {
  const counterpart =
    perspective === "sent" ? request.receiver : request.requester;

  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <div className="flex items-center gap-3">
        {counterpart.profilePicture ? (
          <img
            src={counterpart.profilePicture}
            alt={counterpart.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
            {counterpart.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {counterpart.name}
          </p>
          <p className="text-xs text-gray-500">
            {request.offeredSkill.name} ↔ {request.requestedSkill.name}
          </p>
        </div>
      </div>
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
        {request.status}
      </span>
    </div>
  );
};

const RecentMatchRow = ({ match }) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
    <div className="flex items-center gap-3">
      {match.user.profilePicture ? (
        <img
          src={match.user.profilePicture}
          alt={match.user.name}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
          {match.user.name?.charAt(0).toUpperCase()}
        </div>
      )}
      <p className="text-sm font-medium text-gray-900">{match.user.name}</p>
    </div>
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
        match.matchType === "perfect"
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {match.matchScore}%
    </span>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = () => {
    setIsLoading(true);
    setError(null);
    return getDashboardStats()
      .then((response) => setStats(response.data))
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            "Unable to load your dashboard right now."
        )
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {user?.name}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Here's what's happening with your skill exchanges.
      </p>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        {STAT_CONFIG.map((stat) => (
          <StatCard key={stat.key} label={stat.label} value={stats[stat.key]} />
        ))}
      </div>

      {/* ── Recent Activity ──────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Recent Sent
            </h2>
            <Link
              to="/requests"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          {stats.recentSentRequests.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">
              No sent requests yet.
            </p>
          ) : (
            <div className="mt-2">
              {stats.recentSentRequests.map((request) => (
                <RecentRequestRow
                  key={request._id}
                  request={request}
                  perspective="sent"
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Recent Received
            </h2>
            <Link
              to="/requests"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          {stats.recentReceivedRequests.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">
              No received requests yet.
            </p>
          ) : (
            <div className="mt-2">
              {stats.recentReceivedRequests.map((request) => (
                <RecentRequestRow
                  key={request._id}
                  request={request}
                  perspective="received"
                />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Recent Matches
            </h2>
            <Link
              to="/matches"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>
          {stats.recentMatches.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">
              No matches yet — add skills to get discovered.
            </p>
          ) : (
            <div className="mt-2">
              {stats.recentMatches.map((match) => (
                <RecentMatchRow key={match.user._id} match={match} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;