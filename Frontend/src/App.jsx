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

import ProtectedRoute from "./components/ProtectedRoute";
import { getProfile, logoutUser } from "./services/api";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function RootRoute() {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    let cancelled = false;
    getProfile()
      .then(() => {
        if (!cancelled) setVerified(true);
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

  return verified ? (
    <Navigate to="/home" replace />
  ) : (
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

/*
 * Protected Layout
 * Navbar is shown on every authenticated page.
 * Outlet renders the current page.
 * Footer is shown at the bottom.
 */
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
      {/* GLOBAL SOFT AURORA BACKGROUND - Subdued organic cream/sage tones */}
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

      {/* ROUTES */}
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<RootRoute />} />

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public feedback form */}
        <Route path="/feedback" element={<FeedbackLayout />} />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/blood" element={<FindBlood />} />
            <Route path="/blood/donor" element={<BloodDonor />} />
            <Route path="/services/provider" element={<ServiceProvider />} />
            <Route path="/services" element={<FindService />} />
            <Route path="/requests" element={<MyRequests />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
