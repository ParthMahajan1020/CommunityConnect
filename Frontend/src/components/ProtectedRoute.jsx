import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getProfile, logoutUser } from "../services/api";
import { ShieldAlert, ArrowRight } from "lucide-react";

function ProtectedRoute({ allowedRoles = null, loginRedirect = "/login" }) {
    const token = localStorage.getItem("token");
    const location = useLocation();
    const [authState, setAuthState] = useState(token ? "checking" : "unauthenticated");
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    });
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let cancelled = false;

        if (!token) {
            return () => {
                cancelled = true;
            };
        }

        getProfile()
            .then((res) => {
                if (!cancelled) {
                    setUser(res.user);
                    setAuthState("authenticated");
                }
            })
            .catch((error) => {
                if (cancelled) return;

                if ([401, 403].includes(error.response?.status)) {
                    logoutUser();
                    setAuthState("unauthenticated");
                    return;
                }

                setAuthState("error");
            });

        return () => {
            cancelled = true;
        };
    }, [token, retry]);

    if (!token || authState === "unauthenticated") {
        return (
            <Navigate
                to={loginRedirect}
                replace
                state={{ from: location }}
            />
        );
    }

    if (authState === "checking") {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-[#F8FAF9] px-6">
                <div className="flex items-center gap-3 text-sm text-[#6F7D76]" role="status">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#DDE7E1] border-t-[#427A65]" />
                    Verifying secure session...
                </div>
            </main>
        );
    }

    if (authState === "error") {
        return (
            <main className="flex min-h-[70vh] items-center justify-center bg-[#F8FAF9] px-6">
                <div className="max-w-md rounded-2xl border border-[#E2E9E4] bg-white p-6 text-center">
                    <p className="text-sm leading-6 text-[#6F7D76]">
                        We couldn’t verify your session. Check your connection and try again.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setAuthState("checking");
                            setRetry((attempt) => attempt + 1);
                        }}
                        className="mt-4 rounded-xl bg-[#427A65] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#356651] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#427A65]/20"
                    >
                        Try again
                    </button>
                </div>
            </main>
        );
    }

    // Role-based validation
    if (allowedRoles && Array.isArray(allowedRoles) && user) {
        const userRole = user.role || "PUBLIC_USER";
        if (!allowedRoles.includes(userRole)) {
            // Determine appropriate redirect destination
            let target = "/home";
            if (userRole === "ADMIN") target = "/admin/dashboard";
            else if (["BLOOD_BANK", "HOSPITAL", "SERVICE_PROVIDER"].includes(userRole)) target = "/private/dashboard";

            return (
                <main className="flex min-h-[70vh] items-center justify-center bg-[#F8FAF9] px-6 py-12">
                    <div className="max-w-md rounded-3xl border border-[#F2D5D8] bg-white p-8 text-center shadow-xs">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBEAEC] text-[#C94C55]">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-[#24342E]">Access Denied</h2>
                        <p className="mt-2 text-xs leading-relaxed text-[#6F7D76]">
                            Your account ({userRole}) is not authorized to access this portal.
                        </p>
                        <a
                            href={target}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#24342E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#34463D] transition"
                        >
                            <span>Go to your Portal</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </main>
            );
        }
    }

    return <Outlet />;
}

export default ProtectedRoute;
