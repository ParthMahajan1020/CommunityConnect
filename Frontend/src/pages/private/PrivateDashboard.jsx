import { useEffect, useState, useMemo } from "react";
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
  X
} from "lucide-react";

import {
  getOrgProfile,
  updateOrgProfile,
  getOrgInventory,
  updateOrgInventory,
  getOrgServices,
  addOrgService,
  deleteOrgService,
  getOrgRequests,
  updateOrgRequestStatus,
  logoutUser
} from "../../services/api";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function PrivateDashboard() {
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'operations' | 'requests' | 'profile'
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

  const loadData = async () => {
    try {
      const profileRes = await getOrgProfile();
      const organization = profileRes.organization;
      setOrg(organization);

      setProfileForm({
        name: organization.name || "",
        phone: organization.phone || "",
        location: organization.location || "",
        address: organization.address || "",
        bio: organization.bio || ""
      });

      if (organization.organizationStatus === "APPROVED") {
        if (organization.role === "BLOOD_BANK" || organization.role === "HOSPITAL") {
          try {
            const invRes = await getOrgInventory();
            if (invRes.inventory) setInventory(invRes.inventory);
            if (invRes.lastUpdated) setLastUpdated(invRes.lastUpdated);
          } catch (invErr) {
            console.error("Inventory load error:", invErr.message);
          }
        }

        if (organization.role === "SERVICE_PROVIDER") {
          try {
            const srvRes = await getOrgServices();
            setServices(srvRes.services || []);
          } catch (srvErr) {
            console.error("Services load error:", srvErr.message);
          }
        }

        try {
          const reqRes = await getOrgRequests();
          setRequests(reqRes.requests || []);
        } catch (reqErr) {
          console.error("Requests load error:", reqErr.message);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load organization data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const profileRes = await getOrgProfile();
        if (ignore) return;
        const organization = profileRes.organization;
        setOrg(organization);
        setProfileForm({
          name: organization.name || "",
          phone: organization.phone || "",
          location: organization.location || "",
          address: organization.address || "",
          bio: organization.bio || ""
        });

        if (organization.organizationStatus === "APPROVED") {
          if (organization.role === "BLOOD_BANK" || organization.role === "HOSPITAL") {
            try {
              const invRes = await getOrgInventory();
              if (!ignore && invRes.inventory) setInventory(invRes.inventory);
              if (!ignore && invRes.lastUpdated) setLastUpdated(invRes.lastUpdated);
            } catch (invErr) {
              console.error("Inventory load error:", invErr.message);
            }
          }

          if (organization.role === "SERVICE_PROVIDER") {
            try {
              const srvRes = await getOrgServices();
              if (!ignore) setServices(srvRes.services || []);
            } catch (srvErr) {
              console.error("Services load error:", srvErr.message);
            }
          }

          try {
            const reqRes = await getOrgRequests();
            if (!ignore) setRequests(reqRes.requests || []);
          } catch (reqErr) {
            console.error("Requests load error:", reqErr.message);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err?.response?.data?.message || "Failed to load organization data.");
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
    navigate("/private/login");
  };

  // Inventory modifications
  const handleInventoryChange = (group, delta) => {
    setInventory((prev) => {
      const current = Number(prev[group]) || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [group]: next };
    });
  };

  const handleInventoryInput = (group, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setInventory((prev) => ({ ...prev, [group]: num }));
  };

  const handleSaveInventory = async () => {
    setSavingInventory(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await updateOrgInventory(inventory);
      setInventory(res.inventory);
      setLastUpdated(res.lastUpdated);
      setSuccessMsg("Blood inventory successfully synchronized.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update blood inventory.");
    } finally {
      setSavingInventory(false);
    }
  };

  // Service creation
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newService.title.trim() || !newService.category.trim() || !newService.location.trim()) {
      setError("Please fill in required service fields.");
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
      setSuccessMsg("Professional service listing published.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add service.");
    } finally {
      setAddingService(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to remove this service listing?")) return;
    try {
      await deleteOrgService(serviceId);
      setServices((prev) => prev.filter((s) => s._id !== serviceId));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to deactivate service.");
    }
  };

  // Request actions
  const handleRequestStatus = async (requestId, status) => {
    setActionLoadingId(requestId);
    setError("");
    try {
      await updateOrgRequestStatus(requestId, status);
      const reqRes = await getOrgRequests();
      setRequests(reqRes.requests || []);
      setSuccessMsg(`Request marked as ${status.toLowerCase()}.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update request.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Profile update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError("");
    try {
      const res = await updateOrgProfile(profileForm);
      setOrg((prev) => ({ ...prev, ...res.organization }));
      setSuccessMsg("Organization profile updated.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const totalInventoryCount = useMemo(() => {
    return Object.values(inventory).reduce((acc, v) => acc + (Number(v) || 0), 0);
  }, [inventory]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#F8FAF9]">
        <div className="flex flex-col items-center gap-3 text-xs text-[#6F7D76]">
          <Loader2 className="h-7 w-7 animate-spin text-[#4B78A8]" />
          Loading organization portal...
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#24342E]">
      {/* Top Organization Header */}
      <header className="sticky top-0 z-40 border-b border-[#D8E4F2] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#4B78A8]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-[#24342E]">
                  {org?.organizationName || org?.name}
                </span>
                <span className="rounded-full bg-[#EAF1FA] px-2 py-0.5 text-[10px] font-bold text-[#4B78A8]">
                  {org?.role?.replace("_", " ")}
                </span>
              </div>
              <p className="text-[10px] font-medium text-[#6F7D76]">{org?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#D8E4F2] bg-white px-3 text-xs font-semibold text-[#24342E] shadow-2xs hover:bg-[#F7FAFD]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#F2D5D8] bg-white px-3 text-xs font-semibold text-[#C94C55] shadow-2xs hover:bg-[#FBEAEC]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
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

        {/* STATUS BANNER */}
        {isPending && (
          <section className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-2xs">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/60 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                  Application Under Review
                </div>
                <h2 className="mt-2 text-xl font-bold text-amber-950">
                  Verification in Progress
                </h2>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-amber-800">
                  Your organization details have been securely logged. To ensure patient and neighborhood security, community discovery and inventory management are locked until an administrator confirms your credentials. You can update your profile info while awaiting activation.
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-amber-900 font-medium">
                  <span>Registration ID: <strong>{org?.registrationNumber}</strong></span>
                  <span>Submitted: <strong>{new Date(org?.createdAt).toLocaleDateString()}</strong></span>
                </div>
              </div>
            </div>
          </section>
        )}

        {isSuspended && (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-2xs">
            <div className="flex items-start gap-3.5">
              <ShieldAlert className="h-6 w-6 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-rose-900">Organization Suspended</h2>
                <p className="mt-1 text-xs text-rose-800 leading-relaxed">
                  Operational features have been suspended by administrators. Community requests and public discovery are paused. Contact administration for assistance.
                </p>
              </div>
            </div>
          </section>
        )}

        {isRejected && (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 shadow-2xs">
            <div className="flex items-start gap-3.5">
              <XCircle className="h-6 w-6 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold text-rose-900">Registration Not Approved</h2>
                <p className="mt-1 text-xs text-rose-800 leading-relaxed">
                  Your organization application could not be verified by our administrative team.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-[#D8E4F2] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "overview"
                ? "bg-[#4B78A8] text-white shadow-xs"
                : "text-[#6F7D76] hover:bg-white hover:text-[#24342E]"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Overview
          </button>

          {isBloodOrg && (
            <button
              type="button"
              onClick={() => setActiveTab("operations")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "operations"
                  ? "bg-[#4B78A8] text-white shadow-xs"
                  : "text-[#6F7D76] hover:bg-white hover:text-[#24342E]"
              }`}
            >
              <Droplets className="h-3.5 w-3.5" />
              Blood Inventory
            </button>
          )}

          {isServiceProvider && (
            <button
              type="button"
              onClick={() => setActiveTab("operations")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "operations"
                  ? "bg-[#4B78A8] text-white shadow-xs"
                : "text-[#6F7D76] hover:bg-white hover:text-[#24342E]"
              }`}
            >
              <Wrench className="h-3.5 w-3.5" />
              Manage Services
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "requests"
                ? "bg-[#4B78A8] text-white shadow-xs"
                : "text-[#6F7D76] hover:bg-white hover:text-[#24342E]"
            }`}
          >
            <Inbox className="h-3.5 w-3.5" />
            Requests
            {requests.length > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                {requests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === "profile"
                ? "bg-[#4B78A8] text-white shadow-xs"
                : "text-[#6F7D76] hover:bg-white hover:text-[#24342E]"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Organization Profile
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {isBloodOrg && (
                <div className="rounded-3xl border border-[#F2D5D8] bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C94C55]">
                      Total Inventory
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FBEAEC] text-[#C94C55]">
                      <Droplets className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-[#24342E]">{totalInventoryCount} <span className="text-xs font-normal text-[#6F7D76]">units</span></p>
                  <p className="mt-1 text-[11px] text-[#6F7D76]">Across all 8 blood groups</p>
                </div>
              )}

              {isServiceProvider && (
                <div className="rounded-3xl border border-[#D8E4F2] bg-white p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4B78A8]">
                      Active Listings
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EAF1FA] text-[#4B78A8]">
                      <Wrench className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-[#24342E]">{services.length}</p>
                  <p className="mt-1 text-[11px] text-[#6F7D76]">Publicly discoverable services</p>
                </div>
              )}

              <div className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#427A65]">
                    Total Requests
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
                    <Inbox className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#24342E]">{requests.length}</p>
                <p className="mt-1 text-[11px] text-[#6F7D76]">Incoming connection volume</p>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                    Pending Response
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Clock className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#24342E]">
                  {requests.filter(r => r.status === 'PENDING').length}
                </p>
                <p className="mt-1 text-[11px] text-[#6F7D76]">Awaiting acceptance</p>
              </div>

              <div className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#427A65]">
                    Completed
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E5F1EA] text-[#427A65]">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold text-[#24342E]">
                  {requests.filter(r => r.status === 'COMPLETED').length}
                </p>
                <p className="mt-1 text-[11px] text-[#6F7D76]">Successfully fulfilled</p>
              </div>
            </div>

            {/* Quick Actions / Status Summary */}
            <section className="rounded-3xl border border-[#D8E4F2] bg-white p-6 shadow-2xs">
              <h3 className="text-base font-bold text-[#24342E]">Organization Identity</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                <div className="rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4">
                  <p className="text-[#6F7D76]">Official Entity Name</p>
                  <p className="mt-1 font-bold text-[#24342E]">{org?.organizationName}</p>
                </div>
                <div className="rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4">
                  <p className="text-[#6F7D76]">Registration Number</p>
                  <p className="mt-1 font-bold font-mono text-[#24342E]">{org?.registrationNumber}</p>
                </div>
                <div className="rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4">
                  <p className="text-[#6F7D76]">Verification Status</p>
                  <p className="mt-1 font-bold text-[#4B78A8]">{org?.organizationStatus}</p>
                </div>
                <div className="rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4">
                  <p className="text-[#6F7D76]">Contact Person</p>
                  <p className="mt-1 font-bold text-[#24342E]">{org?.name}</p>
                </div>
                <div className="rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4">
                  <p className="text-[#6F7D76]">Location Area</p>
                  <p className="mt-1 font-bold text-[#24342E]">{org?.location}</p>
                </div>
                <div className="rounded-2xl border border-[#EEF2EF] bg-[#FBFCFB] p-4">
                  <p className="text-[#6F7D76]">Address</p>
                  <p className="mt-1 font-bold text-[#24342E] truncate">{org?.address || "Not provided"}</p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: OPERATIONS (BLOOD INVENTORY) */}
        {activeTab === "operations" && isBloodOrg && (
          <div className="space-y-6">
            {/* Medical Disclaimer Banner */}
            <div className="rounded-2xl border border-[#D8E4F2] bg-[#F7FAFD] p-4 text-xs text-[#2A4B70] flex items-start gap-3">
              <Info className="h-5 w-5 shrink-0 text-[#4B78A8] mt-0.5" />
              <div className="leading-relaxed">
                <strong>Medical Advisory Notice:</strong> Blood inventory updates reported here enable nearby community search during emergencies. Compatibility assessment, cross-matching, testing, and transfusion administration remain the sole responsibility of licensed medical practitioners.
              </div>
            </div>

            <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EEF2EF] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#24342E]">Blood Inventory Management</h2>
                  <p className="mt-1 text-xs text-[#6F7D76]">
                    Update live stock units for each blood group. Units cannot be negative.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {lastUpdated && (
                    <span className="text-[11px] text-[#8C9892]">
                      Last updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        Saving...
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
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  Inventory editing is currently read-only pending administrator approval.
                </div>
              )}

              {/* Units Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {bloodGroups.map((group) => {
                  const count = inventory[group] || 0;
                  return (
                    <div
                      key={group}
                      className="flex flex-col justify-between rounded-3xl border border-[#F2D5D8] bg-white p-4.5 shadow-2xs hover:border-[#C94C55]/30 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FBEAEC] text-base font-bold text-[#C94C55]">
                          {group}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C9892]">
                          Available
                        </span>
                      </div>

                      <div className="my-4 text-center">
                        <input
                          type="number"
                          min="0"
                          disabled={!isApproved}
                          value={count}
                          onChange={(e) => handleInventoryInput(group, e.target.value)}
                          className="h-12 w-24 rounded-2xl border border-[#E2E9E4] bg-[#FBFCFB] text-center font-mono text-2xl font-bold text-[#24342E] outline-none transition focus:border-[#C94C55] focus:bg-white"
                        />
                        <span className="ml-1 text-xs text-[#6F7D76]">units</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={!isApproved || count <= 0}
                          onClick={() => handleInventoryChange(group, -1)}
                          className="flex h-9 flex-1 items-center justify-center rounded-xl border border-[#E2E9E4] bg-[#F8FAF9] text-base font-bold text-[#24342E] hover:bg-white disabled:opacity-40"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          disabled={!isApproved}
                          onClick={() => handleInventoryChange(group, 1)}
                          className="flex h-9 flex-1 items-center justify-center rounded-xl bg-[#C94C55] text-base font-bold text-white shadow-2xs hover:bg-[#B53D46] disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: OPERATIONS (PROFESSIONAL SERVICES) */}
        {activeTab === "operations" && isServiceProvider && (
          <div className="space-y-6">
            <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EEF2EF] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#24342E]">Professional Service Listings</h2>
                  <p className="mt-1 text-xs text-[#6F7D76]">
                    Configure professional offerings discoverable by local community members.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(true)}
                  disabled={!isApproved}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#4B78A8] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#3D648E] disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add New Service
                </button>
              </div>

              {!isApproved && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  Service listing creation is locked pending administrator verification.
                </div>
              )}

              {/* Listings feed */}
              <div className="mt-6">
                {services.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#6F7D76]">
                    <Wrench className="mx-auto h-8 w-8 text-[#8C9892] mb-2" />
                    No services published yet. Click "Add New Service" to list your capabilities.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((srv) => (
                      <div
                        key={srv._id}
                        className="flex flex-col justify-between rounded-3xl border border-[#D8E4F2] bg-white p-5 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <span className="rounded-xl bg-[#EAF1FA] px-2.5 py-1 text-xs font-bold text-[#4B78A8]">
                              {srv.category}
                            </span>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                              srv.availability ? "text-emerald-700" : "text-gray-400"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${srv.availability ? "bg-emerald-600" : "bg-gray-400"}`} />
                              {srv.availability ? "Available" : "Paused"}
                            </span>
                          </div>

                          <h3 className="mt-3 text-sm font-bold text-[#24342E]">{srv.title}</h3>
                          <p className="mt-1 text-xs text-[#6F7D76] line-clamp-3 leading-relaxed">
                            {srv.description}
                          </p>

                          <div className="mt-4 space-y-1 text-xs text-[#6F7D76] border-t border-[#EEF2EF] pt-3">
                            <div className="flex items-center justify-between">
                              <span>Pricing:</span>
                              <span className="font-bold text-[#24342E]">
                                {srv.pricing > 0 ? `₹${srv.pricing} / ${srv.pricingType}` : "Inquire upon request"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <MapPin className="h-3.5 w-3.5 text-[#8C9892]" />
                              <span>{srv.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#EEF2EF] flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteService(srv._id)}
                            className="inline-flex items-center gap-1 text-xs text-[#C94C55] hover:underline"
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

            {/* Modal: Add Service */}
            {showAddServiceModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-xs">
                <div className="w-full max-w-lg rounded-3xl border border-[#D8E4F2] bg-white p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#EEF2EF] pb-3">
                    <h3 className="text-base font-bold text-[#24342E]">Add Professional Service</h3>
                    <button onClick={() => setShowAddServiceModal(false)}><X className="h-5 w-5" /></button>
                  </div>

                  <form onSubmit={handleAddService} className="mt-4 space-y-3.5">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Category</label>
                      <input
                        type="text"
                        value={newService.category}
                        onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                        placeholder="e.g. Plumbing, Electrician, Cleaning, Food Delivery"
                        required
                        className="h-10 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Listing Title</label>
                      <input
                        type="text"
                        value={newService.title}
                        onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                        placeholder="e.g. Master Plumbing & Leak Detection"
                        required
                        className="h-10 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Detailed Description</label>
                      <textarea
                        rows="3"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        placeholder="Explain services covered, timing, and qualifications..."
                        required
                        className="w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] p-3 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Price (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={newService.pricing}
                          onChange={(e) => setNewService({ ...newService, pricing: e.target.value })}
                          className="h-10 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Billing Frequency</label>
                        <select
                          value={newService.pricingType}
                          onChange={(e) => setNewService({ ...newService, pricingType: e.target.value })}
                          className="h-10 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                        >
                          <option value="Hourly">Hourly</option>
                          <option value="Daily">Daily</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Fixed">Fixed Price</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Service Area / City</label>
                      <input
                        type="text"
                        value={newService.location}
                        onChange={(e) => setNewService({ ...newService, location: e.target.value })}
                        placeholder="Akurdi, Pune"
                        required
                        className="h-10 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddServiceModal(false)}
                        className="rounded-xl border border-[#E2E9E4] px-4 py-2 text-xs font-semibold text-[#6F7D76]"
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

        {/* TAB 3: REQUESTS */}
        {activeTab === "requests" && (
          <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#EEF2EF] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#24342E]">Incoming Requests</h2>
                <p className="mt-1 text-xs text-[#6F7D76]">
                  Review and fulfill requests submitted by community members.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#6F7D76]">
                {requests.length} Total
              </span>
            </div>

            <div className="mt-6">
              {requests.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6F7D76]">
                  <Inbox className="mx-auto h-8 w-8 text-[#8C9892] mb-2" />
                  No connection requests received yet.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {requests.map((req) => {
                    const isPendingAction = req.status === "PENDING";
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

                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              req.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              req.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {req.status}
                            </span>
                          </div>

                          <div className="mt-3 rounded-2xl bg-[#F8FAF9] p-3 text-xs leading-relaxed text-[#4A5952]">
                            <p className="font-medium text-[#24342E]">Description:</p>
                            <p className="mt-0.5">{req.description}</p>
                          </div>

                          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#6F7D76]">
                            <MapPin className="h-3.5 w-3.5 text-[#8C9892]" />
                            <span>{req.location}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#EEF2EF]">
                          {req.status === "ACCEPTED" && req.requesterId?.phone && (
                            <a
                              href={`tel:${req.requesterId.phone}`}
                              className="mb-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-800"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              Contact: {req.requesterId.phone}
                            </a>
                          )}

                          {isPendingAction && isApproved && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleRequestStatus(req._id, "ACCEPTED")}
                                className="inline-flex h-9 items-center justify-center gap-1 rounded-xl bg-[#427A65] text-xs font-semibold text-white hover:bg-[#356651]"
                              >
                                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                Accept
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleRequestStatus(req._id, "REJECTED")}
                                className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-[#F2D5D8] text-xs font-semibold text-[#C94C55] hover:bg-[#FBEAEC]"
                              >
                                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === "profile" && (
          <section className="rounded-3xl border border-[#E2E9E4] bg-white p-6 shadow-2xs max-w-2xl">
            <h2 className="text-xl font-bold text-[#24342E]">Organization Information</h2>
            <p className="mt-1 text-xs text-[#6F7D76]">
              Keep contact details accurate so community members can locate and reach you.
            </p>

            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Representative Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className="h-10.5 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  required
                  className="h-10.5 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Locality / City</label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  required
                  className="h-10.5 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Physical Address</label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  required
                  className="h-10.5 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-3.5 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#6F7D76]">Public Description / Bio</label>
                <textarea
                  rows="3"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell neighbors about your facilities, emergency services, or operating hours..."
                  className="w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] p-3 text-xs text-[#24342E] outline-none focus:border-[#4B78A8]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#4B78A8] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#3D648E] disabled:opacity-60"
                >
                  {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Organization Info
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
