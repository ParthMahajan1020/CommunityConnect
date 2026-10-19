import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MapPin,
  RefreshCw,
  X,
  XCircle,
  Inbox,
  Send,
  LoaderCircle,
  AlertCircle,
  Wrench,
  Phone,
} from "lucide-react";

import {
  getReceivedRequests,
  getSentRequests,
  updateConnectionRequestStatus,
} from "../services/api";
import { RequestTimeline } from "../components/visuals/StatusTimeline";
import { EmptyStateVisual } from "../components/visuals/EmptyStateVisual";

const STATUS_STYLES = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Declined",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CheckCircle2,
  },
  INCOMPLETED: {
    label: "Incomplete",
    className: "bg-slate-50 text-slate-600 border-slate-200",
    icon: AlertCircle,
  },
};

const getStatusConfig = (status) => {
  return (
    STATUS_STYLES[String(status || "PENDING").toUpperCase()] ||
    STATUS_STYLES.PENDING
  );
};

const getRequestId = (request) =>
  request?._id || request?.id || request?.requestId;

const formatDate = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const getRequestType = (request) => {
  const type = String(
    request?.type || request?.requestType || request?.category || ""
  ).toUpperCase();

  if (type.includes("BLOOD")) {
    return {
      label: "Blood",
      className: "bg-[#FBEAEC] text-[#C94C55]",
      icon: HeartHandshake,
    };
  }

  return {
    label: "Service",
    className: "bg-[#EAF1FA] text-[#4B78A8]",
    icon: Wrench,
  };
};

const getPersonName = (person) => {
  if (!person) return "Member";
  if (typeof person === "string") return person;
  return person.name || person.fullName || person.username || person.email || "Member";
};

const getRequestPerson = (request, received) => {
  if (received) {
    return (
      request?.requester ||
      request?.sender ||
      request?.fromUser ||
      request?.user ||
      request?.requesterId
    );
  }
  return (
    request?.provider ||
    request?.recipient ||
    request?.receiver ||
    request?.toUser ||
    request?.providerId
  );
};

