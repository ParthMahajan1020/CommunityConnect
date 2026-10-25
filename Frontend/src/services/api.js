import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
    baseURL: API_BASE_URL
});

// Attach Authorization header automatically if token exists
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle global responses & logout on 401
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optional auto-logout on invalid token
            // localStorage.removeItem("token");
            // localStorage.removeItem("user");
        }
        return Promise.reject(error);
    }
);

// ============================================
// HELPER METHODS
// ============================================

export const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
};

export const getStoredRole = () => {
    const user = getStoredUser();
    return user?.role || "PUBLIC_USER";
};

export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

// ============================================
// PORTAL 1: PUBLIC USER AUTH
// ============================================

export const registerUser = async (userData) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
};

export const verifyEmailOTP = async (email, otp) => {
    const response = await API.post("/auth/verify-email-otp", {
        email,
        otp
    });
    return response.data;
};

export const resendEmailOTP = async (email) => {
    const response = await API.post("/auth/resend-email-otp", {
        email
    });
    return response.data;
};

export const loginUser = async (credentials) => {
    const response = await API.post("/auth/login", credentials);

    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
};

export const forgotPassword = async ({ email }) => {
    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
    const response = await API.post("/auth/reset-password", {
        email,
        otp,
        newPassword
    });
    return response.data;
};

// ============================================
// PORTAL 2: PRIVATE ORGANIZATION AUTH
// ============================================

export const registerPrivate = async (orgData) => {
    const response = await API.post("/auth/private/register", orgData);
    return response.data;
};

export const loginPrivate = async (credentials) => {
    const response = await API.post("/auth/private/login", credentials);

    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
};

// ============================================
// PORTAL 3: ADMIN AUTH
// ============================================

export const loginAdmin = async (credentials) => {
    const response = await API.post("/auth/admin/login", credentials);

    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
};

// ============================================
// USER PROFILE
// ============================================

export const getProfile = async () => {
    const response = await API.get("/users/me");
    if (response.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await API.put("/users/me", profileData);
    if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
};

// ============================================
// BLOOD DONOR & MATCHING
// ============================================

export const findBloodDonors = async (bloodGroup, location) => {
    const response = await API.get("/connections/matches", {
        params: {
            type: "BLOOD",
            requirement: bloodGroup,
            location: location
        }
    });
    return response.data;
};

export const registerBloodDonor = async (donorData) => {
    const response = await API.post("/blood/register", donorData);
    return response.data;
};

export const getMyDonorProfile = async () => {
    const response = await API.get("/blood/me");
    return response.data;
};

export const toggleDonorAvailability = async () => {
    const response = await API.patch("/blood/availability");
    return response.data;
};

// ============================================
// SERVICES & MATCHING
// ============================================

export const findServiceProviders = async (serviceType, location) => {
    const response = await API.get("/connections/matches", {
        params: {
            type: "SERVICE",
            requirement: serviceType,
            location: location
        }
    });
    return response.data;
};

export const registerServiceProvider = async (serviceData) => {
    const response = await API.post("/services/register", serviceData);
    return response.data;
};

export const getMyServiceProviderProfile = async () => {
    const response = await API.get("/services/me");
    return response.data;
};

export const toggleProviderAvailability = async () => {
    const response = await API.patch("/services/availability");
    return response.data;
};

// ============================================
// CONNECTION REQUESTS
// ============================================

export const sendConnectionRequest = async (requestData) => {
    const response = await API.post("/connections/request", requestData);
    return response.data;
};

export const getReceivedRequests = async () => {
    const response = await API.get("/connections/requests/received");
    return response.data;
};

export const getSentRequests = async () => {
    const response = await API.get("/connections/requests/sent");
    return response.data;
};

export const updateConnectionRequestStatus = async (requestId, status) => {
    const response = await API.patch(`/connections/requests/${requestId}/status`, {
        status
    });
    return response.data;
};

// ============================================
// PRIVATE ORGANIZATION PORTAL API
// ============================================

export const getOrgProfile = async () => {
    const response = await API.get("/organization/profile");
    return response.data;
};

export const updateOrgProfile = async (data) => {
    const response = await API.put("/organization/profile", data);
    return response.data;
};

export const getOrgStats = async () => {
    const response = await API.get("/organization/stats");
    return response.data;
};

export const getOrgInventory = async () => {
    const response = await API.get("/organization/inventory");
    return response.data;
};

export const updateOrgInventory = async (units) => {
    const response = await API.put("/organization/inventory", { units });
    return response.data;
};

export const getOrgServices = async () => {
    const response = await API.get("/organization/services");
    return response.data;
};

export const addOrgService = async (serviceData) => {
    const response = await API.post("/organization/services", serviceData);
    return response.data;
};

export const updateOrgService = async (serviceId, serviceData) => {
    const response = await API.put(`/organization/services/${serviceId}`, serviceData);
    return response.data;
};

export const deleteOrgService = async (serviceId) => {
    const response = await API.delete(`/organization/services/${serviceId}`);
    return response.data;
};

export const getOrgRequests = async () => {
    const response = await API.get("/organization/requests");
    return response.data;
};

export const updateOrgRequestStatus = async (requestId, status) => {
    const response = await API.patch(`/organization/requests/${requestId}/status`, { status });
    return response.data;
};

// ============================================
// ADMIN PORTAL API
// ============================================

export const getAdminOverview = async () => {
    const response = await API.get("/admin/overview");
    return response.data;
};

export const getAdminUsers = async (params = {}) => {
    const response = await API.get("/admin/users", { params });
    return response.data;
};

export const updateAdminUserStatus = async (userId, accountStatus) => {
    const response = await API.patch(`/admin/users/${userId}/status`, { accountStatus });
    return response.data;
};

export const getAdminOrganizations = async (params = {}) => {
    const response = await API.get("/admin/organizations", { params });
    return response.data;
};

export const updateAdminOrgStatus = async (orgId, organizationStatus, notes = "") => {
    const response = await API.patch(`/admin/organizations/${orgId}/status`, {
        organizationStatus,
        notes
    });
    return response.data;
};

export const getAdminBloodOrganizations = async () => {
    const response = await API.get("/admin/blood-organizations");
    return response.data;
};

export const getAdminServices = async () => {
    const response = await API.get("/admin/services");
    return response.data;
};

export const toggleAdminServiceStatus = async (serviceId, isActive) => {
    const response = await API.patch(`/admin/services/${serviceId}/status`, { isActive });
    return response.data;
};

export const getAdminRequests = async (params = {}) => {
    const response = await API.get("/admin/requests", { params });
    return response.data;
};

export const getAdminFeedbacks = async () => {
    const response = await API.get("/admin/feedbacks");
    return response.data;
};

export const getAdminAuditLogs = async () => {
    const response = await API.get("/admin/audit-logs");
    return response.data;
};

export default API;
