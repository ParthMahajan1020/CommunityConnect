import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
    baseURL: API_BASE_URL
});

const registerUser = async (userData) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
};

const verifyEmailOTP = async ({ email, otp }) => {
    const response = await API.post("/auth/verify-email-otp", { email, otp });
    return response.data;
};

const resendEmailOTP = async ({ email }) => {
    const response = await API.post("/auth/resend-email-otp", { email });
    return response.data;
};

const loginUser = async (credentials) => {
    const response = await API.post("/auth/login", credentials);

    if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
        );
    }

    return response.data;
};

export const getProfile = async () => {
    const token = localStorage.getItem("token");

    const response = await API.get("/users/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return response.data;
};


export const updateProfile = async (profileData) => {
    const token = localStorage.getItem("token");

    const response = await API.put(
        "/users/me",
        profileData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    if (response.data.user) {
        localStorage.setItem(
            "user",
            JSON.stringify(response.data.user)
        );
    }

    return response.data;
};

export const findBloodDonors = async (bloodGroup, location) => {
    const token = localStorage.getItem("token");

    const response = await API.get(
        `/connections/matches`,
        {
            params: {
                type: "BLOOD",
                requirement: bloodGroup,
                location: location
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


export const sendConnectionRequest = async (requestData) => {
    const token = localStorage.getItem("token");

    const response = await API.post(
        "/connections/request",
        requestData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const getReceivedRequests = async () => {
    const token = localStorage.getItem("token");

    const response = await API.get(
        "/connections/requests/received",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


export const getSentRequests = async () => {
    const token = localStorage.getItem("token");

    const response = await API.get(
        "/connections/requests/sent",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};


export const updateConnectionRequestStatus = async (
    requestId,
    status,
) => {
    const token = localStorage.getItem("token");

    const response = await API.patch(
        `/connections/requests/${requestId}/status`,
        {
            status
        },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const registerBloodDonor = async (donorData) => {
    const token = localStorage.getItem("token");

    const response = await API.post(
        "/blood/register",
        donorData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const registerServiceProvider = async (serviceData) => {
    const token = localStorage.getItem("token");

    const response = await API.post(
        "/services/register",
        serviceData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const findServiceProviders = async (
    serviceType,
    location
) => {
    const token = localStorage.getItem("token");

    const response = await API.get(
        "/connections/matches",
        {
            params: {
                type: "SERVICE",
                requirement: serviceType,
                location: location
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export {
    registerUser,
    loginUser,
    verifyEmailOTP,
    resendEmailOTP,
    logoutUser
};

export default API;
