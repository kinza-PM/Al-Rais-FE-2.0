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
      <div className="min-h-screen">
        <style>{`
          body {
            font-family: 'Inter', sans-serif;
          }
          .bg-sky-gradient {
            background-image: linear-gradient(180deg, #FFFFFF 8.5%, #8FAFE7 38.5%, #5383DA 52.37%, #85A7E5 67.93%, #FFFFFF 100%);
          }
          .header-gradient {
            background: linear-gradient(to bottom, white 60%, rgba(255, 255, 255, 0));
          }
          .modal-overlay {
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
          }
        `}</style>

        {location.pathname !== "/auth" && (
          <Header
            logoSrc={AlRaisLogo}
            onLoginClick={openLogin}
            onSignupClick={openSignup}
          />
        )}

        <main className={`${shouldAddGradient ? "bg-sky-gradient" : ""} min-h-screen`}>
          <Outlet context={{ onLoginClick: openLogin, onSignupClick: openSignup }} />
        </main>
      </div>
    </>
  );
};

export default AppLayout