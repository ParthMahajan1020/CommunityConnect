import { useCallback, useEffect, useState } from "react";
import { getReceivedRequests, getSentRequests, updateConnectionRequestStatus } from "../services/api";

const statusStyles = {
    PENDING: "bg-amber-100 text-amber-800",
    ACCEPTED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-rose-100 text-rose-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    INCOMPLETED: "bg-slate-200 text-slate-800"
};

function RequestCard({ request, received, busy, onUpdate }) {
    const person = received ? request.requesterId : request.providerId;
    const canRespond = received && request.status === "PENDING";
    const canComplete = !received && request.status === "ACCEPTED";
    const timeline = request.status === "PENDING" ? "Request sent · Waiting for provider" : request.status === "ACCEPTED" ? "Request sent · Accepted · Help in progress" : request.status === "COMPLETED" ? "Request sent · Accepted · Completed" : request.status === "INCOMPLETED" ? "Request sent · Accepted · Marked incomplete" : "Request sent · Rejected";
    return <article className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-wider text-gray-400">{request.type} REQUEST</p><h3 className="mt-1 text-xl font-bold">{received ? `From ${person?.name || "Community member"}` : `To ${person?.name || "Community member"}`}</h3></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[request.status]}`}>{request.status}</span></div>
        <div className="mt-5 grid gap-3 text-sm"><p><span className="font-semibold text-gray-500">Location: </span>{request.location}</p><p><span className="font-semibold text-gray-500">Details: </span>{request.description}</p><p><span className="font-semibold text-gray-500">Requested: </span>{new Date(request.createdAt).toLocaleString()}</p>{person?.phone && <p><span className="font-semibold text-gray-500">Contact: </span>{person.phone}</p>}</div>
        <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600"><span className="font-semibold">Timeline: </span>{timeline}</div>
        {canRespond && <div className="mt-5 grid grid-cols-2 gap-3"><button disabled={busy} onClick={() => onUpdate(request._id, "ACCEPTED")} className="rounded-xl bg-emerald-600 py-2.5 font-semibold text-white disabled:opacity-50">Accept</button><button disabled={busy} onClick={() => onUpdate(request._id, "REJECTED")} className="rounded-xl border border-rose-200 py-2.5 font-semibold text-rose-700 disabled:opacity-50">Reject</button></div>}
        {canComplete && <div className="mt-5 grid grid-cols-2 gap-3"><button disabled={busy} onClick={() => onUpdate(request._id, "COMPLETED")} className="rounded-xl bg-blue-600 py-2.5 font-semibold text-white disabled:opacity-50">Mark completed</button><button disabled={busy} onClick={() => onUpdate(request._id, "INCOMPLETED")} className="rounded-xl border border-slate-300 py-2.5 font-semibold text-slate-700 disabled:opacity-50">Mark incomplete</button></div>}
    </article>;
}

function MyRequests() {
    const [sent, setSent] = useState([]); const [received, setReceived] = useState([]);
    const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(null); const [error, setError] = useState("");
    const load = useCallback(async () => {
        try { setError(""); const [sentResponse, receivedResponse] = await Promise.all([getSentRequests(), getReceivedRequests()]); setSent(sentResponse.requests || []); setReceived(receivedResponse.requests || []); }
        catch (requestError) { setError(requestError.response?.data?.message || "Unable to connect to CommunityConnect. Please try again."); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { const timer = setTimeout(() => { void load(); }, 0); return () => clearTimeout(timer); }, [load]);
    const update = async (requestId, status) => { try { setBusy(requestId); setError(""); await updateConnectionRequestStatus(requestId, status); await load(); } catch (requestError) { setError(requestError.response?.data?.message || "Unable to update this request."); } finally { setBusy(null); } };
    if (loading) return <main className="mx-auto max-w-6xl px-6 py-16"><div className="grid gap-6 md:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl bg-white/70" />)}</div></main>;
    return <main className="mx-auto max-w-6xl px-6 py-12"><header className="mb-10 text-center"><p className="font-bold tracking-widest text-blue-600">COMMUNITY ACTIVITY</p><h1 className="mt-2 text-4xl font-extrabold">My Requests</h1><p className="mt-3 text-gray-500">Track each request from first contact to its outcome.</p></header>{error && <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>}<section className="mb-12"><div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-bold">Requests Sent</h2><span className="text-sm text-gray-500">{sent.length} total</span></div>{sent.length ? <div className="grid gap-6 md:grid-cols-2">{sent.map((request) => <RequestCard key={request._id} request={request} busy={busy === request._id} onUpdate={update} />)}</div> : <div className="rounded-3xl border bg-white/80 p-10 text-center text-gray-500">You have not sent any requests yet.</div>}</section><section><div className="mb-5 flex items-center justify-between"><h2 className="text-2xl font-bold">Requests Received</h2><span className="text-sm text-gray-500">{received.length} total</span></div>{received.length ? <div className="grid gap-6 md:grid-cols-2">{received.map((request) => <RequestCard key={request._id} request={request} received busy={busy === request._id} onUpdate={update} />)}</div> : <div className="rounded-3xl border bg-white/80 p-10 text-center text-gray-500">You do not have any received requests yet.</div>}</section></main>;
}
export default MyRequests;
