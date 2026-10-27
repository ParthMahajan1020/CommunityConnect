import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Droplets,
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
  Save,
  Plus,
  Trash2,
  Phone,
  MapPin,
  ShieldAlert,
  Loader2,
  Inbox,
  LayoutDashboard,
  Info,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  Lock
} from "lucide-react";

import {
  getOrgProfile,
  updateOrgProfile,
  getOrgInventory,
  updateOrgInventory,
  getOrgServices,
  addOrgService,
  updateOrgService,
  deleteOrgService,
  getOrgRequests,
  updateOrgRequestStatus,
  logoutUser
} from "../../services/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PrivateDashboard() {
  const navigate = useNavigate();

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'inventory' | 'services' | 'requests' | 'profile'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  // Data states
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Inventory state
  const [inventory, setInventory] = useState({
    "A+": 0, "A-": 0, "B+": 0, "B-": 0,
    "AB+": 0, "AB-": 0, "O+": 0, "O-": 0
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [savingInventory, setSavingInventory] = useState(false);

  // Professional services state
  const [services, setServices] = useState([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("ALL");
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newService, setNewService] = useState({
    title: "",
    category: "Plumbing",
    description: "",
    pricing: 0,
    pricingType: "Hourly",
    location: "",
    availability: true
  });
  const [addingService, setAddingService] = useState(false);

  // Requests state
  const [requests, setRequests] = useState([]);
  const [requestSummary, setRequestSummary] = useState({ total: 0, pending: 0, accepted: 0, completed: 0, rejected: 0 });
  const [requestStatusFilter, setRequestStatusFilter] = useState("ALL");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestPage, setRequestPage] = useState(1);
  const [requestTotalPages, setRequestTotalPages] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    location: "",
    address: "",
    bio: ""
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const isBloodOrg = org?.role === "BLOOD_BANK" || org?.role === "HOSPITAL";
  const isServiceProvider = org?.role === "SERVICE_PROVIDER";
  const isApproved = org?.organizationStatus === "APPROVED";
  const isPending = org?.organizationStatus === "PENDING";
  const isSuspended = org?.organizationStatus === "SUSPENDED";
  const isRejected = org?.organizationStatus === "REJECTED";

  // Flash message helper
  const showToast = (msg, isErr = false) => {
    if (isErr) {
      setError(msg);
      setTimeout(() => setError(""), 6000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 5000);
    }
  };

  // Main loader
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const profileRes = await getOrgProfile();
      setError("");
      const organization = profileRes.organization;
      setOrg(organization);

      setProfileForm({
        name: organization.name || "",
        phone: organization.phone || "",
        location: organization.location || "",
        address: organization.address || "",
        bio: organization.bio || ""
      });

      // If approved, load operational sub-modules
      if (organization.organizationStatus === "APPROVED") {
        // Inventory for blood centers
        if (organization.role === "BLOOD_BANK" || organization.role === "HOSPITAL") {
          try {
            const invRes = await getOrgInventory();
            if (invRes.inventory) setInventory(invRes.inventory);
            if (invRes.lastUpdated) setLastUpdated(invRes.lastUpdated);
          } catch (invErr) {
            console.error("Inventory fetch error:", invErr.message);
          }
        }

        // Services for professional providers
        if (organization.role === "SERVICE_PROVIDER") {
          try {
            const srvRes = await getOrgServices();
            setServices(srvRes.services || []);
          } catch (srvErr) {
            console.error("Services fetch error:", srvErr.message);
          }
        }

        // Requests for all organizations
        try {
          const reqRes = await getOrgRequests({
            status: requestStatusFilter === "ALL" ? "" : requestStatusFilter,
            search: requestSearch,
            page: requestPage,
            limit: 10
          });
          setRequests(reqRes.requests || []);
          setRequestTotalPages(reqRes.totalPages || 1);
          if (reqRes.summary) {
            setRequestSummary(reqRes.summary);
          }
        } catch (reqErr) {
          console.error("Requests fetch error:", reqErr.message);
        }
      }

      setLastSyncTime(new Date());
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load organization records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestStatusFilter, requestSearch, requestPage]);

  // Initial load
  useEffect(() => {
    let ignore = false;
    async function init() {
      if (!ignore) {
        await loadDashboardData(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch requests when filters change
  const fetchFilteredRequests = async (status, search, page) => {
    try {
      const reqRes = await getOrgRequests({
        status: status === "ALL" ? "" : status,
        search,
        page,
        limit: 10
      });
      setRequests(reqRes.requests || []);
      setRequestTotalPages(reqRes.totalPages || 1);
      if (reqRes.summary) {
        setRequestSummary(reqRes.summary);
      }
    } catch (err) {
      console.error("Filter request error:", err.message);
    }
  };

  const handleStatusFilterChange = (newStatus) => {
    setRequestStatusFilter(newStatus);
    setRequestPage(1);
    fetchFilteredRequests(newStatus, requestSearch, 1);
  };

  const handleRequestSearchSubmit = (e) => {
    e.preventDefault();
    setRequestPage(1);
    fetchFilteredRequests(requestStatusFilter, requestSearch, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > requestTotalPages) return;
    setRequestPage(newPage);
    fetchFilteredRequests(requestStatusFilter, requestSearch, newPage);
  };

  // Inventory modifications
  const handleInventoryChange = (group, delta) => {
    if (!isApproved) return;
    setInventory((prev) => {
      const current = Number(prev[group]) || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [group]: next };
    });
  };

  const handleInventoryInput = (group, value) => {
    if (!isApproved) return;
    const num = Math.max(0, parseInt(value, 10) || 0);
    setInventory((prev) => ({ ...prev, [group]: num }));
  };

  const handleSaveInventory = async () => {
    if (!isApproved) return;
    setSavingInventory(true);
    try {
      const res = await updateOrgInventory(inventory);
      setInventory(res.inventory);
      setLastUpdated(res.lastUpdated);
      showToast("Blood inventory successfully synchronized with public registry.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to synchronize blood inventory.", true);
    } finally {
      setSavingInventory(false);
    }
  };

  // Professional service operations
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!isApproved) return;

    if (!newService.title.trim() || !newService.category.trim() || !newService.location.trim()) {
      showToast("Please provide service title, category, and locality.", true);
      return;
    }

    setAddingService(true);
    try {
      await addOrgService(newService);
      setShowAddServiceModal(false);
      setNewService({
        title: "",
        category: "Plumbing",
        description: "",
        pricing: 0,
        pricingType: "Hourly",
        location: org?.location || "",
        availability: true
      });
      const srvRes = await getOrgServices();
      setServices(srvRes.services || []);
      showToast("Professional service published to community directory.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to publish service listing.", true);
    } finally {
      setAddingService(false);
    }
  };

  const handleToggleServiceAvailability = async (service) => {
    try {
      await updateOrgService(service._id, {
        availability: !service.availability
      });
      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? { ...s, availability: !s.availability } : s))
      );
      showToast(`Service status updated to ${!service.availability ? "Active" : "Paused"}.`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update service availability.", true);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Deactivate this service listing from public discovery?")) return;
    try {
      await deleteOrgService(serviceId);
      setServices((prev) => prev.filter((s) => s._id !== serviceId));
      showToast("Service listing removed.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to remove service.", true);
    }
  };

  // Request actions (ACCEPT, REJECT, COMPLETE)
  const handleRequestStatusChange = async (requestId, nextStatus) => {
    setActionLoadingId(requestId);
    try {
      await updateOrgRequestStatus(requestId, nextStatus);
      showToast(`Request transitioned to ${nextStatus.toLowerCase()}.`);
      // Refresh current page
      await fetchFilteredRequests(requestStatusFilter, requestSearch, requestPage);
    } catch (err) {
      showToast(err?.response?.data?.message || `Failed to update request to ${nextStatus}.`, true);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Profile update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await updateOrgProfile(profileForm);
      setOrg((prev) => ({ ...prev, ...res.organization }));
      showToast("Organization identity details updated successfully.");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update profile.", true);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/private/login");
  };

  // Inventory computations
  const totalInventoryCount = useMemo(() => {
    return Object.values(inventory).reduce((acc, v) => acc + (Number(v) || 0), 0);
  }, [inventory]);

  const lowStockGroups = useMemo(() => {
    return bloodGroups.filter((g) => (inventory[g] || 0) < 5);
  }, [inventory]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchCat = serviceCategoryFilter === "ALL" || srv.category.toLowerCase() === serviceCategoryFilter.toLowerCase();
      const matchSearch = !serviceSearch.trim() ||
        srv.title.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        srv.description.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        srv.location.toLowerCase().includes(serviceSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, serviceCategoryFilter, serviceSearch]);

  const serviceCategories = useMemo(() => {
    const cats = new Set(services.map((s) => s.category).filter(Boolean));
    return ["ALL", ...Array.from(cats)];
  }, [services]);

  // Loading spinner
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAF9]">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-[#D8E4F2] bg-white p-8 shadow-xs">
          <Loader2 className="h-8 w-8 animate-spin text-[#4B78A8]" />
          <p className="text-xs font-semibold text-[#24342E]">Connecting to Organization Portal...</p>
          <span className="text-[11px] text-[#6F7D76]">Verifying organizational credentials</span>
        </div>
      </div>
    );
  }

  // Navigation Items
  const navItems = [
    {
      id: "overview",
      label: "Operations Overview",
      icon: LayoutDashboard,
      badge: null
    },
    ...(isBloodOrg
      ? [
          {
            id: "inventory",
            label: "Blood Inventory",
            icon: Droplets,
            badge: `${totalInventoryCount} units`
          }
        ]
      : []),
    ...(isServiceProvider
      ? [
          {
            id: "services",
            label: "Manage Services",
            icon: Wrench,
            badge: services.length || null
          }
        ]
      : []),
    {
      id: "requests",
      label: "Connection Requests",
      icon: Inbox,
      badge: requestSummary.pending > 0 ? `${requestSummary.pending} new` : null,
      badgeColor: "bg-amber-100 text-amber-900 border border-amber-300"
    },
    {
      id: "profile",
      label: "Organization Profile",
      icon: Building2,
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#24342E] flex">
      {/* ========================================================= */}
      {/* SIDEBAR (DESKTOP & MOBILE DRAWER) */}
      {/* ========================================================= */}
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-[#D8E4F2] bg-white transition-all duration-300 ease-in-out lg:static ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Portal Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#D8E4F2] px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#4B78A8] shadow-2xs">
              <Building2 className="h-5 w-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="truncate">
                <span className="block font-bold text-xs tracking-tight text-[#24342E]">
                  Organization Portal
                </span>
                <span className="block text-[10px] font-medium text-[#6F7D76] truncate">
                  {org?.organizationName || org?.name}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden rounded-lg p-1.5 text-[#6F7D76] hover:bg-[#F8FAF9] lg:block"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Organization Status Pill (inside sidebar) */}
        {!sidebarCollapsed && (
          <div className="mx-3 mt-3 rounded-2xl border border-[#EEF2EF] bg-[#F8FAF9] p-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#6F7D76] font-medium">Status</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold text-[10px] ${
                  isApproved
                    ? "bg-emerald-100 text-emerald-800"
                    : isPending
                    ? "bg-amber-100 text-amber-900"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isApproved ? "bg-emerald-600" : isPending ? "bg-amber-600" : "bg-rose-600"
                  }`}
                />
                {org?.organizationStatus}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-[#6F7D76]">
              <span>Role:</span>
              <span className="font-semibold text-[#24342E]">{org?.role?.replace("_", " ")}</span>
            </div>
          </div>
        )}

        {/* Navigation Modules */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`group flex w-full items-center rounded-2xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#4B78A8] text-white shadow-xs"
                    : "text-[#55645E] hover:bg-[#F2F6FA] hover:text-[#24342E]"
                } ${sidebarCollapsed ? "justify-center" : "justify-between"}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-[#7B8B84] group-hover:text-[#4B78A8]"}`} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!sidebarCollapsed && item.badge && (
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : item.badgeColor || "bg-[#EAF1FA] text-[#4B78A8]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer in Sidebar */}
        <div className="border-t border-[#D8E4F2] p-3">
          {!sidebarCollapsed ? (
            <div className="rounded-2xl border border-[#EEF2EF] bg-[#F8FAF9] p-3">
              <div className="truncate">
                <p className="text-xs font-bold text-[#24342E] truncate">{org?.name}</p>
                <p className="text-[10px] text-[#6F7D76] truncate">{org?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#F2D5D8] bg-white py-1.5 text-xs font-semibold text-[#C94C55] transition hover:bg-[#FBEAEC]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-xl p-2 text-[#C94C55] hover:bg-[#FBEAEC]"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#D8E4F2] bg-white/90 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl p-1.5 text-[#6F7D76] hover:bg-[#F8FAF9] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#8C9892]">Organization Portal</span>
                <span className="text-xs text-[#8C9892]">/</span>
                <span className="text-xs font-bold text-[#24342E] capitalize">
                  {navItems.find((n) => n.id === activeTab)?.label || activeTab}
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-[#6F7D76]">
                Connected Entity: <strong>{org?.organizationName || org?.name}</strong> • Reg: {org?.registrationNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Sync Status */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-[#E2E9E4] bg-[#F8FAF9] px-3 py-1.5 text-[11px] text-[#6F7D76]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Synced {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <button
              type="button"
              onClick={() => loadDashboardData(true)}
              disabled={refreshing}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#D8E4F2] bg-white px-3 text-xs font-semibold text-[#24342E] shadow-2xs hover:bg-[#F7FAFD] disabled:opacity-50"
              title="Synchronize records with MongoDB"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#4B78A8]" : ""}`} />
              <span className="hidden md:inline">Sync</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#F2D5D8] bg-white px-3 text-xs font-semibold text-[#C94C55] shadow-2xs hover:bg-[#FBEAEC]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
          {/* System Toasts */}
          {error && (
            <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* APPLICATION STATUS BANNERS */}
          {/* ========================================================= */}
          {isPending && (
            <section className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/60 px-3 py-0.5 text-[11px] font-bold text-amber-900">
                    Application Under Administrative Review
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-amber-950">
                    Verification in Progress
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800 max-w-3xl">
                    Your organization registration details have been submitted to CommunityConnect administrative authorities.
                    To safeguard public recipients and medical emergency protocols, live inventory updates, service listings,
                    and community connection requests are locked until your legal registration credentials are confirmed.
                    You may view and update your contact information while awaiting activation.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-amber-900 border-t border-amber-200/60 pt-3">
                    <span>Registration ID: <code className="font-mono bg-white/60 px-1.5 py-0.5 rounded">{org?.registrationNumber}</code></span>
                    <span>Application Date: <strong>{new Date(org?.createdAt).toLocaleDateString()}</strong></span>
                    <span>Role Applied: <strong>{org?.role?.replace("_", " ")}</strong></span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {isSuspended && (
            <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-rose-950">Organization Account Suspended</h2>
                  <p className="mt-1 text-xs leading-relaxed text-rose-800 max-w-3xl">
                    Administrative action has temporarily suspended this organization's active operational status.
                    Your public listings and emergency requests are hidden from local community users.
                    Please contact platform administrators at <code>communityconnect.team5@gmail.com</code> for reactivation inquiries.
                  </p>
                </div>
              </div>
            </section>
          )}

          {isRejected && (
            <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-2xs">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-rose-950">Registration Not Approved</h2>
                  <p className="mt-1 text-xs leading-relaxed text-rose-800 max-w-3xl">
                    Our administrative team could not verify the submitted registration credentials.
                    Review your official documentation with platform administration or submit an updated application.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================= */}
          {/* TAB 1: OPERATIONS OVERVIEW */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Primary KPI Metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {isBloodOrg && (
                  <div className="rounded-3xl border border-[#F2D5D8] bg-white p-5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#C94C55]">
                        Total Blood Units
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FBEAEC] text-[#C94C55]">
                        <Droplets className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="mt-3 text-3xl font-bold text-[#24342E]">
                      {totalInventoryCount}{" "}
                      <span className="text-xs font-normal text-[#6F7D76]">units</span>
                    </p>
                    <p className="mt-1 text-[11px] text-[#6F7D76]">
                      {lowStockGroups.length > 0 ? (
                        <span className="text-amber-600 font-semibold">{lowStockGroups.length} groups low stock (&lt; 5)</span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">Stock adequate across all groups</span>
                      )}
                    </p>
                  </div>
                )}

                {isServiceProvider && (
                  <div className="rounded-3xl border border-[#D8E4F2] bg-white p-5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#4B78A8]">
                        Active Services
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#4B78A8]">
                        <Wrench className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="mt-3 text-3xl font-bold text-[#24342E]">{services.length}</p>
                    <p className="mt-1 text-[11px] text-[#6F7D76]">
                      {services.filter((s) => s.availability).length} currently accepting requests
                    </p>
                  </div>
                )}

                <div className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#427A65]">
                      Total Requests
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
                      <Inbox className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-[#24342E]">{requestSummary.total}</p>
                  <p className="mt-1 text-[11px] text-[#6F7D76]">Community connection volume</p>
                </div>

                <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                      Pending Action
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                      <Clock className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-[#24342E]">{requestSummary.pending}</p>
                  <p className="mt-1 text-[11px] text-amber-700 font-semibold">
                    {requestSummary.pending > 0 ? "Awaiting your response" : "Queue clear"}
                  </p>
                </div>

                <div className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#427A65]">
                      Fulfilled
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-[#24342E]">{requestSummary.completed}</p>
                  <p className="mt-1 text-[11px] text-[#6F7D76]">
                    {requestSummary.accepted} currently in progress
                  </p>
                </div>
              </div>

              {/* Organization Profile & Credentials Grid */}
              <div className="grid gap-6 lg:grid-cols-3">
                <section className="lg:col-span-2 rounded-3xl border border-[#D8E4F2] bg-white p-6 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#EEF2EF] pb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#24342E]">Verified Entity Credentials</h3>
                      <p className="text-xs text-[#6F7D76]">Official details recognized on CommunityConnect</p>
                    </div>
                    <span className="rounded-full bg-[#EAF1FA] px-3 py-1 text-xs font-bold text-[#4B78A8]">
                      {org?.role?.replace("_", " ")}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4">
                      <span className="text-[#8C9892] font-semibold">Legal Entity Name</span>
                      <p className="mt-1 text-sm font-bold text-[#24342E]">{org?.organizationName || org?.name}</p>
                    </div>
                    <div className="rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4">
                      <span className="text-[#8C9892] font-semibold">Registration / License Number</span>
                      <p className="mt-1 text-sm font-bold font-mono text-[#24342E]">{org?.registrationNumber || "N/A"}</p>
                    </div>
                    <div className="rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4">
                      <span className="text-[#8C9892] font-semibold">Authorized Representative</span>
                      <p className="mt-1 font-bold text-[#24342E]">{org?.name}</p>
                    </div>
                    <div className="rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4">
                      <span className="text-[#8C9892] font-semibold">Official Contact Phone</span>
                      <p className="mt-1 font-bold text-[#24342E]">{org?.phone}</p>
                    </div>
                    <div className="rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4 sm:col-span-2">
                      <span className="text-[#8C9892] font-semibold">Registered Facility Address</span>
                      <p className="mt-1 font-bold text-[#24342E]">{org?.address || "Address not provided"}, {org?.location}</p>
                    </div>
                  </div>
                </section>

                {/* Quick Shortcuts / Action Card */}
                <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#24342E]">Quick Actions</h3>
                    <p className="mt-1 text-xs text-[#6F7D76]">Standard operations shortcuts</p>

                    <div className="mt-4 space-y-2.5">
                      {isBloodOrg && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("inventory")}
                          className="flex w-full items-center justify-between rounded-2xl border border-[#F2D5D8] bg-[#FBEAEC]/40 p-3 text-xs font-semibold text-[#C94C55] transition hover:bg-[#FBEAEC]"
                        >
                          <span className="flex items-center gap-2">
                            <Droplets className="h-4 w-4" />
                            Update Blood Inventory
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}

                      {isServiceProvider && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("services")}
                          className="flex w-full items-center justify-between rounded-2xl border border-[#D8E4F2] bg-[#EAF1FA]/40 p-3 text-xs font-semibold text-[#4B78A8] transition hover:bg-[#EAF1FA]"
                        >
                          <span className="flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            Manage Service Listings
                          </span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setActiveTab("requests")}
                        className="flex w-full items-center justify-between rounded-2xl border border-[#E2E9E4] bg-[#F8FAF9] p-3 text-xs font-semibold text-[#24342E] transition hover:bg-white"
                      >
                        <span className="flex items-center gap-2">
                          <Inbox className="h-4 w-4 text-[#427A65]" />
                          Review Connection Requests
                        </span>
                        <ChevronRight className="h-4 w-4 text-[#8C9892]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("profile")}
                        className="flex w-full items-center justify-between rounded-2xl border border-[#E2E9E4] bg-[#F8FAF9] p-3 text-xs font-semibold text-[#24342E] transition hover:bg-white"
                      >
                        <span className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-[#4B78A8]" />
                          Edit Contact Details
                        </span>
                        <ChevronRight className="h-4 w-4 text-[#8C9892]" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[#EEF2EF] pt-4 text-[11px] text-[#6F7D76]">
                    CommunityConnect Verified Provider Network
                  </div>
                </section>
              </div>

              {/* Recent Pending Requests Feed Preview */}
              <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs">
                <div className="flex items-center justify-between border-b border-[#EEF2EF] pb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#24342E]">Incoming Requests Queue</h3>
                    <p className="text-xs text-[#6F7D76]">Latest connection inquiries from community members</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("requests")}
                    className="text-xs font-bold text-[#4B78A8] hover:underline"
                  >
                    View All ({requestSummary.total})
                  </button>
                </div>

                <div className="mt-4">
                  {requests.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#6F7D76]">
                      <Inbox className="mx-auto h-7 w-7 text-[#8C9892] mb-2" />
                      No requests received yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EEF2EF]">
                      {requests.slice(0, 4).map((req) => (
                        <div key={req._id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#24342E]">
                                {req.requesterId?.name || "Community Member"}
                              </span>
                              <span className="rounded-full bg-[#EAF1FA] px-2 py-0.5 text-[10px] font-bold text-[#4B78A8]">
                                {req.type}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  req.status === "ACCEPTED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : req.status === "COMPLETED"
                                    ? "bg-blue-100 text-blue-800"
                                    : req.status === "REJECTED"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-900"
                                }`}
                              >
                                {req.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#6F7D76] line-clamp-1 mt-0.5">{req.description}</p>
                          </div>
                          <span className="text-[11px] text-[#8C9892]">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: BLOOD INVENTORY MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === "inventory" && isBloodOrg && (
            <div className="space-y-6">
              {/* Medical Notice Banner */}
              <div className="rounded-2xl border border-[#D8E4F2] bg-[#F7FAFD] p-4 text-xs text-[#2A4B70] flex items-start gap-3">
                <Info className="h-5 w-5 shrink-0 text-[#4B78A8] mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Medical Disclaimer:</strong> Real-time blood inventory figures reported here are publicly searchable by citizens in emergency need. All transfusions and unit issuances require standard hospital compatibility screening and cross-matching protocols.
                </div>
              </div>

              <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EEF2EF] pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#24342E]">Blood Inventory Registry</h2>
                    <p className="mt-1 text-xs text-[#6F7D76]">
                      Adjust available units for each blood group. Units cannot be negative.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {lastUpdated && (
                      <span className="text-[11px] text-[#8C9892]">
                        Last synchronized: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveInventory}
                      disabled={savingInventory || !isApproved}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#C94C55] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#B53D46] disabled:opacity-50"
                    >
                      {savingInventory ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Synchronizing...
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          Save Inventory
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {!isApproved && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold text-amber-800">
                    <Lock className="inline h-3.5 w-3.5 mr-1 mb-0.5" />
                    Inventory modifications are read-only while your organization registration is under review.
                  </div>
                )}

                {/* 8 Blood Groups Matrix */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {bloodGroups.map((group) => {
                    const count = Number(inventory[group]) || 0;
                    const isLow = count < 5 && count > 0;
                    const isOut = count === 0;

                    return (
                      <div
                        key={group}
                        className={`flex flex-col justify-between rounded-3xl border p-5 transition shadow-2xs ${
                          isOut
                            ? "border-[#F2D5D8] bg-[#FDF9F9]"
                            : isLow
                            ? "border-amber-200 bg-amber-50/20"
                            : "border-[#E2E9E4] bg-white hover:border-[#4B78A8]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBEAEC] text-lg font-black text-[#C94C55]">
                            {group}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isOut
                                ? "bg-rose-100 text-rose-800"
                                : isLow
                                ? "bg-amber-100 text-amber-900"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {isOut ? "Out of Stock" : isLow ? "Low Supply" : "Available"}
                          </span>
                        </div>

                        <div className="my-5 text-center">
                          <div className="inline-flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              disabled={!isApproved}
                              value={count}
                              onChange={(e) => handleInventoryInput(group, e.target.value)}
                              className="h-12 w-24 rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] text-center font-mono text-2xl font-bold text-[#24342E] outline-none transition focus:border-[#C94C55] focus:bg-white disabled:opacity-60"
                            />
                            <span className="text-xs font-semibold text-[#6F7D76]">units</span>
                          </div>
                        </div>

                        {/* Increment / Decrement & Quick Presets */}
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={!isApproved || count <= 0}
                              onClick={() => handleInventoryChange(group, -1)}
                              className="flex h-9 flex-1 items-center justify-center rounded-xl border border-[#E2E9E4] bg-[#F8FAF9] text-base font-bold text-[#24342E] hover:bg-white disabled:opacity-40 transition"
                              title="Decrease 1 unit"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              disabled={!isApproved}
                              onClick={() => handleInventoryChange(group, 1)}
                              className="flex h-9 flex-1 items-center justify-center rounded-xl bg-[#C94C55] text-base font-bold text-white shadow-2xs hover:bg-[#B53D46] disabled:opacity-40 transition"
                              title="Add 1 unit"
                            >
                              +1
                            </button>
                          </div>

                          {isApproved && (
                            <div className="flex gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => handleInventoryChange(group, 5)}
                                className="flex-1 rounded-lg border border-[#EEF2EF] bg-white py-1 text-[10px] font-semibold text-[#6F7D76] hover:bg-[#F8FAF9]"
                              >
                                +5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInventoryChange(group, 10)}
                                className="flex-1 rounded-lg border border-[#EEF2EF] bg-white py-1 text-[10px] font-semibold text-[#6F7D76] hover:bg-[#F8FAF9]"
                              >
                                +10
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInventoryInput(group, 0)}
                                className="flex-1 rounded-lg border border-[#F2D5D8] bg-white py-1 text-[10px] font-semibold text-[#C94C55] hover:bg-[#FBEAEC]"
                              >
                                Zero
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PROFESSIONAL SERVICES MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === "services" && isServiceProvider && (
            <div className="space-y-6">
              <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EEF2EF] pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#24342E]">Professional Services Catalog</h2>
                    <p className="mt-1 text-xs text-[#6F7D76]">
                      Offerings published to the public Find Services marketplace.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddServiceModal(true)}
                    disabled={!isApproved}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#4B78A8] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#3D648E] disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Publish New Service
                  </button>
                </div>

                {!isApproved && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold text-amber-800">
                    <Lock className="inline h-3.5 w-3.5 mr-1 mb-0.5" />
                    Publishing services is locked pending administrative review of your organization.
                  </div>
                )}

                {/* Filters & Search */}
                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C9892]" />
                    <input
                      type="text"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      placeholder="Search services by title, description or locality..."
                      className="h-10 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {serviceCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setServiceCategoryFilter(cat)}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition ${
                          serviceCategoryFilter === cat
                            ? "bg-[#4B78A8] text-white"
                            : "border border-[#E2E9E4] bg-white text-[#6F7D76] hover:bg-[#F8FAF9]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Services List / Grid */}
                <div className="mt-6">
                  {filteredServices.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#6F7D76]">
                      <Wrench className="mx-auto h-8 w-8 text-[#8C9892] mb-2" />
                      {services.length === 0
                        ? 'No services published yet. Click "Publish New Service" to list your offerings.'
                        : "No services match your search or filter."}
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredServices.map((srv) => (
                        <div
                          key={srv._id}
                          className="flex flex-col justify-between rounded-3xl border border-[#D8E4F2] bg-white p-5 shadow-2xs hover:shadow-xs transition"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <span className="rounded-xl bg-[#EAF1FA] px-2.5 py-1 text-xs font-bold text-[#4B78A8]">
                                {srv.category}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleServiceAvailability(srv)}
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                                  srv.availability
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                                title="Click to toggle availability"
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${srv.availability ? "bg-emerald-600" : "bg-gray-400"}`} />
                                {srv.availability ? "Active" : "Paused"}
                              </button>
                            </div>

                            <h3 className="mt-3 text-sm font-bold text-[#24342E]">{srv.title}</h3>
                            <p className="mt-1 text-xs text-[#6F7D76] line-clamp-3 leading-relaxed">
                              {srv.description}
                            </p>

                            <div className="mt-4 space-y-1 text-xs text-[#6F7D76] border-t border-[#EEF2EF] pt-3">
                              <div className="flex items-center justify-between">
                                <span>Pricing:</span>
                                <span className="font-bold text-[#24342E]">
                                  {srv.pricing > 0 ? `₹${srv.pricing} / ${srv.pricingType}` : "Free / Contact for estimate"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <MapPin className="h-3.5 w-3.5 text-[#8C9892]" />
                                <span>{srv.location}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#EEF2EF] flex items-center justify-between">
                            <span className="text-[10px] text-[#8C9892]">
                              Added {new Date(srv.createdAt).toLocaleDateString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(srv._id)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#C94C55] hover:underline"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Add Service Modal */}
              {showAddServiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                  <div className="w-full max-w-lg rounded-3xl border border-[#D8E4F2] bg-white p-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#EEF2EF] pb-3">
                      <div>
                        <h3 className="text-base font-bold text-[#24342E]">Publish Professional Service</h3>
                        <p className="text-xs text-[#6F7D76]">Listed publicly under Find Services</p>
                      </div>
                      <button
                        onClick={() => setShowAddServiceModal(false)}
                        className="rounded-lg p-1 text-[#6F7D76] hover:bg-[#F8FAF9]"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddService} className="mt-4 space-y-3.5">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Category</label>
                        <input
                          type="text"
                          value={newService.category}
                          onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                          placeholder="e.g. Plumbing, Electrician, Cleaning, Ambulance"
                          required
                          className="h-10 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Service Listing Title</label>
                        <input
                          type="text"
                          value={newService.title}
                          onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                          placeholder="e.g. Master Plumbing & Leak Repair"
                          required
                          className="h-10 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Scope & Details</label>
                        <textarea
                          rows="3"
                          value={newService.description}
                          onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                          placeholder="Describe your capabilities, response time, and qualifications..."
                          required
                          className="w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] p-3 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Fee (₹)</label>
                          <input
                            type="number"
                            min="0"
                            value={newService.pricing}
                            onChange={(e) => setNewService({ ...newService, pricing: e.target.value })}
                            className="h-10 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Billing Basis</label>
                          <select
                            value={newService.pricingType}
                            onChange={(e) => setNewService({ ...newService, pricingType: e.target.value })}
                            className="h-10 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                          >
                            <option value="Hourly">Hourly</option>
                            <option value="Daily">Daily</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Fixed">Fixed Rate</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Coverage Locality</label>
                        <input
                          type="text"
                          value={newService.location}
                          onChange={(e) => setNewService({ ...newService, location: e.target.value })}
                          placeholder="e.g. Akurdi, Pune"
                          required
                          className="h-10 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-[#EEF2EF]">
                        <button
                          type="button"
                          onClick={() => setShowAddServiceModal(false)}
                          className="rounded-xl border border-[#E2E9E4] px-4 py-2 text-xs font-semibold text-[#6F7D76] hover:bg-[#F8FAF9]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={addingService}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#4B78A8] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {addingService ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Publish Listing"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CONNECTION REQUESTS MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === "requests" && (
            <div className="space-y-6">
              <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EEF2EF] pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#24342E]">Connection Requests</h2>
                    <p className="mt-1 text-xs text-[#6F7D76]">
                      Review, accept, and fulfill requests received from registered community members.
                    </p>
                  </div>

                  <span className="text-xs font-bold text-[#6F7D76]">
                    Total: {requestSummary.total} Requests
                  </span>
                </div>

                {/* Status Badges Filter Bar */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {[
                    { id: "ALL", label: "All Requests", count: requestSummary.total },
                    { id: "PENDING", label: "Pending", count: requestSummary.pending, color: "text-amber-800" },
                    { id: "ACCEPTED", label: "Accepted (In Progress)", count: requestSummary.accepted, color: "text-emerald-800" },
                    { id: "COMPLETED", label: "Completed", count: requestSummary.completed, color: "text-blue-800" },
                    { id: "REJECTED", label: "Rejected", count: requestSummary.rejected, color: "text-rose-800" }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => handleStatusFilterChange(filter.id)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                        requestStatusFilter === filter.id
                          ? "bg-[#4B78A8] text-white shadow-xs"
                          : "border border-[#E2E9E4] bg-white text-[#55645E] hover:bg-[#F8FAF9]"
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                          requestStatusFilter === filter.id ? "bg-white/20 text-white" : "bg-[#F0F4F2] text-[#24342E]"
                        }`}
                      >
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <form onSubmit={handleRequestSearchSubmit} className="mt-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C9892]" />
                    <input
                      type="text"
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      placeholder="Search requests by requester name, phone, or description..."
                      className="h-10 w-full rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] pl-10 pr-4 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-2xl bg-[#4B78A8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3D648E]"
                  >
                    Search
                  </button>
                </form>

                {/* Requests List */}
                <div className="mt-6">
                  {requests.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#6F7D76]">
                      <Inbox className="mx-auto h-8 w-8 text-[#8C9892] mb-2" />
                      No requests found matching your filter criteria.
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {requests.map((req) => {
                        const isPendingReq = req.status === "PENDING";
                        const isAcceptedReq = req.status === "ACCEPTED";
                        const isUpdating = actionLoadingId === req._id;

                        return (
                          <div
                            key={req._id}
                            className="flex flex-col justify-between rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs hover:shadow-xs transition"
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="rounded-full bg-[#EAF1FA] px-2.5 py-0.5 text-[10px] font-bold text-[#4B78A8]">
                                    {req.type}
                                  </span>
                                  <h3 className="mt-2 text-sm font-bold text-[#24342E]">
                                    {req.requesterId?.name || "Community Member"}
                                  </h3>
                                  <p className="text-[11px] text-[#6F7D76]">{req.requesterId?.email}</p>
                                </div>

                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                    req.status === "ACCEPTED"
                                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                      : req.status === "REJECTED"
                                      ? "bg-rose-50 text-rose-800 border border-rose-200"
                                      : req.status === "COMPLETED"
                                      ? "bg-blue-50 text-blue-800 border border-blue-200"
                                      : "bg-amber-50 text-amber-900 border border-amber-200"
                                  }`}
                                >
                                  {req.status}
                                </span>
                              </div>

                              <div className="mt-3 rounded-2xl bg-[#F8FAF9] p-3 text-xs leading-relaxed text-[#4A5952]">
                                <p className="font-semibold text-[#24342E]">Request Notes:</p>
                                <p className="mt-0.5">{req.description}</p>
                              </div>

                              <div className="mt-3 flex items-center justify-between text-xs text-[#6F7D76]">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-[#8C9892]" />
                                  <span>{req.location}</span>
                                </div>
                                <span className="text-[10px] text-[#8C9892]">
                                  {new Date(req.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Contact information & actions */}
                            <div className="mt-4 pt-3 border-t border-[#EEF2EF] space-y-2">
                              {/* Direct Contact Phone if Accepted or Completed */}
                              {(isAcceptedReq || req.status === "COMPLETED") && req.requesterId?.phone && (
                                <a
                                  href={`tel:${req.requesterId.phone}`}
                                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition"
                                >
                                  <Phone className="h-3.5 w-3.5" />
                                  Call Requester: {req.requesterId.phone}
                                </a>
                              )}

                              {/* State Gated Action Buttons */}
                              {isPendingReq && isApproved && (
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => handleRequestStatusChange(req._id, "ACCEPTED")}
                                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#427A65] text-xs font-semibold text-white shadow-2xs hover:bg-[#356651] disabled:opacity-50"
                                  >
                                    {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                    Accept Request
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => handleRequestStatusChange(req._id, "REJECTED")}
                                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#F2D5D8] text-xs font-semibold text-[#C94C55] hover:bg-[#FBEAEC] disabled:opacity-50"
                                  >
                                    {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                                    Decline
                                  </button>
                                </div>
                              )}

                              {isAcceptedReq && isApproved && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleRequestStatusChange(req._id, "COMPLETED")}
                                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#4B78A8] py-2 text-xs font-semibold text-white hover:bg-[#3D648E] disabled:opacity-50"
                                >
                                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                  Mark as Completed
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {requestTotalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between border-t border-[#EEF2EF] pt-4 text-xs">
                      <span className="text-[#6F7D76]">
                        Page {requestPage} of {requestTotalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={requestPage <= 1}
                          onClick={() => handlePageChange(requestPage - 1)}
                          className="rounded-xl border border-[#E2E9E4] bg-white px-3 py-1.5 font-semibold text-[#24342E] disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={requestPage >= requestTotalPages}
                          onClick={() => handlePageChange(requestPage + 1)}
                          className="rounded-xl border border-[#E2E9E4] bg-white px-3 py-1.5 font-semibold text-[#24342E] disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: ORGANIZATION PROFILE */}
          {/* ========================================================= */}
          {activeTab === "profile" && (
            <div className="grid gap-6 lg:grid-cols-3 max-w-5xl">
              {/* Organization Identification (Read-only) */}
              <section className="rounded-3xl border border-[#D8E4F2] bg-white p-6 shadow-2xs h-fit">
                <div className="flex items-center gap-3 border-b border-[#EEF2EF] pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF1FA] text-[#4B78A8]">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#24342E]">Legal Identity</h3>
                    <p className="text-[11px] text-[#6F7D76]">Fixed credentials registered</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-[#8C9892] font-semibold">Registered Organization Name</span>
                    <p className="mt-0.5 font-bold text-[#24342E]">{org?.organizationName || org?.name}</p>
                  </div>

                  <div>
                    <span className="text-[#8C9892] font-semibold">Official License / Reg Number</span>
                    <p className="mt-0.5 font-mono font-bold text-[#24342E]">{org?.registrationNumber || "N/A"}</p>
                  </div>

                  <div>
                    <span className="text-[#8C9892] font-semibold">Platform Role</span>
                    <p className="mt-0.5 font-bold text-[#4B78A8]">{org?.role?.replace("_", " ")}</p>
                  </div>

                  <div>
                    <span className="text-[#8C9892] font-semibold">Registered Email</span>
                    <p className="mt-0.5 font-bold text-[#24342E]">{org?.email}</p>
                  </div>

                  <div>
                    <span className="text-[#8C9892] font-semibold">Verification Status</span>
                    <p className="mt-0.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isApproved
                            ? "bg-emerald-100 text-emerald-800"
                            : isPending
                            ? "bg-amber-100 text-amber-900"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {org?.organizationStatus}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#EEF2EF] bg-[#F8FAF9] p-3 text-[11px] text-[#6F7D76] leading-relaxed">
                  <Lock className="inline h-3 w-3 mr-1 text-[#8C9892]" />
                  To update your legal entity name or registration number, contact platform administration with verification paperwork.
                </div>
              </section>

              {/* Editable Contact Profile */}
              <section className="lg:col-span-2 rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs">
                <h2 className="text-xl font-bold text-[#24342E]">Operational Contact Details</h2>
                <p className="mt-1 text-xs text-[#6F7D76]">
                  Keep representative contact information accurate so community users and emergency responders can reach your team.
                </p>

                <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Authorized Representative Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="h-10.5 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Contact Phone Number</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        required
                        placeholder="+91 9876543210"
                        className="h-10.5 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Locality / District</label>
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        required
                        placeholder="e.g. Akurdi, Pune"
                        className="h-10.5 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Physical Facility Street Address</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      required
                      placeholder="e.g. Plot 45, Sector 24, Pradhikaran, Pune"
                      className="h-10.5 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Public Organization Bio & Operating Hours</label>
                    <textarea
                      rows="3"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Describe your facility facilities, ambulance availability, 24/7 emergency desk, or appointment booking guidelines..."
                      className="w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] p-3 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                    />
                  </div>

                  <div className="flex justify-end pt-3 border-t border-[#EEF2EF]">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#4B78A8] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#3D648E] disabled:opacity-60"
                    >
                      {savingProfile ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          Update Organization Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
