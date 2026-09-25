import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getSentRequests,
  getReceivedRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
} from "../api/requestService.js";
import Loader from "../components/common/Loader.jsx";

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
};

const RequestCard = ({ request, perspective, actionId, onAccept, onReject, onCancel }) => {
  // "perspective" is either "sent" or "received" — determines which side
  // of the request is "the other person" and which actions are relevant.
  const counterpart = perspective === "sent" ? request.receiver : request.requester;
  const isBusy = actionId === request._id;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {counterpart.profilePicture ? (
            <img
              src={counterpart.profilePicture}
              alt={counterpart.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
              {counterpart.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {counterpart.name}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            STATUS_STYLES[request.status]
          }`}
        >
          {request.status}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase text-gray-400">
            {perspective === "sent" ? "You offered" : "They offered"}
          </p>
          <p className="mt-1 text-sm font-medium text-blue-600">
            {request.offeredSkill.name}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-gray-400">
            {perspective === "sent" ? "You requested" : "They requested"}
          </p>
          <p className="mt-1 text-sm font-medium text-purple-600">
            {request.requestedSkill.name}
          </p>
        </div>
      </div>

      {request.message && (
        <p className="mt-3 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
          "{request.message}"
        </p>
      )}

      {request.status === "pending" && (
        <div className="mt-4 flex justify-end gap-2">
          {perspective === "received" ? (
            <>
              <button
                onClick={() => onReject(request._id)}
                disabled={isBusy}
                className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? "..." : "Reject"}
              </button>
              <button
                onClick={() => onAccept(request._id)}
                disabled={isBusy}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? "..." : "Accept"}
              </button>
            </>
          ) : (
            <button
              onClick={() => onCancel(request._id)}
              disabled={isBusy}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? "..." : "Cancel Request"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const ExchangeRequests = () => {
  const [activeTab, setActiveTab] = useState("received");
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const loadSent = async () => {
    const response = await getSentRequests();
    setSentRequests(response.data);
  };

  const loadReceived = async () => {
    const response = await getReceivedRequests();
    setReceivedRequests(response.data);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([loadSent(), loadReceived()]);
      } catch (error) {
        // axiosInstance's response interceptor already showed a toast.
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, []);

  const handleAccept = async (requestId) => {
    setActionId(requestId);
    try {
      await acceptRequest(requestId);
      toast.success("Request accepted");
      await loadReceived();
    } catch (error) {
      // Toasted centrally (e.g. "already accepted/rejected").
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionId(requestId);
    try {
      await rejectRequest(requestId);
      toast.success("Request rejected");
      await loadReceived();
    } catch (error) {
      // Toasted centrally.
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (requestId) => {
    setActionId(requestId);
    try {
      await cancelRequest(requestId);
      toast.success("Request cancelled");
      await loadSent();
    } catch (error) {
      // Toasted centrally.
    } finally {
      setActionId(null);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  const activeList = activeTab === "sent" ? sentRequests : receivedRequests;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Exchange Requests</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage requests you've sent and received.
      </p>

      <div className="mt-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("received")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "received"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Received ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "sent"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Sent ({sentRequests.length})
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {activeList.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
            <p className="text-sm font-medium text-gray-700">
              No {activeTab} requests
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === "received"
                ? "When someone sends you a request, it will show up here."
                : "Visit the Matches page to send your first exchange request."}
            </p>
          </div>
        ) : (
          activeList.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              perspective={activeTab}
              actionId={actionId}
              onAccept={handleAccept}
              onReject={handleReject}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ExchangeRequests;