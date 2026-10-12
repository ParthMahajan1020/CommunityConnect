import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function BrandLogo() {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#427A65] text-white shadow-sm">
        <svg
          width="25"
          height="25"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 3.5C12 3.5 5 11 5 15.5a7 7 0 0 0 14 0C19 11 12 3.5 12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 15.5a3.5 3.5 0 0 0 3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div>
        <span className="block text-lg font-bold tracking-tight text-[#24342E]">
          CommunityConnect
        </span>
        <span className="block text-xs text-[#6F7D76]">Together, we help.</span>
      </div>
    </Link>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const successMessage = location.state?.message;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const email = formData.email.trim();

    if (!email || !formData.password) {
      setError("Please enter your email address and password.");
      return;
    }

    setLoading(true);

    try {
      await loginUser({
        email,
        password: formData.password,
      });

      const destination = location.state?.from;
      const safeDestination =
        typeof destination?.pathname === "string" &&
        destination.pathname.startsWith("/") &&
        !destination.pathname.startsWith("//")
          ? `${destination.pathname}${destination.search || ""}${destination.hash || ""}`
          : "/home";

      navigate(safeDestination, { replace: true });
    } catch (err) {
      const responseData = err.response?.data;

      if (responseData?.requiresEmailVerification) {
        navigate("/verify-email", {
          replace: true,
          state: {
            email: responseData.email || email,
            message:
              responseData.message ||
              "Please verify your email address before logging in.",
          },
        });
        return;
      }

      setError(
        responseData?.message ||
          responseData?.error ||
          "Unable to log in. Please check your credentials and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAF9] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="mb-8 sm:mb-10">
          <BrandLogo />
        </header>

        <div className="grid flex-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
          {/* Welcome section */}
          <section className="hidden lg:block">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DCE9E0] bg-[#EDF5EF] px-4 py-2 text-sm font-medium text-[#427A65]">
              <span className="h-2 w-2 rounded-full bg-[#427A65]" />
              Good to have you back
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-[1.15] tracking-tight text-[#24342E] xl:text-6xl">
              A little help
              <br />
              can make a
              <br />
              <span className="text-[#427A65]">big difference.</span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-8 text-[#6F7D76]">
              Sign in to find blood donors, discover local services, and stay
              connected with your community.
            </p>

            <div className="mt-10 max-w-md rounded-3xl border border-[#E2E9E4] bg-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E5F1EA] text-[#427A65]">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3 4.5 6v5.2c0 4.5 3 7.8 7.5 9.8 4.5-2 7.5-5.3 7.5-9.8V6L12 3Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m9 12 2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="font-semibold text-[#24342E]">
                    Your community, one connection away.
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#6F7D76]">
                    Access your account and manage your community connections in
                    one place.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Login form */}
          <section className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-[#E2E9E4] bg-white p-5 shadow-[0_12px_50px_rgba(36,52,46,0.04)] sm:p-8 md:p-10">
              <div className="mb-8">
                <p className="mb-3 text-sm font-semibold text-[#427A65]">
                  WELCOME BACK
                </p>

                <h2 className="text-3xl font-semibold tracking-tight text-[#24342E] sm:text-4xl">
                  Log in.
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#6F7D76]">
                  Enter your details to continue to CommunityConnect.
                </p>
              </div>

              {successMessage && (
                <div
                  role="status"
                  className="mb-6 rounded-xl border border-[#D4E7D9] bg-[#EDF7EF] px-4 py-3 text-sm leading-6 text-[#356651]"
                >
                  {successMessage}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-[#F0D1D5] bg-[#FBEAEC] px-4 py-3 text-sm leading-6 text-[#A63843]"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-[#34463D]"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="h-12 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-4 text-sm text-[#24342E] outline-none transition placeholder:text-[#9AA69F] hover:border-[#C9D8CF] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-[#34463D]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="h-12 w-full rounded-xl border border-[#E2E9E4] bg-[#FBFCFB] px-4 pr-12 text-sm text-[#24342E] outline-none transition placeholder:text-[#9AA69F] hover:border-[#C9D8CF] focus:border-[#427A65] focus:bg-white focus:ring-4 focus:ring-[#427A65]/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#6F7D76] transition hover:bg-[#F0F5F2] hover:text-[#427A65] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#427A65]"
                    >
                      {showPassword ? (
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.2A11.8 11.8 0 0 1 12 5c5 0 8.5 5 8.5 7a8.5 8.5 0 0 1-2.2 3.5M6.2 6.3C3.9 7.8 2.5 10.2 2.5 12c0 2 3.5 7 9.5 7 1.3 0 2.5-.3 3.6-.8"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="19"
                          height="19"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#427A65] px-5 text-sm font-semibold text-white transition duration-200 hover:bg-[#356651] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#427A65]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Log in to your account
                      <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 h-px bg-[#EDF1EE]" />

              <p className="text-center text-sm text-[#6F7D76]">
                New to CommunityConnect?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-[#427A65] underline-offset-4 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-[#89958E]">
              Connecting people. Strengthening communities.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
