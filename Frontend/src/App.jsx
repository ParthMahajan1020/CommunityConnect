import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
} from "react-router-dom";
import { HeartHandshake, ArrowLeft } from "lucide-react";

import SoftAurora from "./components/SoftAurora";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
import Home from "./pages/Home";
import Feedback from "./pages/Feedback";
import FindBlood from "./pages/FindBlood";
import FindService from "./pages/FindService";
import ServiceProvider from "./pages/ServiceProvider";
import MyRequests from "./pages/MyRequests";
import Profile from "./pages/Profile";
import BloodDonor from "./pages/BloodDonor";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Private Organization Portal Pages
import PrivateLogin from "./pages/private/PrivateLogin";
import PrivateRegister from "./pages/private/PrivateRegister";
import PrivateDashboard from "./pages/private/PrivateDashboard";

// Admin Portal Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import { getProfile, logoutUser } from "./services/api";

function RootRoute() {
  const [verified, setVerified] = useState(false);
  const [role, setRole] = useState("PUBLIC_USER");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    let cancelled = false;
    getProfile()
      .then((res) => {
        if (!cancelled) {
          setRole(res.user?.role || "PUBLIC_USER");
          setVerified(true);
        }
      })
      .catch((error) => {
        if (!cancelled && [401, 403].includes(error.response?.status)) {
          logoutUser();
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (verified) {
    if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    if (["BLOOD_BANK", "HOSPITAL", "SERVICE_PROVIDER"].includes(role)) {
      return <Navigate to="/private/dashboard" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Home />
      </div>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] px-6 py-16 text-[#24342E]">
      <section className="w-full max-w-md rounded-3xl border border-[#E2E9E4] bg-white p-8 text-center shadow-xs sm:p-10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
          <HeartHandshake className="h-7 w-7" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#427A65]">
          404 Not Found
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#24342E]">
          Page Doesn’t Exist
        </h1>
        <p className="mt-2 text-xs text-[#6F7D76]">
          The address might have changed or moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#427A65] px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#356651]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
      </section>
    </main>
  );
}

function ProtectedLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function FeedbackLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="relative z-10 flex-1">
        <Feedback />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* GLOBAL SOFT AURORA BACKGROUND */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <SoftAurora
          speed={0.4}
          scale={1.6}
          brightness={0.8}
          color1="#f8faf9"
          color2="#e8efe9"
          noiseFrequency={2.0}
          noiseAmplitude={0.8}
          bandHeight={0.4}
          bandSpread={1}
          octaveDecay={0.1}
          layerOffset={0}
          colorSpeed={0.5}
          enableMouseInteraction={false}
          mouseInfluence={0}
        />
      </div>

      {/* ROUTES ACROSS THREE INTEGRATED PORTALS */}
      <Routes>
        {/* LANDING */}
        <Route path="/" element={<RootRoute />} />

        {/* =======================================================
            PORTAL 1: PUBLIC USER PORTAL
        ======================================================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/feedback" element={<FeedbackLayout />} />

        {/* Public Protected Routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["PUBLIC_USER"]}
              loginRedirect="/login"
            />
          }
        >
          <Route element={<ProtectedLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/blood" element={<FindBlood />} />
            <Route path="/blood/donor" element={<BloodDonor />} />
            <Route path="/services" element={<FindService />} />
            <Route path="/services/provider" element={<ServiceProvider />} />
            <Route path="/requests" element={<MyRequests />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* =======================================================
            PORTAL 2: PRIVATE ORGANIZATION / PROVIDER PORTAL
        ======================================================= */}
        <Route path="/private/login" element={<PrivateLogin />} />
        <Route path="/private/register" element={<PrivateRegister />} />

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["BLOOD_BANK", "HOSPITAL", "SERVICE_PROVIDER"]}
              loginRedirect="/private/login"
            />
          }
        >
          <Route path="/private/dashboard" element={<PrivateDashboard />} />
        </Route>

        {/* =======================================================
            PORTAL 3: ADMIN PORTAL (NO PUBLIC REGISTER!)
        ======================================================= */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN"]}
              loginRedirect="/admin/login"
            />
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
