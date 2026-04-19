import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AlRaisLogo from "../../assets/images/alRaisLogo.jpg";
import AppHeader from "../organisms/header";
import Footer from "../organisms/Footer";
import ChatBot from "../organisms/ChatBot";
import AuthModal from "../organisms/AuthModal";
import { Suspense, useCallback, useEffect, useState } from "react";
import RouteLoadingFallback from "../common/RouteLoadingFallback";
import SessionExpiryWarning from "../../features/auth/components/SessionExpiryWarning";
import { AuthService } from "../../features/auth/services/authService";
import type { AuthMode } from "../../types/AuthTypes";
import { useAuth } from "../../features/auth/hooks/useAuth";

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();

  const [hideHeader, setHideHeader] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [headerKey, setHeaderKey] = useState<number>(0);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
    };

    void checkAuth();
  }, [location.pathname]);

  // When on /auth route, show the auth modal (same as navbar) instead of full page
  useEffect(() => {
    if (location.pathname === "/auth") {
      const mode = (location.state as { mode?: AuthMode } | undefined)?.mode ?? "login";
      setAuthMode(mode);
      setAuthModalOpen(true);
    }
  }, [location.pathname, location.state]);

  // Scroll to top when navigating to a new page (e.g. footer links)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  const openLogin = () => {
    setAuthMode("login");
    setAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthMode("signup");
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    if (location.pathname === "/auth") {
      const state = (location.state || {}) as {
        returnUrl?: string;
        bookingData?: unknown;
        from?: string;
      };

      const targetPath = state.returnUrl || state.from || "/";

      navigate(targetPath, {
        replace: true,
        state: state.bookingData ?? undefined,
      });
    }
  };

  const handleAuthSuccess = async () => {
    await refreshAuth();
    setHeaderKey((prev) => prev + 1);
  };

  // Keep header/auth UI in sync when auth is completed from non-shared hooks (e.g. booking modals).
  const handleExternalAuthChanged = useCallback(() => {
    void handleAuthSuccess();
  }, [refreshAuth]);

  useEffect(() => {
    const onAuthChanged = () => handleExternalAuthChanged();
    window.addEventListener("alrais:auth-changed", onAuthChanged);
    return () => window.removeEventListener("alrais:auth-changed", onAuthChanged);
  }, [handleExternalAuthChanged]);

  // Apply gradient only where desired (remove "/" so LandingPage stays neutral)
  const gradientRoutes = ["/about"]; // define routes to show the gradient
  const shouldAddGradient = gradientRoutes.includes(location.pathname);

  return (
    <>
      <div
        className={`${shouldAddGradient ? "bg-sky-gradient" : ""} min-h-screen`}
      >
        <style>{`
          body {
            font-family: 'Inter', sans-serif;
          }
          .bg-sky-gradient {
            background: linear-gradient(107.56deg, #FFFFFF 0%, #A7C0EC 100%);
          }
          .header-gradient {
            background: transparent;
          }
          .modal-overlay {
            background-color: rgba(10, 12, 15, 0.55);
            backdrop-filter: blur(12px) saturate(1.4);
            -webkit-backdrop-filter: blur(12px) saturate(1.4);
          }
          .underline-blur {
            position: absolute;
            background: #5383DA;
            border-radius: 9999px;
            filter: blur(0);
            -webkit-mask-image: linear-gradient(to top, rgb(83, 131, 218, 1), transparent);
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-size: 100% 100%;
          }
          .hide-date-icon::-webkit-calendar-picker-indicator { opacity: 0; display: block; width: 0; height: 0; }
          .hide-date-icon::-webkit-inner-spin-button,
          .hide-date-icon::-webkit-clear-button { display: none; }
          .hide-date-icon { color-scheme: light; }
        `}</style>

        {!hideHeader && (
          <AppHeader
            key={headerKey}
            logoSrc={AlRaisLogo}
            onLoginClick={openLogin}
            onSignupClick={openSignup}
          />
        )}

        {/* Auth Modal — opens as overlay, stays on current page */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={closeAuthModal}
          onAuthSuccess={handleAuthSuccess}
          mode={authMode}
          onModeChange={setAuthMode}
          logoSrc={AlRaisLogo}
        />

        {/* Silent Cognito refresh before token expiry (no modal) */}
        {isAuthenticated && <SessionExpiryWarning />}

        <main className="min-h-screen">
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet
              context={{
                onLoginClick: openLogin,
                onSignupClick: openSignup,
                setHideHeader,
              }}
            />
          </Suspense>
        </main>
        <Footer />
        <ChatBot />
      </div>
    </>
  );
};

export default AppLayout;
