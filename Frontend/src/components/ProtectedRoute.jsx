import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getProfile, logoutUser } from "../services/api";

function ProtectedRoute() {
    const token = localStorage.getItem("token");
    const location = useLocation();
    const [authState, setAuthState] = useState(token ? "checking" : "unauthenticated");
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let cancelled = false;

        if (!token) {
            return () => {
                cancelled = true;
            };
        }

        getProfile()
            .then(() => {
                if (!cancelled) setAuthState("authenticated");
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
                to="/login"
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
                    Verifying your session...
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

    return <Outlet />;
}

export default ProtectedRoute;