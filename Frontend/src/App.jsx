import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet
} from "react-router-dom";

import SoftAurora from "./components/SoftAurora";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import FindBlood from "./pages/FindBlood";
import FindService from "./pages/FindService";
import ServiceProvider from "./pages/ServiceProvider";
import MyRequests from "./pages/MyRequests";
import Profile from "./pages/Profile";
import BloodDonor from "./pages/BloodDonor";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";

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

                {/* DEFAULT */}
                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

                {/* PUBLIC ROUTES */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* PROTECTED ROUTES */}
                <Route element={<ProtectedRoute />}>

                    {/* GLOBAL AUTHENTICATED LAYOUT */}
                    <Route element={<ProtectedLayout />}>

                        {/* HOME */}
                        <Route
                            path="/home"
                            element={<Home />}
                        />

                        {/* BLOOD */}
                        <Route
                            path="/blood"
                            element={<FindBlood />}
                        />

                        <Route
                            path="/blood/donor"
                            element={<BloodDonor />}
                        />

                        {/* SERVICES */}
                        <Route
                            path="/services/provider"
                            element={<ServiceProvider />}
                        />

                        {/* JOBS
                            Kept for later development.
                            Not shown in Navbar.
                        */}
                        <Route
                            path="/services"
                            element={<FindService />}
                        />

                        {/* REQUESTS */}
                        <Route
                            path="/requests"
                            element={<MyRequests />}
                        />

                        {/* PROFILE */}
                        <Route
                            path="/profile"
                            element={<Profile />}
                        />

                    </Route>
                </Route>

                {/* FALLBACK */}
                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/home"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;