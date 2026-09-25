import { useState, useEffect, useMemo } from "react";
import { getMatches } from "../api/matchService.js";
import Loader from "../components/common/Loader.jsx";
import SendRequestModal from "../components/requests/SendRequestModal.jsx";

const FILTER_OPTIONS = [
  { label: "All Matches", value: "all" },
  { label: "Perfect Matches", value: "perfect" },
  { label: "Partial Matches", value: "partial" },
];

const MatchCard = ({ match, onSendRequest }) => {
  const { user, matchType, matchScore, matchingSkills } = match;
  const isPerfect = matchType === "perfect";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">
              {user.experienceLevel || "Beginner"}
            </p>
          </div>
        </div>

        <span
          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
            isPerfect
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {isPerfect ? "Perfect Match" : "Partial Match"} · {matchScore}%
        </span>
      </div>

      {user.bio && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{user.bio}</p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase text-gray-400">
            They can teach you
          </p>
          {matchingSkills.youTeachIWant.length === 0 ? (
            <p className="mt-1 text-xs text-gray-400">—</p>
          ) : (
            <div className="mt-1 flex flex-wrap gap-1">
              {matchingSkills.youTeachIWant.map((skill) => (
                <span
                  key={skill._id}
                  className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-600"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase text-gray-400">
            You can teach them
          </p>
          {matchingSkills.iTeachYouWant.length === 0 ? (
            <p className="mt-1 text-xs text-gray-400">—</p>
          ) : (
            <div className="mt-1 flex flex-wrap gap-1">
              {matchingSkills.iTeachYouWant.map((skill) => (
                <span
                  key={skill._id}
                  className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onSendRequest(match)}
        className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Send Exchange Request
      </button>
    </div>
  );
};

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [activeModalMatch, setActiveModalMatch] = useState(null);

  const fetchMatches = () => {
    setIsLoading(true);
    setError(null);
    return getMatches()
      .then((response) => setMatches(response.data))
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            "Unable to load your matches right now."
        )
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const filteredMatches = useMemo(() => {
    return matches
      .filter((match) =>
        typeFilter === "all" ? true : match.matchType === typeFilter
      )
      .filter((match) =>
        searchTerm.trim() === ""
          ? true
          : match.user.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );
  }, [matches, searchTerm, typeFilter]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button
          onClick={fetchMatches}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Find Matches</h1>
      <p className="mt-1 text-sm text-gray-500">
        People whose skills complement yours, ranked by compatibility.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:max-w-xs"
        />
        <div className="flex gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTypeFilter(option.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                typeFilter === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {matches.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-gray-700">No matches yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Add more teaching and learning skills on the Skills page to
            increase your chances of finding a match.
          </p>
        </div>
      )}

      {matches.length > 0 && filteredMatches.length === 0 && (
        <div className="mt-10 rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-gray-700">
            No matches found
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Try a different search term or filter.
          </p>
        </div>
      )}

      {filteredMatches.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredMatches.map((match) => (
            <MatchCard
              key={match.user._id}
              match={match}
              onSendRequest={setActiveModalMatch}
            />
          ))}
        </div>
      )}

      {activeModalMatch && (
        <SendRequestModal
          match={activeModalMatch}
          onClose={() => setActiveModalMatch(null)}
          onSuccess={() => setActiveModalMatch(null)}
        />
      )}
    </div>
  );
};

export default Matches;