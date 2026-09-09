import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CardNav from "./CardNav";
import logo from "./logoCC.png";
import { logoutUser } from "../services/api";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    }, []);

    const handleLogout = useCallback(() => {
        logoutUser();
        navigate("/login");
    }, [navigate]);

    const items = useMemo(() => [
        {
            label: "Explore",
            bgColor: "#1B1722",
            textColor: "#FFFFFF",

            links: [
                {
                    label: "Find Blood",
                    ariaLabel: "Find Blood",
                    href: "/blood"
                },

                {
                    label: "Donate Blood",
                    ariaLabel: "Donate Blood",
                    href: "/blood/donor"
                },

                {
                    label: "Find Service",
                    ariaLabel: "Find Local Services",
                    href: "/services"
                },

                {
                    label: "Provide Service",
                    ariaLabel: "Provide a Local Service",
                    href: "/services/provider"
                }
            ]
        },

        {
            label: "Community",
            bgColor: "#2F293A",
            textColor: "#FFFFFF",

            links: [
                {
                    label: "Home",
                    ariaLabel: "Go Home",
                    href: "/home"
                },

                {
                    label: "My Requests",
                    ariaLabel: "View My Requests",
                    href: "/requests"
                }
            ]
        },

        {
            label: "Account",
            bgColor: "#40384D",
            textColor: "#FFFFFF",

            links: user
                ? [
                      {
                          label: "Profile",
                          ariaLabel: "Open Profile",
                          href: "/profile"
                      },

                      {
                          label: "Logout",
                          ariaLabel: "Logout",
                          href: "#logout"
                      }
                  ]
                : [
                      {
                          label: "Login",
                          ariaLabel: "Login",
                          href: "/login"
                      }
                  ]
        }
    ], [user]);

    const handleNavigate = useCallback((path) => {
        navigate(path);
    }, [navigate]);

    return (
        <CardNav
            key={location.pathname}
            logo={logo}
            logoAlt="Community Connect"
            items={items}

            baseColor="#FFFFFF"
            menuColor="#111111"

            buttonBgColor="#111111"
            buttonTextColor="#FFFFFF"

            ease="power3.out"

            onNavigate={handleNavigate}

            onLogout={handleLogout}
        />
    );
}

export default Navbar;
