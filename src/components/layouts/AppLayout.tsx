import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AlRaisLogo from "../../assets/images/alRaisLogo.jpg";
import Header from "../organisms/header";


const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const openLogin = () => {
    navigate("/auth", { state: { mode: "login" } });
  };

  const openSignup = () => {
    navigate("/auth", { state: { mode: "signup" } });
  };

  const gradientRoutes = ["/", "/about"]; // define routes to show the gradient
  const shouldAddGradient = gradientRoutes.includes(location.pathname);

  return (
    <>
      <div className={`${shouldAddGradient ? "bg-sky-gradient" : ""} min-h-screen`}>
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
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
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

        {location.pathname !== "/auth" && (
          <Header
            logoSrc={AlRaisLogo}
            onLoginClick={openLogin}
            onSignupClick={openSignup}
          />
        )}

        <main className="min-h-screen">
          <Outlet context={{ onLoginClick: openLogin, onSignupClick: openSignup }} />
        </main>
      </div>
    </>
  );
};

export default AppLayout