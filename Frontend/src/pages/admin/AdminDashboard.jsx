import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  Building2,
  Droplets,
  Wrench,
  Inbox,
  MessageSquareText,
  FileSpreadsheet,
  RefreshCw,
  LogOut,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Loader2,
  Check,
  X,
  Activity,
  ArrowRight
} from "lucide-react";

import {
  getAdminOverview,
  getAdminUsers,
  updateAdminUserStatus,
  getAdminOrganizations,
  updateAdminOrgStatus,
  getAdminBloodOrganizations,
  getAdminServices,
  toggleAdminServiceStatus,
  getAdminRequests,
  getAdminFeedbacks,
  getAdminAuditLogs,
  logoutUser
} from "../../services/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Tab Data States
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("");

  const [orgs, setOrgs] = useState([]);
  const [orgStatusFilter, setOrgStatusFilter] = useState("");
  const [orgSearch, setOrgSearch] = useState("");
  const [orgActionNote, setOrgActionNote] = useState("");

  const [bloodOrgs, setBloodOrgs] = useState([]);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState({ type: "", status: "" });
  const [feedbacks, setFeedbacks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadData = async () => {
    try {
      const [ovRes, orgsRes, bloodRes, srvRes, reqRes, fbRes, logsRes] = await Promise.all([
        getAdminOverview(),
        getAdminOrganizations(),
        getAdminBloodOrganizations(),
        getAdminServices(),
        getAdminRequests(),
        getAdminFeedbacks(),
        getAdminAuditLogs()
      ]);

      setOverview(ovRes.metrics);
      setOrgs(orgsRes.organizations || []);
      setBloodOrgs(bloodRes.bloodOrganizations || []);
      setServices(srvRes.services || []);
      setRequests(reqRes.requests || []);
      setFeedbacks(fbRes.feedbacks || []);
      setAuditLogs(logsRes.logs || []);

      const userRes = await getAdminUsers({ search: userSearch, status: userStatusFilter });
      setUsers(userRes.users || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load administrative data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const [ovRes, orgsRes, bloodRes, srvRes, reqRes, fbRes, logsRes, userRes] = await Promise.all([
          getAdminOverview(),
          getAdminOrganizations(),
          getAdminBloodOrganizations(),
          getAdminServices(),
          getAdminRequests(),
          getAdminFeedbacks(),
          getAdminAuditLogs(),
          getAdminUsers()
        ]);
        if (!ignore) {
          setOverview(ovRes.metrics);
          setOrgs(orgsRes.organizations || []);
          setBloodOrgs(bloodRes.bloodOrganizations || []);
          setServices(srvRes.services || []);
          setRequests(reqRes.requests || []);
          setFeedbacks(fbRes.feedbacks || []);
          setAuditLogs(logsRes.logs || []);
          setUsers(userRes.users || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.response?.data?.message || "Failed to load administrative data.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/admin/login");
  };

  // User actions
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setActionLoadingId(userId);
    setError("");
    try {
      await updateAdminUserStatus(userId, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, accountStatus: nextStatus } : u))
      );
      setSuccessMsg(`User status updated to ${nextStatus}.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Organization approval / status
  const handleUpdateOrg = async (orgId, status) => {
    setActionLoadingId(orgId);
    setError("");
    try {
      await updateAdminOrgStatus(orgId, status, orgActionNote);
      setOrgs((prev) =>
        prev.map((o) => (o._id === orgId ? { ...o, organizationStatus: status } : o))
      );
      setSuccessMsg(`Organization status successfully updated to ${status}.`);
      setOrgActionNote("");
      setTimeout(() => setSuccessMsg(""), 4000);
      // Reload overview & logs
      const [ovRes, logsRes] = await Promise.all([getAdminOverview(), getAdminAuditLogs()]);
      setOverview(ovRes.metrics);
      setAuditLogs(logsRes.logs || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update organization status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Service toggle
  const handleToggleService = async (serviceId, currentActive) => {
    setActionLoadingId(serviceId);
    try {
      await toggleAdminServiceStatus(serviceId, !currentActive);
      setServices((prev) =>
        prev.map((s) => (s._id === serviceId ? { ...s, isActive: !currentActive } : s))
      );
      setSuccessMsg(`Service listing ${!currentActive ? "activated" : "suspended"}.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update service listing.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered organizations
  const filteredOrgs = orgs.filter((o) => {
    if (orgStatusFilter && o.organizationStatus !== orgStatusFilter) return false;
    if (orgSearch.trim()) {
      const q = orgSearch.toLowerCase();
      const matchName = o.organizationName?.toLowerCase().includes(q);
      const matchReg = o.registrationNumber?.toLowerCase().includes(q);
      const matchEmail = o.email?.toLowerCase().includes(q);
      const matchLoc = o.location?.toLowerCase().includes(q);
      if (!matchName && !matchReg && !matchEmail && !matchLoc) return false;
    }
    return true;
  });

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    if (requestFilter.type && r.type !== requestFilter.type) return false;
    if (requestFilter.status && r.status !== requestFilter.status) return false;
    return true;
  });

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F4F6F5]">
        <div className="flex flex-col items-center gap-3 text-xs text-[#6F7D76]">
          <Loader2 className="h-7 w-7 animate-spin text-[#24342E]" />
          Loading Administrator Control System...
        </div>
      </main>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "users", label: "Users", icon: Users, count: overview?.totalPublicUsers },
    { id: "organizations", label: "Organizations", icon: Building2, count: overview?.pendingOrganizationApprovals, alert: (overview?.pendingOrganizationApprovals || 0) > 0 },
    { id: "blood", label: "Blood Centers", icon: Droplets, count: (overview?.totalBloodBanks || 0) + (overview?.totalHospitals || 0) },
    { id: "services", label: "Service Listings", icon: Wrench, count: services.length },
    { id: "requests", label: "Request Ecosystem", icon: Inbox, count: requests.length },
    { id: "feedback", label: "Feedback", icon: MessageSquareText, count: feedbacks.length },
    { id: "audit", label: "Audit Logs", icon: FileSpreadsheet, count: auditLogs.length },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-[#24342E]">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-300 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24342E] text-white shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-[#24342E]">
                  CommunityConnect Admin
                </span>
                <span className="rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                  ROOT
                </span>
              </div>
              <p className="text-[10px] font-medium text-[#6F7D76]">Supervisory Management Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-[#24342E] shadow-2xs hover:bg-slate-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 shadow-2xs hover:bg-rose-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
        {/* Alerts Banner */}
        {error && (
          <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")}><X className="h-4 w-4" /></button>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")}><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-300 pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  isCurrent
                    ? "bg-[#24342E] text-white shadow-xs"
                    : "text-[#6F7D76] hover:bg-white hover:text-[#24342E]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      tab.alert
                        ? "bg-amber-400 text-amber-950 font-bold"
                        : isCurrent
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SECTION 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-2xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Community Members
                </span>
                <p className="mt-2 text-3xl font-bold text-[#24342E]">{overview?.totalPublicUsers}</p>
                <p className="mt-1 text-[11px] text-[#6F7D76]">Registered public users</p>
              </div>

              <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-2xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Private Organizations
                </span>
                <p className="mt-2 text-3xl font-bold text-[#24342E]">
                  {overview?.totalPrivateOrganizations}
                </p>
                <p className="mt-1 text-[11px] text-[#6F7D76]">
                  {overview?.totalBloodBanks} Blood Banks • {overview?.totalHospitals} Hospitals • {overview?.totalServiceProviders} Providers
                </p>
              </div>

              <div className="rounded-3xl border border-amber-300 bg-gradient-to-br from-white to-amber-50 p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    Pending Approvals
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold">
                    {overview?.pendingOrganizationApprovals}
                  </span>
                </div>
                <p className="mt-2 text-3xl font-bold text-amber-950">
                  {overview?.pendingOrganizationApprovals}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("organizations");
                    setOrgStatusFilter("PENDING");
                  }}
                  className="mt-2 text-xs font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
                >
                  Review Pending Queue <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="rounded-3xl border border-slate-300 bg-white p-5 shadow-2xs">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Platform Requests
                </span>
                <p className="mt-2 text-3xl font-bold text-[#24342E]">{overview?.totalRequests}</p>
                <p className="mt-1 text-[11px] text-[#6F7D76]">
                  {overview?.activeRequests} Active • {overview?.completedRequests} Completed
                </p>
              </div>
            </div>

            {/* Platform Health Matrix */}
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-[#24342E]">Organization Status Distribution</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs">
                    <span className="font-semibold text-emerald-800">Approved & Operational</span>
                    <span className="font-bold text-emerald-900">{overview?.approvedOrganizations}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs">
                    <span className="font-semibold text-amber-800">Pending Verification</span>
                    <span className="font-bold text-amber-900">{overview?.pendingOrganizationApprovals}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs">
                    <span className="font-semibold text-rose-800">Suspended / Inactive</span>
                    <span className="font-bold text-rose-900">{overview?.suspendedOrganizations}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200 p-3 text-xs">
                    <span className="font-semibold text-slate-700">Rejected Applications</span>
                    <span className="font-bold text-slate-800">{overview?.rejectedOrganizations}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-[#24342E]">Recent Administrative Actions</h3>
                <div className="mt-4 space-y-2.5">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log._id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-[#FBFCFB] p-3 text-xs">
                      <div>
                        <p className="font-bold text-[#24342E]">{log.action}</p>
                        <p className="text-[11px] text-[#6F7D76]">{log.adminEmail} • {log.targetType}</p>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* SECTION 2: USER MANAGEMENT */}
        {activeTab === "users" && (
          <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#24342E]">Public User Accounts</h2>
                <p className="mt-1 text-xs text-[#6F7D76]">
                  Inspect community users, review verified status, and suspend abusive accounts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name, email, city..."
                    className="h-9 w-48 rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 text-xs text-[#24342E] outline-none focus:bg-white"
                  />
                </div>
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-2 text-xs text-[#24342E] outline-none focus:bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await getAdminUsers({ search: userSearch, status: userStatusFilter });
                    setUsers(res.users || []);
                  }}
                  className="rounded-xl bg-[#24342E] px-3 py-2 text-xs font-semibold text-white"
                >
                  Filter
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[#6F7D76]">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Phone</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSuspended = u.accountStatus === "SUSPENDED";
                    const isUpdating = actionLoadingId === u._id;
                    return (
                      <tr key={u._id} className="hover:bg-slate-50 transition">
                        <td className="py-3 font-bold text-[#24342E]">{u.name}</td>
                        <td className="py-3 text-[#6F7D76]">{u.email}</td>
                        <td className="py-3 text-[#6F7D76]">{u.phone}</td>
                        <td className="py-3 text-[#6F7D76]">{u.location}</td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isSuspended
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {u.accountStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleToggleUserStatus(u._id, u.accountStatus)}
                            className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold transition ${
                              isSuspended
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "border border-rose-200 text-rose-700 hover:bg-rose-50"
                            }`}
                          >
                            {isUpdating ? "Processing..." : isSuspended ? "Reactivate" : "Suspend"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SECTION 3: ORGANIZATION MANAGEMENT */}
        {activeTab === "organizations" && (
          <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#24342E]">Private Organizations & Providers</h2>
                <p className="mt-1 text-xs text-[#6F7D76]">
                  Review registration documentation, manage verification lifecycle, and suspend bad actors.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={orgStatusFilter}
                  onChange={(e) => setOrgStatusFilter(e.target.value)}
                  className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs text-[#24342E] outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <input
                  type="text"
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  placeholder="Search org, reg number..."
                  className="h-9 w-44 rounded-xl border border-slate-300 bg-slate-50 px-3 text-xs text-[#24342E] outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {filteredOrgs.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6F7D76]">
                  No organizations found matching the filter criteria.
                </div>
              ) : (
                filteredOrgs.map((org) => {
                  const isUpdating = actionLoadingId === org._id;
                  const isPending = org.organizationStatus === "PENDING";
                  const isApproved = org.organizationStatus === "APPROVED";
                  const isSuspended = org.organizationStatus === "SUSPENDED";

                  return (
                    <div
                      key={org._id}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-base font-bold text-[#24342E]">
                              {org.organizationName || org.name}
                            </h3>
                            <span className="rounded-full bg-[#EAF1FA] px-2 py-0.5 text-[10px] font-bold text-[#4B78A8]">
                              {org.role}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                org.organizationStatus === "APPROVED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : org.organizationStatus === "PENDING"
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : org.organizationStatus === "SUSPENDED"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              {org.organizationStatus}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-xs text-[#6F7D76]">
                            <div>
                              <span className="font-semibold text-slate-400 block text-[10px] uppercase">Contact Person</span>
                              <span>{org.name}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-400 block text-[10px] uppercase">Reg / License #</span>
                              <span className="font-mono font-bold text-[#24342E]">{org.registrationNumber || "N/A"}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-400 block text-[10px] uppercase">Contact Details</span>
                              <span>{org.email} • {org.phone}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-400 block text-[10px] uppercase">Location Area</span>
                              <span>{org.location}</span>
                            </div>
                          </div>

                          {org.address && (
                            <p className="mt-2 text-xs text-[#6F7D76]">
                              <strong className="text-slate-500">Address:</strong> {org.address}
                            </p>
                          )}

                          {org.licenseDocument && (
                            <p className="mt-1 text-xs text-[#4B78A8]">
                              <strong className="text-slate-500">Document/Credential:</strong> {org.licenseDocument}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateOrg(org._id, "APPROVED")}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve Organization
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleUpdateOrg(org._id, "REJECTED")}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                              >
                                <X className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateOrg(org._id, "SUSPENDED")}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                            >
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Suspend
                            </button>
                          )}

                          {isSuspended && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleUpdateOrg(org._id, "APPROVED")}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Reactivate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* SECTION 4: BLOOD ORGANIZATIONS & INVENTORIES */}
        {activeTab === "blood" && (
          <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-2xs">
            <h2 className="text-xl font-bold text-[#24342E]">Blood Banks & Hospital Inventories</h2>
            <p className="mt-1 text-xs text-[#6F7D76]">
              Real-time monitoring of reported blood group reserves across accredited facilities.
            </p>

            <div className="mt-6 space-y-4">
              {bloodOrgs.map((org) => {
                const inv = org.inventory || {};
                const totalUnits = Object.values(inv).reduce((a, b) => a + (Number(b) || 0), 0);

                return (
                  <div key={org._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[#24342E]">{org.organizationName}</h3>
                          <span className="rounded-full bg-[#FBEAEC] px-2 py-0.5 text-[10px] font-bold text-[#C94C55]">
                            {org.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6F7D76]">{org.location} • {org.phone}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[#C94C55]">{totalUnits} Units Total</span>
                        {org.inventoryLastUpdated && (
                          <p className="text-[10px] text-slate-400">
                            Updated {new Date(org.inventoryLastUpdated).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Blood units row */}
                    <div className="mt-3.5 grid grid-cols-4 gap-2 sm:grid-cols-8">
                      {bloodGroups.map((grp) => (
                        <div key={grp} className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center">
                          <span className="font-bold text-xs text-[#C94C55] block">{grp}</span>
                          <span className="font-mono text-sm font-bold text-[#24342E]">{inv[grp] || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 5: SERVICES */}
        {activeTab === "services" && (
          <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-2xs">
            <h2 className="text-xl font-bold text-[#24342E]">Professional Service Listings</h2>
            <p className="mt-1 text-xs text-[#6F7D76]">
              Audit platform services and suspend fraudulent or unauthorized listings.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((srv) => {
                const isUpdating = actionLoadingId === srv._id;
                return (
                  <div key={srv._id} className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="rounded-xl bg-[#EAF1FA] px-2 py-0.5 text-xs font-bold text-[#4B78A8]">
                          {srv.category}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            srv.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {srv.isActive ? "Active" : "Suspended"}
                        </span>
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-[#24342E]">{srv.title}</h3>
                      <p className="mt-1 text-xs text-[#6F7D76] line-clamp-2">{srv.description}</p>
                      <p className="mt-2 text-xs font-semibold text-[#24342E]">
                        Provider: {srv.organizationId?.organizationName || srv.organizationId?.name}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#24342E]">
                        {srv.pricing > 0 ? `₹${srv.pricing}/${srv.pricingType}` : "Custom"}
                      </span>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleToggleService(srv._id, srv.isActive)}
                        className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                          srv.isActive
                            ? "border border-rose-200 text-rose-700 hover:bg-rose-50"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {srv.isActive ? "Suspend Listing" : "Reactivate"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 6: REQUESTS ECOSYSTEM */}
        {activeTab === "requests" && (
          <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#24342E]">Platform Request Ecosystem</h2>
                <p className="mt-1 text-xs text-[#6F7D76]">
                  Global visibility into community connections across blood, services, and hospitals.
                </p>
              </div>

              <div className="flex gap-2">
                <select
                  value={requestFilter.type}
                  onChange={(e) => setRequestFilter({ ...requestFilter, type: e.target.value })}
                  className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="">All Types</option>
                  <option value="BLOOD">Blood</option>
                  <option value="SERVICE">Service</option>
                </select>
                <select
                  value={requestFilter.status}
                  onChange={(e) => setRequestFilter({ ...requestFilter, status: e.target.value })}
                  className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[#6F7D76]">
                    <th className="pb-3 font-semibold">Requester</th>
                    <th className="pb-3 font-semibold">Receiver / Provider</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-[#24342E]">
                        {r.requesterId?.name || "Member"}
                        <span className="block text-[10px] font-normal text-[#6F7D76]">{r.requesterId?.email}</span>
                      </td>
                      <td className="py-3 font-bold text-[#24342E]">
                        {r.providerId?.organizationName || r.providerId?.name || "Provider"}
                        <span className="block text-[10px] font-normal text-[#6F7D76]">{r.providerId?.role}</span>
                      </td>
                      <td className="py-3 font-bold text-[#4B78A8]">{r.type}</td>
                      <td className="py-3 text-[#6F7D76]">{r.location}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-slate-100 border border-slate-300 px-2 py-0.5 text-[10px] font-bold">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#6F7D76]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SECTION 7: FEEDBACK */}
        {activeTab === "feedback" && (
          <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-2xs">
            <h2 className="text-xl font-bold text-[#24342E]">User Experience & Feedback</h2>
            <p className="mt-1 text-xs text-[#6F7D76]">
              Submissions from the community feedback form.
            </p>

            <div className="mt-6 space-y-3">
              {feedbacks.length === 0 ? (
                <p className="py-8 text-center text-xs text-[#6F7D76]">No feedback submitted yet.</p>
              ) : (
                feedbacks.map((fb) => (
                  <div key={fb._id} className="rounded-2xl border border-slate-200 bg-[#FBFCFB] p-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#24342E]">
                        {fb.userId?.name || "Community Member"} ({fb.userType})
                      </span>
                      <span className="rounded-full bg-[#E5F1EA] px-2 py-0.5 text-[10px] font-bold text-[#427A65]">
                        Score: {fb.overallExperience} / 5
                      </span>
                    </div>
                    <div className="mt-2 text-[#6F7D76] grid gap-1 sm:grid-cols-3">
                      <span>Ease of Use: <strong>{fb.easeOfUse}</strong></span>
                      <span>Usefulness: <strong>{fb.usefulness}</strong></span>
                      <span>Recommend: <strong>{fb.recommend}</strong></span>
                    </div>
                    {fb.additionalFeedback && (
                      <p className="mt-2 text-[#24342E] rounded-xl bg-white p-2.5 border border-slate-200">
                        "{fb.additionalFeedback}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* SECTION 8: AUDIT LOGS */}
        {activeTab === "audit" && (
          <section className="rounded-3xl border border-slate-300 bg-white p-6 shadow-2xs">
            <h2 className="text-xl font-bold text-[#24342E]">Platform Security Audit Logs</h2>
            <p className="mt-1 text-xs text-[#6F7D76]">
              Chronological ledger of supervisory and administrative actions. Passwords and credentials are never stored.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[#6F7D76]">
                    <th className="pb-3 font-semibold">Timestamp</th>
                    <th className="pb-3 font-semibold">Action</th>
                    <th className="pb-3 font-semibold">Admin Account</th>
                    <th className="pb-3 font-semibold">Target Type</th>
                    <th className="pb-3 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50">
                      <td className="py-2.5 text-[#6F7D76] font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 font-bold text-[#24342E]">{log.action}</td>
                      <td className="py-2.5 text-[#6F7D76]">{log.adminEmail}</td>
                      <td className="py-2.5 text-[#6F7D76]">{log.targetType}</td>
                      <td className="py-2.5 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                        {JSON.stringify(log.details || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
