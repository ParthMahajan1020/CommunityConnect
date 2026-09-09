import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api"
});

export const registerUser = async (userData) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
};

export const loginUser = async (credentials) => {
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



export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export default API;