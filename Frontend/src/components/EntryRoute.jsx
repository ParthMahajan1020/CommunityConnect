import { Navigate } from "react-router-dom";

function EntryRoute() {
    const token = localStorage.getItem("token");

    if (token) {
        return <Navigate to="/home" replace />;
    }

    return <Navigate to="/login" replace />;
}

export default EntryRoute;