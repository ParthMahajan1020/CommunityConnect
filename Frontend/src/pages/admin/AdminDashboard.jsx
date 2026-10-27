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
  X,
  Activity,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Menu,
  Eye,
  Clock,
  ExternalLink
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

  // Navigation state
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, orgs, blood, services, requests, feedback, audit
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global loading and feedback
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // 1. Overview state
  const [overview, setOverview] = useState(null);
  const [pendingOrgsList, setPendingOrgsList] = useState([]);
  const [recentRequestsList, setRecentRequestsList] = useState([]);

  // 2. Users state
  const [users, setUsers] = useState([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [userSummary, setUserSummary] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // 3. Organizations state
  const [orgs, setOrgs] = useState([]);
  const [orgTotal, setOrgTotal] = useState(0);
  const [orgPage, setOrgPage] = useState(1);
  const [orgTotalPages, setOrgTotalPages] = useState(1);
  const [orgSearch, setOrgSearch] = useState("");
  const [orgStatusFilter, setOrgStatusFilter] = useState("ALL");
  const [orgTypeFilter, setOrgTypeFilter] = useState("ALL");
  const [orgSummary, setOrgSummary] = useState(null);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [selectedOrgDetail, setSelectedOrgDetail] = useState(null);

  // Org status modal
  const [statusModalOrg, setStatusModalOrg] = useState(null);
  const [statusModalAction, setStatusModalAction] = useState(""); // APPROVED, REJECTED, SUSPENDED
  const [statusModalNotes, setStatusModalNotes] = useState("");
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // 4. Blood organizations state
  const [bloodOrgs, setBloodOrgs] = useState([]);
  const [aggregateInventory, setAggregateInventory] = useState(null);
  const [bloodSearch, setBloodSearch] = useState("");
  const [bloodLoading, setBloodLoading] = useState(false);

  // 5. Services state
  const [services, setServices] = useState([]);
  const [serviceTotal, setServiceTotal] = useState(0);
  const [servicePage, setServicePage] = useState(1);
  const [serviceTotalPages, setServiceTotalPages] = useState(1);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("ALL");
  const [serviceActiveFilter, setServiceActiveFilter] = useState("ALL");
  const [servicesLoading, setServicesLoading] = useState(false);

  // 6. Requests state
  const [requests, setRequests] = useState([]);
  const [requestTotal, setRequestTotal] = useState(0);
  const [requestPage, setRequestPage] = useState(1);
  const [requestTotalPages, setRequestTotalPages] = useState(1);
  const [requestSearch, setRequestSearch] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("ALL");
  const [requestStatusFilter, setRequestStatusFilter] = useState("ALL");
  const [requestSummary, setRequestSummary] = useState(null);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState(null);

  // 7. Feedback state
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);

  // 8. Audit logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditActionFilter, setAuditActionFilter] = useState("ALL");
  const [auditTargetFilter, setAuditTargetFilter] = useState("ALL");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState(null);

  // User action in-flight ID
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // ============================================
  // INITIAL LOAD & REFRESH
  // ============================================

  const loadOverviewData = async () => {
    try {
      const ovRes = await getAdminOverview();
      setOverview(ovRes.metrics);
      setPendingOrgsList(ovRes.pendingOrgsList || []);
      setRecentRequestsList(ovRes.recentRequestsList || []);
      setLastSyncTime(new Date());
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load administrator overview metrics.");
    }
  };

  const loadUsers = async (page = userPage) => {
    setUsersLoading(true);
    try {
      const res = await getAdminUsers({
        page,
        limit: 15,
        search: userSearch,
        role: userRoleFilter,
        status: userStatusFilter
      });
      setUsers(res.users || []);
      setUserTotal(res.total || 0);
      setUserPage(res.page || 1);
      setUserTotalPages(res.totalPages || 1);
      if (res.summary) setUserSummary(res.summary);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users list.");
    } finally {
      setUsersLoading(false);
    }
  };

  const loadOrganizations = async (page = orgPage) => {
    setOrgsLoading(true);
    try {
      const res = await getAdminOrganizations({
        page,
        limit: 15,
        search: orgSearch,
        status: orgStatusFilter,
        type: orgTypeFilter
      });
      setOrgs(res.organizations || []);
      setOrgTotal(res.total || 0);
      setOrgPage(res.page || 1);
      setOrgTotalPages(res.totalPages || 1);
      if (res.summary) setOrgSummary(res.summary);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load organizations list.");
    } finally {
      setOrgsLoading(false);
    }
  };

  const loadBloodOrganizations = async () => {
    setBloodLoading(true);
    try {
      const res = await getAdminBloodOrganizations();
      setBloodOrgs(res.bloodOrganizations || []);
      if (res.aggregateInventory) setAggregateInventory(res.aggregateInventory);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load blood organizations.");
    } finally {
      setBloodLoading(false);
    }
  };

  const loadServices = async (page = servicePage) => {
    setServicesLoading(true);
    try {
      const res = await getAdminServices({
        page,
        limit: 15,
        search: serviceSearch,
        category: serviceCategoryFilter,
        isActive: serviceActiveFilter
      });
      setServices(res.services || []);
      setServiceTotal(res.total || 0);
      setServicePage(res.page || 1);
      setServiceTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load professional services.");
    } finally {
      setServicesLoading(false);
    }
  };

  const loadRequests = async (page = requestPage) => {
    setRequestsLoading(true);
    try {
      const res = await getAdminRequests({
        page,
        limit: 15,
        search: requestSearch,
        type: requestTypeFilter,
        status: requestStatusFilter
      });
      setRequests(res.requests || []);
      setRequestTotal(res.total || 0);
      setRequestPage(res.page || 1);
      setRequestTotalPages(res.totalPages || 1);
      if (res.summary) setRequestSummary(res.summary);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load platform requests.");
    } finally {
      setRequestsLoading(false);
    }
  };

  const loadFeedbacks = async () => {
    setFeedbacksLoading(true);
    try {
      const res = await getAdminFeedbacks();
      setFeedbacks(res.feedbacks || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load feedbacks.");
    } finally {
      setFeedbacksLoading(false);
    }
  };

  const loadAuditLogs = async (page = auditPage) => {
    setAuditLoading(true);
    try {
      const res = await getAdminAuditLogs({
        page,
        limit: 20,
        search: auditSearch,
        action: auditActionFilter,
        targetType: auditTargetFilter
      });
      setAuditLogs(res.logs || []);
      setAuditTotal(res.total || 0);
      setAuditPage(res.page || 1);
      setAuditTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load audit logs.");
    } finally {
      setAuditLoading(false);
    }
  };

  // Full Initial Mount Load
  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        await Promise.all([
          loadOverviewData(),
          loadUsers(1),
          loadOrganizations(1),
          loadBloodOrganizations(),
          loadServices(1),
          loadRequests(1),
          loadFeedbacks(),
          loadAuditLogs(1)
        ]);
      } catch {
        if (!ignore) setError("Failed to synchronize administrative platform data.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    init();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      await Promise.all([
        loadOverviewData(),
        loadUsers(userPage),
        loadOrganizations(orgPage),
        loadBloodOrganizations(),
        loadServices(servicePage),
        loadRequests(requestPage),
        loadFeedbacks(),
        loadAuditLogs(auditPage)
      ]);
      setSuccessMsg("Platform data synchronized successfully with MongoDB.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setError("Failed to refresh data.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/admin/login");
  };

  // ============================================
  // USER ACTIONS
  // ============================================
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
      loadOverviewData();
      loadAuditLogs(1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ============================================
  // ORGANIZATION APPROVAL / STATUS ACTIONS
  // ============================================
  const openStatusModal = (org, action) => {
    setStatusModalOrg(org);
    setStatusModalAction(action);
    setStatusModalNotes("");
  };

  const handleConfirmOrgStatus = async () => {
    if (!statusModalOrg || !statusModalAction) return;
    setStatusSubmitting(true);
    setError("");
    try {
      await updateAdminOrgStatus(statusModalOrg._id, statusModalAction, statusModalNotes);
      setOrgs((prev) =>
        prev.map((o) => (o._id === statusModalOrg._id ? { ...o, organizationStatus: statusModalAction } : o))
      );
      setSuccessMsg(`Organization ${statusModalOrg.organizationName || statusModalOrg.name} marked as ${statusModalAction}.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      setStatusModalOrg(null);
      setStatusModalAction("");
      setStatusModalNotes("");
      loadOverviewData();
      loadOrganizations(orgPage);
      loadBloodOrganizations();
      loadAuditLogs(1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update organization status.");
    } finally {
      setStatusSubmitting(false);
    }
  };

  // ============================================
  // SERVICE ACTIONS
  // ============================================
  const handleToggleService = async (serviceId, currentActive) => {
    setActionLoadingId(serviceId);
    setError("");
    try {
      await toggleAdminServiceStatus(serviceId, !currentActive);
      setServices((prev) =>
        prev.map((s) => (s._id === serviceId ? { ...s, isActive: !currentActive } : s))
      );
      setSuccessMsg(`Service listing ${!currentActive ? "activated" : "suspended"}.`);
      setTimeout(() => setSuccessMsg(""), 4000);
      loadOverviewData();
      loadAuditLogs(1);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update service listing.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered blood orgs for search
  const filteredBloodOrgs = bloodOrgs.filter((org) => {
    if (!bloodSearch.trim()) return true;
    const q = bloodSearch.toLowerCase();
    return (
      org.organizationName?.toLowerCase().includes(q) ||
      org.name?.toLowerCase().includes(q) ||
      org.location?.toLowerCase().includes(q) ||
      org.address?.toLowerCase().includes(q)
    );
  });

  const navItems = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "users", label: "Users Directory", icon: Users, count: userTotal || overview?.totalPublicUsers },
    { id: "organizations", label: "Organizations", icon: Building2, count: orgTotal || overview?.totalPrivateOrganizations, alert: (overview?.pendingOrganizationApprovals || 0) > 0 },
    { id: "blood", label: "Blood Centers", icon: Droplets, count: (overview?.totalBloodBanks || 0) + (overview?.totalHospitals || 0) },
    { id: "services", label: "Service Listings", icon: Wrench, count: serviceTotal || overview?.totalProfessionalServices },
    { id: "requests", label: "Request Ecosystem", icon: Inbox, count: requestTotal || overview?.totalRequests },
    { id: "feedback", label: "Feedback & Reports", icon: MessageSquareText, count: feedbacks.length },
    { id: "audit", label: "Audit Logs", icon: FileSpreadsheet, count: auditTotal || auditLogs.length },
  ];

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F6F5]">
        <div className="flex flex-col items-center gap-3 text-xs text-[#6F7D76]">
          <Loader2 className="h-8 w-8 animate-spin text-[#24342E]" />
          <span className="font-semibold text-sm text-[#24342E]">Connecting to Administrative Cluster...</span>
          <span>Aggregating real-time database state...</span>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-[#24342E] flex">
      {/* =======================================================
          A. RESPONSIVE SIDEBAR
      ======================================================= */}
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#24342E] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#24342E] shadow-2xs font-black">
                <ShieldCheck className="h-5 w-5 text-[#24342E]" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white">CommunityConnect</span>
                <span className="block text-[9px] uppercase tracking-wider text-emerald-300 font-semibold">Admin SaaS Suite</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-white/70 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrent = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isCurrent
                      ? "bg-white/15 text-white shadow-xs font-bold"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isCurrent ? "text-emerald-300" : "text-white/60"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.alert
                          ? "bg-amber-400 text-amber-950 animate-pulse"
                          : isCurrent
                          ? "bg-white/25 text-white"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Account Card */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <div className="rounded-xl bg-white/5 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                SU
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate text-white">Superadmin</p>
                <p className="text-[10px] text-white/50 truncate">Full Root Access</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-500/20 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =======================================================
          B. MAIN CONTENT AREA & TOP NAVIGATION
      ======================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-300 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-[#6F7D76]">
                <span>Admin Console</span>
                <span>/</span>
                <span className="font-semibold text-[#24342E] capitalize">
                  {navItems.find((n) => n.id === activeTab)?.label}
                </span>
              </div>
              <h1 className="text-base font-bold text-[#24342E] leading-tight">
                {activeTab === "overview" && "Platform Operations & Intelligence"}
                {activeTab === "users" && "User Directory & Access Control"}
                {activeTab === "organizations" && "Organization Verification & Compliance"}
                {activeTab === "blood" && "Blood Banks & Real-Time Inventories"}
                {activeTab === "services" && "Professional Service Catalog Management"}
                {activeTab === "requests" && "Live Platform Request Ecosystem"}
                {activeTab === "feedback" && "Community Feedback & Service Audits"}
                {activeTab === "audit" && "Immutable Audit Trail & Administrative Records"}
              </h1>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#6F7D76] bg-slate-100 rounded-xl px-3 py-1.5 border border-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Database Source of Truth</span>
              <span className="text-slate-400">·</span>
              <span>Synced {new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-[#24342E] shadow-2xs hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
              <span className="hidden sm:inline">Sync DB</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 shadow-2xs hover:bg-rose-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Global Messages */}
        <div className="p-4 sm:px-6 lg:px-8 space-y-3">
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
        </div>

        {/* =======================================================
            C. TAB CONTENT ROUTER
        ======================================================= */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-12">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Action Banner: Pending Organization Approvals */}
              {(overview?.pendingOrganizationApprovals || 0) > 0 && (
                <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-amber-950">
                        {overview.pendingOrganizationApprovals} Organization Application{overview.pendingOrganizationApprovals > 1 ? "s" : ""} Pending Review
                      </h3>
                      <p className="text-xs text-amber-800 mt-0.5">
                        New hospitals or blood centers have submitted official documentation. Operational features remain locked until verified.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setOrgStatusFilter("PENDING");
                      setActiveTab("organizations");
                    }}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-amber-700"
                  >
                    <span>Review Pending Orgs</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Group 1: Platform & Community KPIs */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#6F7D76] mb-3">
                  1. Community & Public Network
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#6F7D76]">Total Public Users</span>
                      <Users className="h-4 w-4 text-[#427A65]" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-[#24342E]">{overview?.totalPublicUsers || 0}</p>
                    <p className="text-[10px] text-[#6F7D76] mt-0.5">Verified public accounts</p>
                  </div>

                  <div className="rounded-2xl border border-[#F2D5D8] bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#C94C55]">Registered Donors</span>
                      <Droplets className="h-4 w-4 text-[#C94C55]" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-[#24342E]">{overview?.totalBloodDonors || 0}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      {overview?.availableBloodDonors || 0} currently active & discoverable
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#D8E4F2] bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#4B78A8]">Community Helpers</span>
                      <Wrench className="h-4 w-4 text-[#4B78A8]" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-[#24342E]">{overview?.totalCommunityProviders || 0}</p>
                    <p className="text-[10px] text-[#6F7D76] mt-0.5">
                      {overview?.activeCommunityProviders || 0} active local providers
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#6F7D76]">Suspended Accounts</span>
                      <ShieldAlert className="h-4 w-4 text-rose-500" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-rose-700">{overview?.suspendedOrganizations || 0}</p>
                    <p className="text-[10px] text-[#6F7D76] mt-0.5">Access disabled for safety</p>
                  </div>
                </div>
              </div>

              {/* Group 2: Institutional & Operational KPIs */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#6F7D76] mb-3">
                  2. Institutional Portal & Live Blood Supply
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#6F7D76]">Total Organizations</span>
                      <Building2 className="h-4 w-4 text-slate-700" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-[#24342E]">{overview?.totalPrivateOrganizations || 0}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#6F7D76]">
                      <span>{overview?.totalBloodBanks || 0} Blood Banks</span>
                      <span>·</span>
                      <span>{overview?.totalHospitals || 0} Hospitals</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-800">Pending Approvals</span>
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-amber-900">{overview?.pendingOrganizationApprovals || 0}</p>
                    <p className="text-[10px] text-amber-800 mt-0.5">Operational features locked</p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-800">Approved Organizations</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-emerald-950">{overview?.approvedOrganizations || 0}</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Fully operational & verified</p>
                  </div>

                  <div className="rounded-2xl border border-[#F2D5D8] bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#C94C55]">Total Blood Inventory</span>
                      <Droplets className="h-4 w-4 text-[#C94C55]" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-[#C94C55]">{overview?.totalInventoryUnits || 0} <span className="text-xs font-normal text-slate-600">units</span></p>
                    <p className="text-[10px] text-[#6F7D76] mt-0.5">Reported by approved centers</p>
                  </div>
                </div>
              </div>

              {/* Group 3: Requests & Transfusion Volume */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#6F7D76] mb-3">
                  3. Platform Requests & Fulfilment Volume
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-2xs">
                    <span className="text-[11px] font-semibold text-[#6F7D76]">Total Requests</span>
                    <p className="mt-2 text-2xl font-black text-[#24342E]">{overview?.totalRequests || 0}</p>
                    <p className="text-[10px] text-[#6F7D76] mt-0.5">All-time connections</p>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-2xs">
                    <span className="text-[11px] font-semibold text-amber-800">Pending Response</span>
                    <p className="mt-2 text-2xl font-black text-amber-900">{overview?.pendingRequests || 0}</p>
                    <p className="text-[10px] text-amber-800 mt-0.5">Awaiting provider action</p>
                  </div>

                  <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-2xs">
                    <span className="text-[11px] font-semibold text-blue-800">Accepted Requests</span>
                    <p className="mt-2 text-2xl font-black text-blue-900">{overview?.acceptedRequests || 0}</p>
                    <p className="text-[10px] text-blue-700 mt-0.5">In coordination / ongoing</p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xs">
                    <span className="text-[11px] font-semibold text-emerald-800">Fulfilled & Completed</span>
                    <p className="mt-2 text-2xl font-black text-emerald-900">{overview?.completedRequests || 0}</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Successfully served</p>
                  </div>

                  <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-600">Rejected / Closed</span>
                    <p className="mt-2 text-2xl font-black text-slate-700">{overview?.rejectedRequests || 0}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Declined by recipient</p>
                  </div>
                </div>
              </div>

              {/* Group 4: Live Inventory Distribution & Request Breakdown */}
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Blood Group Supply Bar */}
                <div className="lg:col-span-7 rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-[#24342E]">Live Blood Group Inventory Distribution</h3>
                      <p className="text-xs text-[#6F7D76]">Real-time units aggregated from accredited blood centers & hospitals</p>
                    </div>
                    <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                      {overview?.totalInventoryUnits || 0} Units Total
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {bloodGroups.map((grp) => {
                      const units = overview?.bloodInventoryByGroup?.[grp] || 0;
                      return (
                        <div key={grp} className="rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-center">
                          <span className="text-xs font-bold text-[#C94C55]">{grp}</span>
                          <p className="text-lg font-black text-[#24342E] mt-1">{units}</p>
                          <span className="text-[9px] text-[#6F7D76]">units</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Request Status Breakdown Bar */}
                <div className="lg:col-span-5 rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="font-bold text-sm text-[#24342E]">Request Status Ratio</h3>
                    <p className="text-xs text-[#6F7D76]">Platform-wide lifecycle distribution</p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      { label: "Pending", count: overview?.pendingRequests || 0, color: "bg-amber-500", text: "text-amber-800" },
                      { label: "Accepted", count: overview?.acceptedRequests || 0, color: "bg-blue-500", text: "text-blue-800" },
                      { label: "Completed", count: overview?.completedRequests || 0, color: "bg-emerald-500", text: "text-emerald-800" },
                      { label: "Rejected", count: overview?.rejectedRequests || 0, color: "bg-slate-400", text: "text-slate-600" }
                    ].map((item) => {
                      const total = overview?.totalRequests || 1;
                      const pct = Math.round((item.count / total) * 100);
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700">{item.label}</span>
                            <span className="font-bold text-slate-900">{item.count} ({pct}%)</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Group 5: Pending Organizations & Live Requests */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Pending Organizations Queue */}
                <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <h3 className="font-bold text-sm text-[#24342E]">Pending Verification Queue</h3>
                    </div>
                    <button
                      onClick={() => {
                        setOrgStatusFilter("PENDING");
                        setActiveTab("organizations");
                      }}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="mt-3 divide-y divide-slate-100">
                    {pendingOrgsList.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-400">All organizations have been reviewed. No pending applications.</p>
                    ) : (
                      pendingOrgsList.map((org) => (
                        <div key={org._id} className="py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{org.organizationName || org.name}</h4>
                              <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-900">
                                {org.role?.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              Reg: {org.registrationNumber || "N/A"} · {org.location || "Location unstated"}
                            </p>
                          </div>
                          <button
                            onClick={() => openStatusModal(org, "APPROVED")}
                            className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-2xs"
                          >
                            Review & Approve
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Platform Requests */}
                <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Inbox className="h-4 w-4 text-[#427A65]" />
                      <h3 className="font-bold text-sm text-[#24342E]">Recent Platform Requests</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab("requests")}
                      className="text-xs font-bold text-emerald-700 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="mt-3 divide-y divide-slate-100">
                    {recentRequestsList.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-400">No requests recorded yet.</p>
                    ) : (
                      recentRequestsList.map((req) => (
                        <div key={req._id} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold ${
                                req.type === "BLOOD" ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"
                              }`}>
                                {req.type}
                              </span>
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {req.requesterId?.name || "Requester"} → {req.providerId?.organizationName || req.providerId?.name || "Provider"}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{req.location} · {new Date(req.createdAt).toLocaleDateString()}</p>
                          </div>

                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            req.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : req.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : req.status === "ACCEPTED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              TAB 2: USERS DIRECTORY (FULL PAGINATION & ALL ROLES)
          ======================================================= */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {/* Users Header & Filters */}
              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#24342E]">Complete Users Directory</h2>
                    <p className="text-xs text-[#6F7D76]">
                      All registered accounts across public users, blood donors, community providers, and organizations.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && loadUsers(1)}
                        placeholder="Search name, email, phone..."
                        className="h-9 w-52 rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:bg-white focus:border-[#24342E]"
                      />
                    </div>

                    {/* Role Filter */}
                    <select
                      value={userRoleFilter}
                      onChange={(e) => {
                        setUserRoleFilter(e.target.value);
                      }}
                      className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-2.5 text-xs text-[#24342E] outline-none focus:bg-white"
                    >
                      <option value="ALL">All Roles</option>
                      <option value="PUBLIC_USER">Public Users</option>
                      <option value="DONOR">Registered Donors</option>
                      <option value="PROVIDER">Community Providers</option>
                      <option value="BLOOD_BANK">Blood Banks</option>
                      <option value="HOSPITAL">Hospitals</option>
                      <option value="SERVICE_PROVIDER">Service Providers</option>
                      <option value="ADMIN">Administrators</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      value={userStatusFilter}
                      onChange={(e) => {
                        setUserStatusFilter(e.target.value);
                      }}
                      className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-2.5 text-xs text-[#24342E] outline-none focus:bg-white"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => loadUsers(1)}
                      className="rounded-xl bg-[#24342E] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800"
                    >
                      Filter
                    </button>
                  </div>
                </div>

                {/* Sub-counters summary */}
                {userSummary && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-[#6F7D76]">
                    <span>Total Database Users: <strong className="text-slate-900">{userSummary.totalAllUsers}</strong></span>
                    <span>Public Accounts: <strong className="text-slate-900">{userSummary.totalPublicUsers}</strong></span>
                    <span>Blood Donors: <strong className="text-rose-700">{userSummary.totalDonors}</strong></span>
                    <span>Community Providers: <strong className="text-blue-700">{userSummary.totalProviders}</strong></span>
                    <span>Suspended: <strong className="text-rose-600">{userSummary.totalSuspended}</strong></span>
                  </div>
                )}
              </div>

              {/* Users Table */}
              <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-2xs">
                {usersLoading ? (
                  <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
                    <span>Loading paginated users...</span>
                  </div>
                ) : users.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    No users matching the selected filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[#6F7D76] font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-4">Role & Profiles</th>
                          <th className="py-3 px-4">Contact</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-4">Registered</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[11px] text-slate-500">{u.email}</p>
                            </td>

                            <td className="py-3 px-4">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  u.role === "ADMIN"
                                    ? "bg-slate-900 text-white"
                                    : u.role === "PUBLIC_USER"
                                    ? "bg-slate-100 text-slate-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}>
                                  {u.role?.replace("_", " ")}
                                </span>

                                {u.donorProfile && (
                                  <span className="rounded-md bg-rose-50 border border-rose-200 px-1.5 py-0.2 text-[9px] font-bold text-rose-700">
                                    Donor: {u.donorProfile.bloodGroup} {u.donorProfile.availability ? "●" : "○"}
                                  </span>
                                )}

                                {u.providerProfile && (
                                  <span className="rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                                    Helper: {u.providerProfile.serviceType}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-700">{u.phone || "—"}</td>
                            <td className="py-3 px-4 text-slate-700">{u.location || "—"}</td>
                            <td className="py-3 px-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>

                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                u.accountStatus === "SUSPENDED"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  u.accountStatus === "SUSPENDED" ? "bg-rose-600" : "bg-emerald-600"
                                }`} />
                                {u.accountStatus || "ACTIVE"}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedUserDetail(u)}
                                  className="p-1 text-slate-500 hover:text-slate-800 rounded"
                                  title="Inspect details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                {u.role !== "ADMIN" && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserStatus(u._id, u.accountStatus)}
                                    disabled={actionLoadingId === u._id}
                                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                                      u.accountStatus === "SUSPENDED"
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                        : "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100"
                                    }`}
                                  >
                                    {actionLoadingId === u._id
                                      ? "Updating..."
                                      : u.accountStatus === "SUSPENDED"
                                      ? "Reactivate"
                                      : "Suspend"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Showing {users.length > 0 ? (userPage - 1) * 15 + 1 : 0} to{" "}
                    {Math.min(userPage * 15, userTotal)} of {userTotal} users
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (userPage > 1) {
                          setUserPage((p) => p - 1);
                          loadUsers(userPage - 1);
                        }
                      }}
                      disabled={userPage <= 1}
                      className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-bold text-slate-800 px-2">Page {userPage} of {userTotalPages}</span>
                    <button
                      onClick={() => {
                        if (userPage < userTotalPages) {
                          setUserPage((p) => p + 1);
                          loadUsers(userPage + 1);
                        }
                      }}
                      disabled={userPage >= userTotalPages}
                      className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              TAB 3: ORGANIZATIONS (VERIFICATION & APPROVAL ACTIONS)
          ======================================================= */}
          {activeTab === "organizations" && (
            <div className="space-y-4">
              {/* Summary Badges Bar */}
              {orgSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  <div className="rounded-xl border border-slate-300 bg-white p-3 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Orgs</span>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{orgSummary.total}</p>
                  </div>
                  <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-3 text-center">
                    <span className="text-[10px] text-amber-800 uppercase font-semibold">Pending</span>
                    <p className="text-xl font-black text-amber-900 mt-0.5">{orgSummary.pending}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-3 text-center">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold">Approved</span>
                    <p className="text-xl font-black text-emerald-950 mt-0.5">{orgSummary.approved}</p>
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-center">
                    <span className="text-[10px] text-rose-800 uppercase font-semibold">Suspended</span>
                    <p className="text-xl font-black text-rose-900 mt-0.5">{orgSummary.suspended}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Blood Banks</span>
                    <p className="text-xl font-black text-rose-700 mt-0.5">{orgSummary.bloodBanks}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Hospitals</span>
                    <p className="text-xl font-black text-blue-700 mt-0.5">{orgSummary.hospitals}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Service Orgs</span>
                    <p className="text-xl font-black text-slate-800 mt-0.5">{orgSummary.serviceProviders}</p>
                  </div>
                </div>
              )}

              {/* Filter controls */}
              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#24342E]">Accredited Organizations</h2>
                    <p className="text-xs text-[#6F7D76]">
                      Review compliance details, official registration numbers, and manage operational privileges.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={orgSearch}
                        onChange={(e) => setOrgSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && loadOrganizations(1)}
                        placeholder="Search org, reg number, city..."
                        className="h-9 w-52 rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:bg-white focus:border-[#24342E]"
                      />
                    </div>

                    {/* Status */}
                    <select
                      value={orgStatusFilter}
                      onChange={(e) => setOrgStatusFilter(e.target.value)}
                      className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-2.5 text-xs text-[#24342E] outline-none focus:bg-white"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">Pending Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="REJECTED">Rejected</option>
                    </select>

                    {/* Type */}
                    <select
                      value={orgTypeFilter}
                      onChange={(e) => setOrgTypeFilter(e.target.value)}
                      className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-2.5 text-xs text-[#24342E] outline-none focus:bg-white"
                    >
                      <option value="ALL">All Types</option>
                      <option value="BLOOD_BANK">Blood Bank</option>
                      <option value="HOSPITAL">Hospital</option>
                      <option value="SERVICE_PROVIDER">Service Provider</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => loadOrganizations(1)}
                      className="rounded-xl bg-[#24342E] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800"
                    >
                      Filter
                    </button>
                  </div>
                </div>
              </div>

              {/* Organizations Table */}
              <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-2xs">
                {orgsLoading ? (
                  <div className="py-16 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
                    <span>Loading organizations...</span>
                  </div>
                ) : orgs.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">
                    No organizations matching the current query.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[#6F7D76] font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Organization</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Contact Person</th>
                          <th className="py-3 px-4">Registration ID</th>
                          <th className="py-3 px-4">Operations Status</th>
                          <th className="py-3 px-4">Supply / Services</th>
                          <th className="py-3 px-4 text-right">Decision Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orgs.map((o) => (
                          <tr key={o._id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{o.organizationName || o.name}</p>
                              <p className="text-[11px] text-slate-500">{o.email} · {o.location || "City not set"}</p>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                o.role === "BLOOD_BANK"
                                  ? "bg-rose-100 text-rose-800"
                                  : o.role === "HOSPITAL"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}>
                                {o.role?.replace("_", " ")}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <p className="text-slate-800 font-medium">{o.name}</p>
                              <p className="text-[10px] text-slate-500">{o.phone}</p>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-mono text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                {o.registrationNumber || "Unspecified"}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                o.organizationStatus === "PENDING"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : o.organizationStatus === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : o.organizationStatus === "SUSPENDED"
                                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}>
                                {o.organizationStatus}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              {o.role === "SERVICE_PROVIDER" ? (
                                <span className="text-slate-700">{o.totalServicesCount || 0} active listings</span>
                              ) : (
                                <span className="font-bold text-[#C94C55]">{o.totalInventoryUnits || 0} units</span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrgDetail(o)}
                                  className="p-1 text-slate-500 hover:text-slate-800 rounded"
                                  title="Inspect Organization"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                {o.organizationStatus === "PENDING" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openStatusModal(o, "APPROVED")}
                                      className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-2xs"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openStatusModal(o, "REJECTED")}
                                      className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 text-[11px] font-bold hover:bg-rose-100"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}

                                {o.organizationStatus === "APPROVED" && (
                                  <button
                                    type="button"
                                    onClick={() => openStatusModal(o, "SUSPENDED")}
                                    className="rounded-lg bg-slate-100 text-slate-700 px-2.5 py-1 text-[11px] font-semibold hover:bg-rose-50 hover:text-rose-700"
                                  >
                                    Suspend
                                  </button>
                                )}

                                {o.organizationStatus === "SUSPENDED" && (
                                  <button
                                    type="button"
                                    onClick={() => openStatusModal(o, "APPROVED")}
                                    className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-2xs"
                                  >
                                    Reactivate
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Showing {orgs.length > 0 ? (orgPage - 1) * 15 + 1 : 0} to{" "}
                    {Math.min(orgPage * 15, orgTotal)} of {orgTotal} organizations
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (orgPage > 1) {
                          setOrgPage((p) => p - 1);
                          loadOrganizations(orgPage - 1);
                        }
                      }}
                      disabled={orgPage <= 1}
                      className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-bold text-slate-800 px-2">Page {orgPage} of {orgTotalPages}</span>
                    <button
                      onClick={() => {
                        if (orgPage < orgTotalPages) {
                          setOrgPage((p) => p + 1);
                          loadOrganizations(orgPage + 1);
                        }
                      }}
                      disabled={orgPage >= orgTotalPages}
                      className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              TAB 4: BLOOD CENTERS & INVENTORIES
          ======================================================= */}
          {activeTab === "blood" && (
            <div className="space-y-4">
              {/* Aggregate Banner */}
              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#24342E]">Platform Blood Supply & Centers</h2>
                    <p className="text-xs text-[#6F7D76]">
                      Aggregated stock levels across all registered blood banks and hospital transfusion centers.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={bloodSearch}
                        onChange={(e) => setBloodSearch(e.target.value)}
                        placeholder="Search facility or city..."
                        className="h-9 w-52 rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:bg-white focus:border-[#24342E]"
                      />
                    </div>
                  </div>
                </div>

                {aggregateInventory && (
                  <div className="mt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Aggregate Supply Across All Centers</span>
                    <div className="mt-2 grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {bloodGroups.map((grp) => (
                        <div key={grp} className="rounded-xl border border-rose-200 bg-rose-50/50 p-2.5 text-center">
                          <span className="text-xs font-bold text-[#C94C55]">{grp}</span>
                          <p className="text-lg font-black text-slate-900 mt-1">{aggregateInventory[grp] || 0}</p>
                          <span className="text-[9px] text-slate-500">units</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Centers Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                {bloodLoading ? (
                  <div className="col-span-2 py-16 text-center text-xs text-slate-400">Loading blood center inventories...</div>
                ) : filteredBloodOrgs.length === 0 ? (
                  <div className="col-span-2 py-16 text-center text-xs text-slate-400">No blood organizations found.</div>
                ) : (
                  filteredBloodOrgs.map((center) => (
                    <div key={center._id} className="rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-[#24342E]">{center.organizationName || center.name}</h3>
                            <span className="rounded bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.2">
                              {center.role?.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-xs text-[#6F7D76] mt-0.5">{center.location || center.address || "Address unspecified"}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Reg ID: {center.registrationNumber || "Unstated"} · Phone: {center.phone}</p>
                        </div>

                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          center.organizationStatus === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {center.organizationStatus}
                        </span>
                      </div>

                      {/* Units Pills */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-semibold text-slate-600">Stock Availability</span>
                          <span className="font-bold text-[#C94C55]">{center.totalUnits || 0} Total Units</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
                          {bloodGroups.map((grp) => {
                            const count = center.inventory?.[grp] || 0;
                            return (
                              <div
                                key={grp}
                                className={`rounded-lg py-1 px-1 border ${
                                  count > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-400"
                                }`}
                              >
                                <span className="text-[10px] font-bold block">{grp}</span>
                                <span className="text-xs font-black">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span>Last Updated: {center.inventoryLastUpdated ? new Date(center.inventoryLastUpdated).toLocaleString() : "Never"}</span>
                        <span>Contact: {center.email}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =======================================================
              TAB 5: SERVICES CATALOG
          ======================================================= */}
          {activeTab === "services" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#24342E]">Professional Services Catalog</h2>
                    <p className="text-xs text-[#6F7D76]">
                      Commercial service offerings published by approved private organizations and professional helpers.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && loadServices(1)}
                        placeholder="Search service title, category..."
                        className="h-9 w-52 rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:bg-white focus:border-[#24342E]"
                      />
                    </div>

                    <input
                      type="text"
                      value={serviceCategoryFilter === "ALL" ? "" : serviceCategoryFilter}
                      onChange={(e) => setServiceCategoryFilter(e.target.value || "ALL")}
                      placeholder="Category..."
                      className="h-9 w-28 rounded-xl border border-slate-300 bg-slate-50 px-2.5 text-xs text-[#24342E] outline-none focus:bg-white"
                    />

                    <select
                      value={serviceActiveFilter}
                      onChange={(e) => setServiceActiveFilter(e.target.value)}
                      className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-2.5 text-xs text-[#24342E] outline-none focus:bg-white"
                    >
                      <option value="ALL">All Status</option>
                      <option value="true">Active Only</option>
                      <option value="false">Suspended Only</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => loadServices(1)}
                      className="rounded-xl bg-[#24342E] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800"
                    >
                      Filter
                    </button>
                  </div>
                </div>
              </div>

              {/* Services Table */}
              <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-2xs">
                {servicesLoading ? (
                  <div className="py-16 text-center text-xs text-slate-500">Loading services catalog...</div>
                ) : services.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">No services found matching filters.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[#6F7D76] font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Service</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Provider / Org</th>
                          <th className="py-3 px-4">Pricing</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {services.map((srv) => (
                          <tr key={srv._id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{srv.title}</p>
                              <p className="text-[11px] text-slate-500 truncate max-w-xs">{srv.description}</p>
                            </td>

                            <td className="py-3 px-4">
                              <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                                {srv.category}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <p className="font-medium text-slate-800">{srv.organizationId?.organizationName || srv.organizationId?.name || "Provider"}</p>
                              <p className="text-[10px] text-slate-500">{srv.organizationId?.phone}</p>
                            </td>

                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900">₹{srv.pricing}</span>
                              <span className="text-[10px] text-slate-500 ml-1">/ {srv.pricingType}</span>
                            </td>

                            <td className="py-3 px-4 text-slate-700">{srv.location}</td>

                            <td className="py-3 px-4">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                srv.isActive
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}>
                                {srv.isActive ? "ACTIVE" : "SUSPENDED"}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleToggleService(srv._id, srv.isActive)}
                                disabled={actionLoadingId === srv._id}
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                                  srv.isActive
                                    ? "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100"
                                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                                }`}
                              >
                                {actionLoadingId === srv._id ? "..." : srv.isActive ? "Suspend" : "Activate"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span>Showing {services.length} of {serviceTotal} services</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (servicePage > 1) {
                          setServicePage((p) => p - 1);
                          loadServices(servicePage - 1);
                        }
                      }}
                      disabled={servicePage <= 1}
                      className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-bold text-slate-800 px-2">Page {servicePage} of {serviceTotalPages}</span>
                    <button
                      onClick={() => {
                        if (servicePage < serviceTotalPages) {
                          setServicePage((p) => p + 1);
                          loadServices(servicePage + 1);
                        }
                      }}
                      disabled={servicePage >= serviceTotalPages}
                      className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              TAB 6: REQUEST ECOSYSTEM (ACROSS ENTIRE PLATFORM)
          ======================================================= */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              {requestSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  <div className="rounded-xl border border-slate-300 bg-white p-3 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Total</span>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{requestSummary.total}</p>
                  </div>
                  <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-3 text-center">
                    <span className="text-[10px] text-amber-800 uppercase font-semibold">Pending</span>
                    <p className="text-xl font-black text-amber-900 mt-0.5">{requestSummary.pending}</p>
                  </div>
                  <div className="rounded-xl border border-blue-300 bg-blue-50/50 p-3 text-center">
                    <span className="text-[10px] text-blue-800 uppercase font-semibold">Accepted</span>
                    <p className="text-xl font-black text-blue-900 mt-0.5">{requestSummary.accepted}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-3 text-center">
                    <span className="text-[10px] text-emerald-800 uppercase font-semibold">Completed</span>
                    <p className="text-xl font-black text-emerald-900 mt-0.5">{requestSummary.completed}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Rejected</span>
                    <p className="text-xl font-black text-slate-700 mt-0.5">{requestSummary.rejected}</p>
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 text-center">
                    <span className="text-[10px] text-rose-800 uppercase font-semibold">Blood</span>
                    <p className="text-xl font-black text-rose-900 mt-0.5">{requestSummary.bloodRequests}</p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-center">
                    <span className="text-[10px] text-blue-800 uppercase font-semibold">Services</span>
                    <p className="text-xl font-black text-blue-900 mt-0.5">{requestSummary.serviceRequests}</p>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#24342E]">Platform-Wide Request Ecosystem</h2>
                    <p className="text-xs text-[#6F7D76]">
                      Monitor all blood emergency calls, institutional requests, and neighborhood service bookings.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={requestSearch}
                        onChange={(e) => setRequestSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && loadRequests(1)}
                        placeholder="Search requester, provider, city..."
                        className="h-9 w-52 rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:bg-white focus:border-[#24342E]"
                      />
                    </div>

                    <select
                      value={requestTypeFilter}
                      onChange={(e) => setRequestTypeFilter(e.target.value)}
                      className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-2.5 text-xs text-[#24342E] outline-none focus:bg-white"
                    >
                      <option value="ALL">All Types</option>
                      <option value="BLOOD">Blood</option>
                      <option value="SERVICE">Service</option>
                      <option value="JOB">Job</option>
                    </select>

                    <select
                      value={requestStatusFilter}
                      onChange={(e) => setRequestStatusFilter(e.target.value)}
                      className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-2.5 text-xs text-[#24342E] outline-none focus:bg-white"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="INCOMPLETED">Incompleted</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => loadRequests(1)}
                      className="rounded-xl bg-[#24342E] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800"
                    >
                      Filter
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-2xs">
                {requestsLoading ? (
                  <div className="py-16 text-center text-xs text-slate-500">Loading requests...</div>
                ) : requests.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">No requests found matching criteria.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[#6F7D76] font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Requester</th>
                          <th className="py-3 px-4">Provider / Recipient</th>
                          <th className="py-3 px-4">Details / Description</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">View</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {requests.map((r) => (
                          <tr key={r._id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-4">
                              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                r.type === "BLOOD" ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"
                              }`}>
                                {r.type}
                              </span>
                            </td>

                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{r.requesterId?.name || "Requester"}</p>
                              <p className="text-[11px] text-slate-500">{r.requesterId?.email}</p>
                            </td>

                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">
                                {r.providerId?.organizationName || r.providerId?.name || "Provider"}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {r.providerId?.role ? r.providerId.role.replace("_", " ") : "Community Partner"}
                              </p>
                            </td>

                            <td className="py-3 px-4 max-w-xs truncate text-slate-700">
                              {r.description}
                            </td>

                            <td className="py-3 px-4 text-slate-700">{r.location}</td>

                            <td className="py-3 px-4 text-slate-500">
                              {new Date(r.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </td>

                            <td className="py-3 px-4">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                r.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800"
                                  : r.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : r.status === "ACCEPTED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}>
                                {r.status}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedRequestDetail(r)}
                                className="p-1 text-slate-500 hover:text-slate-900 rounded"
                                title="Inspect request"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span>Showing {requests.length} of {requestTotal} requests</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (requestPage > 1) {
                          setRequestPage((p) => p - 1);
                          loadRequests(requestPage - 1);
                        }
                      }}
                      disabled={requestPage <= 1}
                      className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-bold text-slate-800 px-2">Page {requestPage} of {requestTotalPages}</span>
                    <button
                      onClick={() => {
                        if (requestPage < requestTotalPages) {
                          setRequestPage((p) => p + 1);
                          loadRequests(requestPage + 1);
                        }
                      }}
                      disabled={requestPage >= requestTotalPages}
                      className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =======================================================
              TAB 7: FEEDBACK & COMMUNITY AUDITS
          ======================================================= */}
          {activeTab === "feedback" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs">
                <h2 className="text-base font-bold text-[#24342E]">Community Feedback & Quality Reports</h2>
                <p className="text-xs text-[#6F7D76]">
                  Direct feedback submitted by community members regarding usability, responsiveness, and service reliability.
                </p>
              </div>

              {feedbacksLoading ? (
                <div className="py-16 text-center text-xs text-slate-500">Loading feedbacks...</div>
              ) : feedbacks.length === 0 ? (
                <div className="rounded-2xl border border-slate-300 bg-white p-12 text-center text-xs text-slate-400">
                  No community feedback submitted yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {feedbacks.map((fb) => (
                    <div key={fb._id} className="rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5">
                            {fb.userType || "Member"}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 mt-1">{fb.userId?.name || "Community Member"}</h4>
                          <p className="text-[11px] text-slate-500">{fb.userId?.email} · {fb.userId?.location || "Location unstated"}</p>
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Ease of Use</span>
                          <span className="font-bold text-slate-800">{fb.easeOfUse || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Usefulness</span>
                          <span className="font-bold text-slate-800">{fb.usefulness || "N/A"}</span>
                        </div>
                      </div>

                      {fb.suggestions && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Suggestions:</span>
                          <p className="text-xs text-slate-700 mt-0.5 italic">"{fb.suggestions}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* =======================================================
              TAB 8: AUDIT TRAIL
          ======================================================= */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-[#24342E]">Immutable Audit Trail</h2>
                    <p className="text-xs text-[#6F7D76]">
                      Comprehensive log of privileged actions, status transitions, and administrative security decisions.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && loadAuditLogs(1)}
                        placeholder="Search admin email, action..."
                        className="h-9 w-52 rounded-xl border border-slate-300 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:bg-white focus:border-[#24342E]"
                      />
                    </div>

                    <select
                      value={auditActionFilter}
                      onChange={(e) => setAuditActionFilter(e.target.value)}
                      className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-2.5 text-xs text-[#24342E] outline-none focus:bg-white"
                    >
                      <option value="ALL">All Actions</option>
                      <option value="USER_STATUS_UPDATE">User Status</option>
                      <option value="ORGANIZATION_STATUS_UPDATE">Org Status</option>
                      <option value="SERVICE_STATUS_TOGGLE">Service Status</option>
                    </select>

                    <select
                      value={auditTargetFilter}
                      onChange={(e) => setAuditTargetFilter(e.target.value)}
                      className="h-9 rounded-xl border border-slate-300 bg-slate-50 px-2.5 text-xs text-[#24342E] outline-none focus:bg-white"
                    >
                      <option value="ALL">All Targets</option>
                      <option value="USER">User</option>
                      <option value="ORGANIZATION">Organization</option>
                      <option value="SERVICE">Service</option>
                      <option value="REQUEST">Request</option>
                      <option value="SYSTEM">System</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => loadAuditLogs(1)}
                      className="rounded-xl bg-[#24342E] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800"
                    >
                      Filter
                    </button>
                  </div>
                </div>
              </div>

              {/* Logs Table */}
              <div className="rounded-2xl border border-slate-300 bg-white overflow-hidden shadow-2xs">
                {auditLoading ? (
                  <div className="py-16 text-center text-xs text-slate-500">Loading audit trail...</div>
                ) : auditLogs.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400">No audit records match the query.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[#6F7D76] font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">Action</th>
                          <th className="py-3 px-4">Actor Email</th>
                          <th className="py-3 px-4">Target Type</th>
                          <th className="py-3 px-4">Target ID</th>
                          <th className="py-3 px-4 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {auditLogs.map((log) => {
                          const isExpanded = expandedLogId === log._id;
                          return (
                            <tr key={log._id} className="hover:bg-slate-50/60 transition">
                              <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                              </td>

                              <td className="py-3 px-4">
                                <span className="rounded bg-slate-900 text-white font-mono px-2 py-0.5 text-[10px] font-bold">
                                  {log.action}
                                </span>
                              </td>

                              <td className="py-3 px-4 font-medium text-slate-800">{log.adminEmail}</td>

                              <td className="py-3 px-4">
                                <span className="rounded bg-slate-100 text-slate-800 px-2 py-0.5 text-[10px] font-semibold">
                                  {log.targetType}
                                </span>
                              </td>

                              <td className="py-3 px-4 font-mono text-slate-500 text-[11px] truncate max-w-xs">
                                {log.targetId || "—"}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                                  className="text-xs font-semibold text-emerald-700 hover:underline"
                                >
                                  {isExpanded ? "Hide" : "Inspect"}
                                </button>
                                {isExpanded && (
                                  <pre className="mt-2 text-left bg-slate-900 text-emerald-400 p-2.5 rounded-lg text-[10px] overflow-x-auto max-w-sm">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span>Showing {auditLogs.length} of {auditTotal} audit events</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (auditPage > 1) {
                          setAuditPage((p) => p - 1);
                          loadAuditLogs(auditPage - 1);
                        }
                      }}
                      disabled={auditPage <= 1}
                      className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-bold text-slate-800 px-2">Page {auditPage} of {auditTotalPages}</span>
                    <button
                      onClick={() => {
                        if (auditPage < auditTotalPages) {
                          setAuditPage((p) => p + 1);
                          loadAuditLogs(auditPage + 1);
                        }
                      }}
                      disabled={auditPage >= auditTotalPages}
                      className="p-1.5 rounded-lg border border-slate-300 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =======================================================
          MODAL 1: ORGANIZATION DECISION MODAL (APPROVE / REJECT / SUSPEND)
      ======================================================= */}
      {statusModalOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  statusModalAction === "APPROVED"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}>
                  Action: {statusModalAction}
                </span>
                <h3 className="font-bold text-base text-[#24342E] mt-1">
                  {statusModalAction === "APPROVED" ? "Approve Organization" : `${statusModalAction} Organization`}
                </h3>
              </div>
              <button onClick={() => setStatusModalOrg(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are updating operational permissions for{" "}
              <strong>{statusModalOrg.organizationName || statusModalOrg.name}</strong> ({statusModalOrg.role?.replace("_", " ")}).
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative Notes (Optional / Sent to organization)
              </label>
              <textarea
                value={statusModalNotes}
                onChange={(e) => setStatusModalNotes(e.target.value)}
                rows={3}
                placeholder="Specify credentials verified or reason for decision..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 outline-none focus:border-[#24342E]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStatusModalOrg(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOrgStatus}
                disabled={statusSubmitting}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-2xs ${
                  statusModalAction === "APPROVED"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {statusSubmitting ? "Persisting..." : `Confirm ${statusModalAction}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 2: USER DETAILS INSPECTOR
      ======================================================= */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-300 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">User Profile Record</span>
                <h3 className="font-bold text-lg text-[#24342E]">{selectedUserDetail.name}</h3>
                <p className="text-xs text-slate-500">{selectedUserDetail.email}</p>
              </div>
              <button onClick={() => setSelectedUserDetail(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block">Role</span>
                  <span className="font-bold text-slate-800">{selectedUserDetail.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Account Status</span>
                  <span className="font-bold text-slate-800">{selectedUserDetail.accountStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Phone Number</span>
                  <span className="font-bold text-slate-800">{selectedUserDetail.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Location / City</span>
                  <span className="font-bold text-slate-800">{selectedUserDetail.location || "—"}</span>
                </div>
              </div>

              {selectedUserDetail.donorProfile && (
                <div className="border border-rose-200 bg-rose-50/50 p-3 rounded-xl">
                  <h4 className="font-bold text-xs text-rose-900 flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5" />
                    Blood Donor Registry Details
                  </h4>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Blood Group</span>
                      <span className="font-bold text-rose-800">{selectedUserDetail.donorProfile.bloodGroup}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Availability</span>
                      <span className="font-bold text-slate-800">{selectedUserDetail.donorProfile.availability ? "Active" : "Paused"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Report Status</span>
                      <span className="font-bold text-slate-800">{selectedUserDetail.donorProfile.verificationStatus}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedUserDetail.providerProfile && (
                <div className="border border-blue-200 bg-blue-50/50 p-3 rounded-xl">
                  <h4 className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5" />
                    Community Provider Details
                  </h4>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Service</span>
                      <span className="font-bold text-blue-800">{selectedUserDetail.providerProfile.serviceType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Rate Model</span>
                      <span className="font-bold text-slate-800">{selectedUserDetail.providerProfile.rateType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Status</span>
                      <span className="font-bold text-slate-800">{selectedUserDetail.providerProfile.status}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 3: ORGANIZATION DETAILS INSPECTOR
      ======================================================= */}
      {selectedOrgDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-300 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Legal Organization Record</span>
                <h3 className="font-bold text-lg text-[#24342E]">{selectedOrgDetail.organizationName || selectedOrgDetail.name}</h3>
                <p className="text-xs text-slate-500">{selectedOrgDetail.email}</p>
              </div>
              <button onClick={() => setSelectedOrgDetail(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block">Role Type</span>
                  <span className="font-bold text-slate-800">{selectedOrgDetail.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Approval Status</span>
                  <span className="font-bold text-slate-800">{selectedOrgDetail.organizationStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Registration Number</span>
                  <span className="font-bold font-mono text-slate-800">{selectedOrgDetail.registrationNumber || "Unstated"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Contact Person</span>
                  <span className="font-bold text-slate-800">{selectedOrgDetail.name} ({selectedOrgDetail.phone})</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Official Address:</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {selectedOrgDetail.address || selectedOrgDetail.location || "No street address specified."}
                </p>
              </div>

              {selectedOrgDetail.bio && (
                <div>
                  <span className="text-slate-500 font-bold block mb-1">Organization Bio:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">{selectedOrgDetail.bio}</p>
                </div>
              )}

              {selectedOrgDetail.licenseDocument && (
                <div className="flex items-center justify-between p-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-900">
                  <span>Official License Document submitted</span>
                  <a
                    href={selectedOrgDetail.licenseDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold inline-flex items-center gap-1 underline"
                  >
                    View Document <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrgDetail(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          MODAL 4: REQUEST DETAILS INSPECTOR
      ======================================================= */}
      {selectedRequestDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-300 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Platform Connection Record</span>
                <h3 className="font-bold text-lg text-[#24342E]">Request #{selectedRequestDetail._id.slice(-6)}</h3>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  selectedRequestDetail.type === "BLOOD" ? "bg-rose-100 text-rose-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {selectedRequestDetail.type} Connection
                </span>
              </div>
              <button onClick={() => setSelectedRequestDetail(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block">Requester</span>
                  <span className="font-bold text-slate-800">{selectedRequestDetail.requesterId?.name || "Requester"}</span>
                  <span className="text-[11px] text-slate-500 block">{selectedRequestDetail.requesterId?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Recipient / Provider</span>
                  <span className="font-bold text-slate-800">
                    {selectedRequestDetail.providerId?.organizationName || selectedRequestDetail.providerId?.name || "Provider"}
                  </span>
                  <span className="text-[11px] text-slate-500 block">{selectedRequestDetail.providerId?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Current Status</span>
                  <span className="font-bold text-slate-800">{selectedRequestDetail.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Creation Timestamp</span>
                  <span className="font-bold text-slate-800">{new Date(selectedRequestDetail.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Details & Message:</span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedRequestDetail.description}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Location of Request:</span>
                <p className="text-slate-800 font-medium">{selectedRequestDetail.location}</p>
              </div>
            </div>

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRequestDetail(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
