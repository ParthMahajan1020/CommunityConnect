import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  HeartHandshake,
  MapPin,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  X,
  XCircle,
  Inbox,
  Send,
  CalendarDays,
  LoaderCircle,
  AlertCircle,
  ClipboardList,
} from "lucide-react";

import {
  getReceivedRequests,
  getSentRequests,
  updateConnectionRequestStatus,
} from "../services/api";

const STATUS_STYLES = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: Clock3,
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Declined",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
    icon: XCircle,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    icon: CheckCircle2,
  },
  INCOMPLETED: {
    label: "Not completed",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
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
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getRequestType = (request) => {
  const type = String(
    request?.type || request?.requestType || request?.category || ""
  ).toUpperCase();

  if (type.includes("BLOOD")) {
    return {
      label: "Blood donation",
      className: "bg-rose-50 text-rose-700",
      dotClassName: "bg-rose-500",
    };
  }

  return {
    label: "Local service",
    className: "bg-blue-50 text-blue-700",
    dotClassName: "bg-blue-500",
  };
};

const getPersonName = (person) => {
  if (!person) return "Community member";

  if (typeof person === "string") {
    return person;
  }

  return (
    person.name ||
    person.fullName ||
    person.username ||
    person.email ||
    "Community member"
  );
};

const getRequestPerson = (request, received) => {
  if (received) {
    return (
      request?.requester ||
      request?.sender ||
      request?.fromUser ||
      request?.user ||
      request?.acceptor ||
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

const getRequestLocation = (request) => {
  const person = getRequestPerson(request, false);

  return (
    request?.location ||
    request?.requestLocation ||
    request?.provider?.location ||
    request?.requester?.location ||
    person?.location ||
    ""
  );
};

const getRequestDescription = (request) =>
  request?.description ||
  request?.message ||
  request?.details ||
  request?.reason ||
  "";

const getRequestsFromResponse = (response) => {
  if (!Array.isArray(response?.requests)) {
    throw new Error("The server returned an invalid requests response.");
  }

  return response.requests;
};

function StatusBadge({ status }) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${config.className}`}
    >
      <Icon size={13} strokeWidth={2.2} />
      {config.label}
    </span>
  );
}

function TypeBadge({ request }) {
  const type = getRequestType(request);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${type.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${type.dotClassName}`} />
      {type.label}
    </span>
  );
}

function EmptyState({ received }) {
  const Icon = received ? Inbox : Send;

  return (
    <div className="flex flex-col items-center justify-center px-5 py-12 text-center sm:py-16">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E2E9E4] bg-[#F4F7F5]">
        <Icon size={27} strokeWidth={1.5} className="text-[#427A65]" />
      </div>

      <h3 className="text-lg font-semibold tracking-tight text-[#24342E]">
        {received ? "No incoming requests yet" : "No requests sent yet"}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-[#718078]">
        {received
          ? "When someone reaches out to you through CommunityConnect, their request will appear here."
          : "When you request help from a donor or service provider, you can track its progress here."}
      </p>
    </div>
  );
}

function RequestCard({
  request,
  received,
  onUpdateStatus,
  updatingId,
}) {
  const status = String(request?.status || "PENDING").toUpperCase();
  const requestId = getRequestId(request);
  const type = getRequestType(request);
  const person = getRequestPerson(request, received);
  const personName = getPersonName(person);

  const phone =
    request?.contact ||
    request?.phone ||
    request?.phoneNumber ||
    person?.phone ||
    person?.contact ||
    "";

  const location = getRequestLocation(request);
  const description = getRequestDescription(request);
  const createdAt = request?.createdAt || request?.date || request?.updatedAt;

  const isUpdating = updatingId === requestId;

  const canRespond = received && status === "PENDING";
  const canComplete = !received && status === "ACCEPTED";

  return (
    <article className="group rounded-2xl border border-[#E2E9E4] bg-white p-4 transition duration-200 hover:border-[#C9D9CE] hover:shadow-[0_8px_30px_rgba(36,52,46,0.045)] sm:p-5">
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              type.label === "Blood donation"
                ? "bg-[#FBEAEC] text-[#C94C55]"
                : "bg-[#EAF1FA] text-[#6C8FBC]"
            }`}
          >
            {type.label === "Blood donation" ? (
              <HeartHandshake size={22} strokeWidth={1.8} />
            ) : (
              <MessageCircle size={22} strokeWidth={1.8} />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[#24342E]">
              {personName}
            </h3>

            <p className="mt-1 text-xs text-[#87938C]">
              {received ? "Request received" : "Request sent"}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      {/* Request details */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <TypeBadge request={request} />

        {location && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F7F5] px-3 py-1.5 text-xs font-medium text-[#64736B]">
            <MapPin size={13} />
            <span className="max-w-[180px] truncate">{location}</span>
          </span>
        )}
      </div>

      {description && (
        <div className="mt-4 rounded-xl bg-[#F8FAF9] p-3.5">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#87938C]">
            Request details
          </p>

          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#526159]">
            {description}
          </p>
        </div>
      )}

      {/* Footer information */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#EEF2EF] pt-4 text-xs text-[#7B8880]">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={14} />
          {formatDate(createdAt)}
        </span>

        {phone && status === "ACCEPTED" && (
          <a
            href={`tel:${String(phone).replace(/[^\d+]/g, "")}`}
            className="inline-flex items-center gap-1.5 font-medium text-[#427A65] transition hover:text-[#315E4C]"
          >
            <MessageCircle size={14} />
            Contact member
          </a>
        )}
      </div>

      {/* Received request actions */}
      {canRespond && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(request, "ACCEPTED")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#427A65] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356650] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            Accept
          </button>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() => onUpdateStatus(request, "REJECTED")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E7D8D9] bg-white px-4 py-2.5 text-sm font-semibold text-[#B64C55] transition hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdating ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <X size={16} />
            )}
            Decline
          </button>
        </div>
      )}

      {/* Sent request completion actions */}
      {canComplete && (
        <div className="mt-5">
          <p className="mb-3 text-xs leading-5 text-[#718078]">
            Has your request been fulfilled? Update its status to keep your
            request history accurate.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(request, "COMPLETED")}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#427A65] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#356650] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Mark completed
            </button>

            <button
              type="button"
              disabled={isUpdating}
              onClick={() => onUpdateStatus(request, "INCOMPLETED")}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E2E9E4] bg-white px-4 py-2.5 text-sm font-semibold text-[#64736B] transition hover:bg-[#F5F7F5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <AlertCircle size={16} />
              )}
              Not completed
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function RequestSection({
  title,
  subtitle,
  requests,
  received,
  icon: Icon,
  onUpdateStatus,
  updatingId,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E2E9E4] bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-[#EAF0EC] px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
            <Icon size={19} strokeWidth={1.8} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#24342E]">
              {title}
            </h2>
            <p className="mt-0.5 text-xs text-[#87938C]">{subtitle}</p>
          </div>
        </div>

        <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-[#F1F5F2] px-2.5 text-xs font-semibold text-[#526159]">
          {requests.length}
        </span>
      </div>

      {requests.length === 0 ? (
        <EmptyState received={received} />
      ) : (
        <div className="space-y-4 p-3 sm:p-5">
          {requests.map((request, index) => (
            <RequestCard
              key={getRequestId(request) || `${received ? "received" : "sent"}-${index}`}
              request={request}
              received={received}
              onUpdateStatus={onUpdateStatus}
              updatingId={updatingId}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function MyRequests() {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadRequests = useCallback(async (showLoader = true) => {
  setError("");

  if (showLoader) {
    setLoading(true);
  } else {
    setRefreshing(true);
  }

  try {
    const [sentResponse, receivedResponse] = await Promise.all([
      getSentRequests(),
      getReceivedRequests(),
    ]);

    setSentRequests(getRequestsFromResponse(sentResponse));
    setReceivedRequests(getRequestsFromResponse(receivedResponse));
  } catch (err) {
    console.error("Failed to load requests:", err);

    setError(
      err?.response?.data?.message ||
        "We couldn't load your requests. Please try again."
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);

  useEffect(() => {
  let cancelled = false;

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const [sentResponse, receivedResponse] = await Promise.all([
        getSentRequests(),
        getReceivedRequests(),
      ]);

      if (cancelled) return;

      setSentRequests(getRequestsFromResponse(sentResponse));
      setReceivedRequests(getRequestsFromResponse(receivedResponse));
    } catch (err) {
      if (cancelled) return;

      console.error("Failed to load requests:", err);

      setError(
        err?.response?.data?.message ||
          "We couldn't load your requests. Please try again."
      );
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  fetchRequests();

  return () => {
    cancelled = true;
  };
}, []);

  const handleUpdateStatus = async (request, status) => {
    const requestId = getRequestId(request);

    if (!requestId) {
      setError(
        "This request is missing its ID. Refresh the page and try again."
      );
      return;
    }

    setUpdatingId(requestId);
    setError("");

    try {
      await updateConnectionRequestStatus(requestId, status);

      await loadRequests(false);
    } catch (err) {
      console.error("Failed to update request:", err);

      setError(
        err?.response?.data?.message ||
          "We couldn't update this request. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingReceived = receivedRequests.filter(
    (request) =>
      String(request?.status || "PENDING").toUpperCase() === "PENDING"
  ).length;


  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF9] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-3 w-28 rounded bg-[#E2E9E4]" />
            <div className="mt-4 h-9 w-64 max-w-full rounded-lg bg-[#E2E9E4]" />
            <div className="mt-3 h-4 w-80 max-w-full rounded bg-[#E8EEEA]" />

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {[0, 1].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#E2E9E4] bg-white p-5"
                >
                  <div className="h-10 w-40 rounded-lg bg-[#E8EEEA]" />
                  <div className="mt-6 space-y-4">
                    <div className="h-36 rounded-xl bg-[#F1F5F2]" />
                    <div className="h-36 rounded-xl bg-[#F1F5F2]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-[#718078]">
            <LoaderCircle size={17} className="animate-spin" />
            Loading your requests...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <header className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DCE8DF] bg-white px-3 py-1.5 text-xs font-semibold text-[#427A65]">
              <ClipboardList size={14} />
              YOUR ACTIVITY
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-[#24342E] sm:text-4xl">
              My requests<span className="text-[#427A65]">.</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-[#718078] sm:text-base">
              Keep track of the help you need and the people reaching out to
              you through your community.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadRequests(false)}
            disabled={refreshing}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#DDE6E0] bg-white px-4 py-2.5 text-sm font-semibold text-[#526159] shadow-sm transition hover:border-[#BFD1C5] hover:bg-[#F5F8F6] disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm text-rose-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 leading-5">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="rounded-lg p-1 transition hover:bg-rose-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-2xl border border-[#E2E9E4] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#718078]">
                Requests sent
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
                <ArrowUpRight size={18} />
              </div>
            </div>

            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#24342E]">
              {sentRequests.length}
            </p>

            <p className="mt-1 text-xs text-[#87938C]">
              Help you've requested
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E9E4] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#718078]">
                Requests received
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#6C8FBC]">
                <ArrowDownLeft size={18} />
              </div>
            </div>

            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#24342E]">
              {receivedRequests.length}
            </p>

            <p className="mt-1 text-xs text-[#87938C]">
              People reaching out to you
            </p>
          </div>

          <div className="rounded-2xl border border-[#E2E9E4] bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#718078]">
                Awaiting response
              </span>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock3 size={18} />
              </div>
            </div>

            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#24342E]">
              {pendingReceived}
            </p>

            <p className="mt-1 text-xs text-[#87938C]">
              Incoming requests to review
            </p>
          </div>
        </div>

        {/* Requests */}
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <RequestSection
            title="Sent requests"
            subtitle="Track the help you've requested"
            requests={sentRequests}
            received={false}
            icon={Send}
            onUpdateStatus={handleUpdateStatus}
            updatingId={updatingId}
          />

          <RequestSection
            title="Received requests"
            subtitle="Respond to people in your community"
            requests={receivedRequests}
            received={true}
            icon={Inbox}
            onUpdateStatus={handleUpdateStatus}
            updatingId={updatingId}
          />
        </div>

        {/* Closing note */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#E2E9E4] bg-white p-4 sm:p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#24342E]">
              Building a more connected community
            </h3>

            <p className="mt-1 text-sm leading-6 text-[#718078]">
              Keep your request statuses updated so everyone knows where
              things stand. A small response can make a meaningful difference.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}