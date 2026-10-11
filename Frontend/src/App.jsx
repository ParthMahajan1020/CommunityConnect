import {
  useEffect,
  useState,
} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
} from "react-router-dom";

import SoftAurora from "./components/SoftAurora";
import Navbar from "./components/Navbar";

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

  return verified ? <Navigate to="/home" replace /> : <Home />;
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAF9] px-6 py-16 text-[#24342E]">
      <section className="w-full max-w-lg rounded-3xl border border-[#E2E9E4] bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#427A65]">
          Page not found
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          This page doesn’t exist.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6F7D76]">
          Check the address or return to CommunityConnect.
        </p>
        <Link
          to="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#427A65] px-5 text-sm font-semibold text-white transition hover:bg-[#356651] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#427A65]/20"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}

/*
 * Protected Layout
 *
 * Navbar is shown on every authenticated page.
 * Outlet renders the current page below the navbar.
 */
function ProtectedLayout() {
  return (
    <>
      <Navbar />

      <main className="relative z-10 pt-28">
        <Outlet />
      </main>
    </>
  );
}

function FeedbackLayout() {
  return (
    <>
      <Navbar />
      <main className="relative z-10">
        <Feedback />
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* GLOBAL SOFT AURORA BACKGROUND */}
      <div className="fixed inset-0 -z-10">
        <SoftAurora
          speed={0.6}
          scale={1.5}
          brightness={1}
          color1="#f7f7f7"
          color2="#e100ff"
          noiseFrequency={2.5}
          noiseAmplitude={1}
          bandHeight={0.5}
          bandSpread={1}
          octaveDecay={0.1}
          layerOffset={0}
          colorSpeed={1}
          enableMouseInteraction
          mouseInfluence={0.25}
        />
      </div>

      {/* ROUTES */}
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<RootRoute />} />

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Public feedback form; submission retains its existing auth requirement. */}
        <Route path="/feedback" element={<FeedbackLayout />} />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          {/* GLOBAL AUTHENTICATED LAYOUT */}
          <Route element={<ProtectedLayout />}>
            {/* HOME */}
            <Route path="/home" element={<Home />} />

            {/* BLOOD */}
            <Route path="/blood" element={<FindBlood />} />

            <Route path="/blood/donor" element={<BloodDonor />} />

            {/* SERVICES */}
            <Route path="/services/provider" element={<ServiceProvider />} />

            <Route path="/services" element={<FindService />} />

            {/* REQUESTS */}
            <Route path="/requests" element={<MyRequests />} />

            {/* PROFILE */}
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