export default function MyRequests() {
  const [activeTab, setActiveTab] = useState("received"); // "received" | "sent"
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError("");

    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        getSentRequests(),
        getReceivedRequests(),
      ]);

      setSentRequests(sentResponse.requests || []);
      setReceivedRequests(receivedResponse.requests || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load requests."
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    Promise.all([getSentRequests(), getReceivedRequests()])
      .then(([sentResponse, receivedResponse]) => {
        if (!active) return;
        setSentRequests(sentResponse.requests || []);
        setReceivedRequests(receivedResponse.requests || []);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err?.response?.data?.message || "Failed to load requests."
        );
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleUpdateStatus = async (request, status) => {
    const requestId = getRequestId(request);
    if (!requestId) return;

    setUpdatingId(requestId);
    setError("");

    try {
      await updateConnectionRequestStatus(requestId, status);
      await handleRefresh();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Status update failed."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = receivedRequests.filter(
    (r) => String(r?.status || "PENDING").toUpperCase() === "PENDING"
  ).length;

  const currentList = activeTab === "received" ? receivedRequests : sentRequests;
  const isReceived = activeTab === "received";

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F8FAF9]">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle className="h-8 w-8 animate-spin text-[#427A65]" />
          <span className="text-xs text-[#6F7D76]">Loading requests...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header Dashboard */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#24342E]">
              My Requests
            </h1>
            <p className="mt-1 text-xs text-[#6F7D76]">
              Real-time peer connection dashboard
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-[#E2E9E4] bg-white px-3.5 text-xs font-semibold text-[#24342E] shadow-2xs transition hover:bg-[#F8FAF9] disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Sync
          </button>
        </header>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
          >
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Summary Stat Chips */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E2E9E4] bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#4B78A8]">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#24342E] sm:text-2xl leading-none">
                {receivedRequests.length}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#6F7D76]">
                Received
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#E2E9E4] bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#24342E] sm:text-2xl leading-none">
                {sentRequests.length}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#6F7D76]">
                Sent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#E2E9E4] bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#24342E] sm:text-2xl leading-none">
                {pendingCount}
              </p>
              <p className="mt-1 text-[11px] font-medium text-[#6F7D76]">
                Pending
              </p>
            </div>
          </div>
        </div>

        {/* Segmented Control Tabs */}
        <div className="mt-7 flex items-center gap-2 border-b border-[#E2E9E4] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("received")}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "received"
                ? "bg-[#24342E] text-white shadow-xs"
                : "text-[#6F7D76] hover:bg-white hover:text-[#24342E]"
            }`}
          >
            <Inbox className="h-3.5 w-3.5" />
            Received
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeTab === "received"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-[#6F7D76]"
              }`}
            >
              {receivedRequests.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sent")}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "sent"
                ? "bg-[#24342E] text-white shadow-xs"
                : "text-[#6F7D76] hover:bg-white hover:text-[#24342E]"
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            Sent
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeTab === "sent"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-[#6F7D76]"
              }`}
            >
              {sentRequests.length}
            </span>
          </button>
        </div>

        {/* Request Cards Feed */}
        <div className="mt-6">
          {currentList.length === 0 ? (
            <EmptyStateVisual
              type={isReceived ? "received" : "sent"}
              title={
                isReceived
                  ? "No incoming requests yet"
                  : "No sent requests yet"
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {currentList.map((request, idx) => {
                const status = String(request?.status || "PENDING").toUpperCase();
                const statusConfig = getStatusConfig(status);
                const StatusIcon = statusConfig.icon;
                const typeInfo = getRequestType(request);
                const TypeIcon = typeInfo.icon;
                const person = getRequestPerson(request, isReceived);
                const personName = getPersonName(person);
                const requestId = getRequestId(request);
                const isUpdating = updatingId === requestId;

                const phone =
                  request?.contact ||
                  request?.phone ||
                  person?.phone ||
                  person?.contact;

                const canRespond = isReceived && status === "PENDING";
                const canComplete = !isReceived && status === "ACCEPTED";

                return (
                  <motion.article
                    key={requestId || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col justify-between rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs hover:shadow-xs transition"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${typeInfo.className}`}
                          >
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-[#24342E] truncate max-w-[160px] sm:max-w-[200px]">
                              {personName}
                            </h3>
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[#6F7D76]">
                              <span>{typeInfo.label}</span>
                              {request?.createdAt && (
                                <>
                                  <span>•</span>
                                  <span>{formatDate(request.createdAt)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Chip */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusConfig.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </div>

                      {/* Visual Timeline Progress */}
                      <div className="mt-4 border-t border-b border-[#F2F5F3] py-2.5">
                        <RequestTimeline status={status} />
                      </div>

                      {/* Description / location */}
                      <div className="mt-3 space-y-1.5 text-xs text-[#6F7D76]">
                        {request?.location && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <MapPin className="h-3 w-3 shrink-0 text-[#8C9892]" />
                            <span className="truncate">{request.location}</span>
                          </div>
                        )}
                        {request?.description && (
                          <p className="rounded-xl bg-[#F8FAF9] p-2.5 text-xs leading-relaxed text-[#4A5952]">
                            {request.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-2">
                      {phone && status === "ACCEPTED" && (
                        <a
                          href={`tel:${String(phone).replace(/[^\d+]/g, "")}`}
                          className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D5E7DB] bg-[#EDF7EF] py-2 text-xs font-semibold text-[#356651] transition hover:bg-[#E0F2E5]"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          Call {personName}
                        </a>
                      )}

                      {canRespond && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(request, "ACCEPTED")}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#427A65] text-xs font-semibold text-white transition hover:bg-[#356651] disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Accept
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(request, "REJECTED")}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#F2D5D8] bg-white text-xs font-semibold text-[#C94C55] transition hover:bg-[#FBEAEC] disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
                            Decline
                          </button>
                        </div>
                      )}

                      {canComplete && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(request, "COMPLETED")}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#427A65] text-xs font-semibold text-white transition hover:bg-[#356651] disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            Done
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(request, "INCOMPLETED")}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E2E9E4] bg-white text-xs font-semibold text-[#6F7D76] transition hover:bg-[#F5F8F6] disabled:opacity-50"
                          >
                            Incomplete
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}