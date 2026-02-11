// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Logo from "../atoms/Logo";
// import Button from "../atoms/Button";
// import { useAuth } from "../../features/auth/hooks/useAuth";

// interface HeaderProps {
//   logoSrc: string;
//   onLoginClick: () => void;
//   onSignupClick: () => void;
// }

// const Header: React.FC<HeaderProps> = ({
//   logoSrc,
//   onLoginClick,
//   onSignupClick,
// }) => {
//   const { isAuthenticated, user, signOut } = useAuth();

//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     setIsDropdownOpen(false);
//     await signOut();
//     navigate("/");
//   };

//   return (
//     <header className="header-gradient">
//       <div className="w-full flex items-center justify-between py-4 px-4 sm:px-6 lg:px-10">
//         {/* Logo */}
//         <div className="flex items-center flex-shrink-0">
//           <Link to="/">
//             <Logo src={logoSrc} alt="Al Rais Travel logo" size="small" />
//           </Link>
//         </div>

//         {/* Navigation - Original Design */}
//         <nav className="flex items-center mt-3 space-x-10 sm:space-x-6 lg:space-x-20 sm:hidden text-base font-normal leading-none tracking-normal text-center align-middle font-inter text-black-200">
//           <Link to="/travel" className="hover:text-blue-700 whitespace-nowrap">
//             Travel
//           </Link>
//           <Link
//             to="/packages"
//             className="hover:text-blue-700 transition-colors whitespace-nowrap"
//           >
//             Packages
//           </Link>
//           <Link
//             to="/about"
//             className="hover:text-blue-700 transition-colors whitespace-nowrap"
//           >
//             About
//           </Link>
//           {isAuthenticated && (
//             <Link
//               to="/my-bookings"
//               className="hover:text-blue-700 transition-colors whitespace-nowrap"
//             >
//               My bookings
//             </Link>
//           )}
//         </nav>

//         {/* Auth Section - Original Design */}
//         <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
//           {isAuthenticated && user ? (
//             // Simple user display with dropdown
//             <div className="relative">
//               <button
//                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                 className="flex items-center space-x-3 text-sm font-medium text-gray-800 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2"
//               >
//                 <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
//                   <span className="text-white text-sm font-semibold">
//                     {user.name?.charAt(0).toUpperCase() || "U"}
//                   </span>
//                 </div>
//                 <span className="truncate font-medium text-gray-800">
//                   Welcome, {user.name?.split("@")[0] || "User"}
//                 </span>
//                 <svg
//                   className="w-4 h-4 transition-transform duration-200 text-gray-400"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M19 9l-7 7-7-7"
//                   />
//                 </svg>
//               </button>

//               {isDropdownOpen && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
//                   <Link
//                     to="/profile"
//                     className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     onClick={() => setIsDropdownOpen(false)}
//                   >
//                     View Profile
//                   </Link>
//                   <button
//                     onClick={handleLogout}
//                     className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//                   >
//                     Sign Out
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             // Original Login/Signup buttons
//             <>
//               <Button
//                 onClick={onLoginClick}
//                 variant="primary"
//                 className="px-4 py-2 sm:px-6 sm:py-2 lg:px-7 lg:py-2 text-xs sm:text-sm"
//               >
//                 Login
//               </Button>
//               <Button
//                 onClick={onSignupClick}
//                 variant="secondary"
//                 className="px-3 py-2 sm:px-5 sm:py-2 lg:px-6 lg:py-2 text-xs sm:text-sm"
//               >
//                 Sign up
//               </Button>
//             </>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;

// OLD WORKING

// DESIGN UI WORKING

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout, Menu, Dropdown, Avatar, Drawer } from "antd";
import {
  MenuOutlined,
  LogoutOutlined,
  ProfileOutlined,
<<<<<<< HEAD
  BellOutlined,
  ShoppingCartOutlined,
  GlobalOutlined,
  DollarOutlined,
=======
  ShoppingCartOutlined,
  DownOutlined,
>>>>>>> e5d323e56c7a28ba29f31972700039392a8f34be
} from "@ant-design/icons";
import { useAuth } from "../../features/auth/hooks/useAuth";
import Logo from "../atoms/Logo";
import Button from "../atoms/Button";
<<<<<<< HEAD
import toast from "react-hot-toast";
import {
  fetchNotificationsPage,
  markNotificationRead,
  subscribeToNotifications,
  type NotificationItem,
} from "../../services/notificationService";
import avatarImage from "../../assets/images/aavter.png";
import FlagUSA from "../../assets/svgs/Flag-usa.svg";
import FlagUAE from "../../assets/svgs/Flag-uae.svg";
import FlagIND from "../../assets/svgs/Flag-ind.svg";

const { Header } = Layout;

// Flag Icon Component
const FlagIcon: React.FC<{ src: string, size?: number }> = ({ src, size = 20 }) => (
  <div style={{ 
    width: `${size}px`, 
    height: `${size}px`, 
    borderRadius: '50%', 
    overflow: 'hidden', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    flexShrink: 0
  }}>
    <img src={src} alt="flag" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </div>
);
=======
import FlagUsa from "../../assets/svgs/Flag-usa.svg";

const { Header } = Layout;

const PRIMARY_BLUE = "#2351A3";
const OUTLINE_BLUE = "#5383DA";
const TEXT_DARK = "#081326";
>>>>>>> e5d323e56c7a28ba29f31972700039392a8f34be

interface HeaderProps {
  logoSrc: string;
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const AppHeader: React.FC<HeaderProps> = ({
  logoSrc,
  onLoginClick,
  onSignupClick,
}) => {
  const { isAuthenticated, user, signOut } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Dropdown menu for authenticated user
  const userMenu = {
    items: [
      {
        key: "profile",
        icon: <ProfileOutlined />,
        label: "View Profile",
        onClick: () => navigate("/profile"),
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        danger: true,
        label: "Sign Out",
        onClick: handleLogout,
      },
    ],
  };

  // Navigation links
  const navItems = [
    { key: "travel", label: <Link to="/travel">Travel</Link> },
    { key: "packages", label: <Link to="/packages">Packages</Link> },
    { key: "about", label: <Link to="/about">About</Link> },
    ...(isAuthenticated
      ? [
        {
          key: "my-bookings",
          label: <Link to="/my-bookings">My bookings</Link>,
        },
      ]
      : []),
  ];

  return (
    <Header
<<<<<<< HEAD
      style={{
        background: "#FFFFFF",
        padding: "0px 80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #E4E4E7",
        height: "auto",
        minHeight: "56px",
=======
      className="bg-white"
      style={{
        padding: "0 144px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #E5E7EB",
        height: 80,
>>>>>>> e5d323e56c7a28ba29f31972700039392a8f34be
      }}
    >
      {/* Logo */}
      <div>
        <Link
          to="/"
          aria-label="Go to home page"
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Logo src={logoSrc} alt="Al Rais Travel logo" size="small" />
        </Link>
      </div>

<<<<<<< HEAD
      {/* Desktop Navigation */}
      {!isMobile && isAuthenticated && user && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setDrawerVisible(true)}
            style={{
              width: "39px",
              height: "38px",
              border: "2px solid #5383DA",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F0F7FF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <MenuOutlined style={{ fontSize: "16px", color: "#3D495C" }} />
          </button>

          {/* USD Currency Selector */}
          <Dropdown
            menu={{
              items: [
                { 
                  key: "usd", 
                  label: (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
                      <FlagIcon src={FlagUSA} size={20} />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#0A0C0F" }}>USD - US Dollar</span>
                    </div>
                  )
                },
                { 
                  key: "aed", 
                  label: (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
                      <FlagIcon src={FlagUAE} size={20} />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#0A0C0F" }}>AED - UAE Dirham</span>
                    </div>
                  )
                },
                { 
                  key: "inr", 
                  label: (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
                      <FlagIcon src={FlagIND} size={20} />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#0A0C0F" }}>INR - Indian Rupee</span>
                    </div>
                  )
                },
              ],
            }}
            placement="bottomRight"
          >
            <button
              style={{
                height: "38px",
                padding: "0 12px",
                border: "2px solid #5383DA",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F0F7FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
            >
              <FlagIcon src={FlagUSA} size={18} />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#0A0C0F" }}>
                USD
              </span>
            </button>
          </Dropdown>

          {/* EN Language Selector */}
          <Dropdown
            menu={{
              items: [
                { 
                  key: "en", 
                  label: (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
                      <FlagIcon src={FlagUSA} size={20} />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#0A0C0F" }}>English</span>
                    </div>
                  )
                },
                { 
                  key: "ar", 
                  label: (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 0" }}>
                      <FlagIcon src={FlagUAE} size={20} />
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#0A0C0F" }}>العربية (Arabic)</span>
                    </div>
                  )
                },
              ],
            }}
            placement="bottomRight"
          >
            <button
              style={{
                height: "38px",
                padding: "0 12px",
                border: "2px solid #5383DA",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F0F7FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
            >
              <FlagIcon src={FlagUSA} size={18} />
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#0A0C0F" }}>
                EN
              </span>
            </button>
          </Dropdown>

          {/* Shopping Cart with Badge */}
          <button
            onClick={() => navigate("/cart")}
            style={{
              width: "39px",
              height: "38px",
              border: "2px solid #5383DA",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
              position: "relative",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F0F7FF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <ShoppingCartOutlined style={{ fontSize: "16px", color: "#3D495C" }} />
            <div
              style={{
                position: "absolute",
                top: "-7px",
                right: "-7px",
                backgroundColor: "#EA0029",
                color: "#FFFFFF",
                fontSize: "10px",
                fontWeight: 700,
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #FFFFFF",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              02
            </div>
          </button>

          {/* User Profile with Avatar */}
          <Dropdown menu={userMenu} placement="bottomRight" arrow>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: "8px",
                transition: "background-color 0.2s",
                marginLeft: "2px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <img
                src={avatarImage}
                alt="User avatar"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #E4E4E7",
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#0A0C0F",
                  whiteSpace: "nowrap",
                }}
              >
                Welcome, {user.name?.split("@")[0] || "User"}
              </span>
=======
      {/* Right side controls (desktop) */}
      {!isMobile && (
        <div className="flex items-center gap-4">
          {/* Menu pill */}
          <button
            type="button"
            onClick={() => setDrawerVisible(true)}
            className="flex items-center justify-center w-10 h-10 rounded-[16px] border text-[16px]"
            style={{
              borderColor: OUTLINE_BLUE,
              color: PRIMARY_BLUE,
              backgroundColor: "#FFFFFF",
            }}
          >
            <MenuOutlined />
          </button>

          {/* Currency pill */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 h-10 rounded-[16px] border text-sm font-medium"
            style={{
              borderColor: OUTLINE_BLUE,
              color: TEXT_DARK,
              backgroundColor: "#FFFFFF",
            }}
          >
            <img
              src={FlagUsa}
              alt="USD"
              className="w-5 h-5 rounded-full object-cover"
            />
            <span>USD</span>
            <DownOutlined style={{ fontSize: 12 }} />
          </button>

          {/* Language pill */}
          <button
            type="button"
            className="flex items-center gap-2 px-4 h-10 rounded-[16px] border text-sm font-medium"
            style={{
              borderColor: OUTLINE_BLUE,
              color: TEXT_DARK,
              backgroundColor: "#FFFFFF",
            }}
          >
            <img
              src={FlagUsa}
              alt="English"
              className="w-5 h-5 rounded-full object-cover"
            />
            <span>EN</span>
          </button>

          {/* Auth / actions */}
          {isAuthenticated && user ? (
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  paddingInline: 12,
                  height: 40,
                  borderRadius: 9999,
                  border: `1px solid ${OUTLINE_BLUE}`,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Avatar
                  style={{ backgroundColor: PRIMARY_BLUE }}
                  size="small"
                >
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <span style={{ marginLeft: 8, color: TEXT_DARK }}>
                  {user.name?.split("@")[0] || "User"}
                </span>
                <DownOutlined style={{ fontSize: 12, marginLeft: 4 }} />
              </div>
            </Dropdown>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                onClick={onLoginClick}
                overrideClasses
                className="px-6 h-10 rounded-[16px] border text-sm font-medium bg-white hover:bg-[#E6F0FF] transition-colors"
                type="button"
              >
                <span className="text-[#2351A3]">Login</span>
              </Button>
              <Button
                onClick={onSignupClick}
                overrideClasses
                className="px-6 h-10 rounded-[16px] border text-sm font-medium shadow-sm transition-colors text-[#2351A3] hover:bg-[#E6F0FF]"
                type="button"
              >
                <span>Sign up</span>
              </Button>

              {/* Cart pill */}
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 rounded-[16px] border text-[16px]"
                style={{
                  borderColor: OUTLINE_BLUE,
                  color: PRIMARY_BLUE,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <ShoppingCartOutlined />
              </button>
>>>>>>> e5d323e56c7a28ba29f31972700039392a8f34be
            </div>
          </Dropdown>
        </div>
      )}

      {/* Desktop Navigation - Not Logged In */}
      {!isMobile && !isAuthenticated && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button
            onClick={onLoginClick}
            variant="primary"
            className="px-4 py-2 sm:px-6 sm:py-2 lg:px-7 lg:py-2 text-xs sm:text-sm"
          >
            Login
          </Button>
          <Button
            onClick={onSignupClick}
            variant="secondary"
            className="px-3 py-2 sm:px-5 sm:py-2 lg:px-6 lg:py-2 text-xs sm:text-sm"
          >
            Sign up
          </Button>
        </div>
      )}

<<<<<<< HEAD
      <Modal
        title="Notifications"
        open={showAllNotifications}
        onCancel={() => setShowAllNotifications(false)}
        footer={null}
        width={520}
      >
        {notifications.length === 0 ? (
          <div style={{ color: "#6b7280" }}>No notifications</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications.map((n) => (
              <div
                key={n.notificationId}
                onClick={() => void handleMarkRead(n)}
                style={{
                  cursor: "pointer",
                  padding: 12,
                  borderRadius: 12,
                  background: n.read ? "#ffffff" : "#E0F2FF",
                  border: n.read ? "1px solid #f3f4f6" : "1px solid #bfdbfe",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 12,
                    marginBottom: 6,
                  }}
                >
                  <Typography.Text strong style={{ fontSize: 16 }}>
                    {n.title}
                  </Typography.Text>
                  {!n.read && (
                    <Typography.Text style={{ color: "#2563eb", fontSize: 12 }}>
                      Unread
                    </Typography.Text>
                  )}
                </div>
                <Typography.Text style={{ color: "#4b5563", display: "block" }}>
                  {n.message}
                </Typography.Text>
                <Typography.Text
                  style={{ color: "#9ca3af", fontSize: 12, display: "block", marginTop: 6 }}
                >
                  {formatTimestamp(n.createdAt)}
                </Typography.Text>
              </div>
            ))}

            {notifNextToken && (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>
                <button
                  type="button"
                  onClick={() => void loadMoreNotifications()}
                  disabled={notifLoadingMore}
                  style={{
                    border: "1px solid #bfdbfe",
                    background: "#ffffff",
                    color: "#2563eb",
                    fontWeight: 700,
                    borderRadius: 10,
                    padding: "8px 14px",
                    cursor: notifLoadingMore ? "not-allowed" : "pointer",
                  }}
                >
                  {notifLoadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Mobile View */}
      {isMobile && isAuthenticated && user && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Shopping Cart */}
          <button
            onClick={() => navigate("/cart")}
            style={{
              width: "40px",
              height: "40px",
              border: "2px solid #5383DA",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <ShoppingCartOutlined style={{ fontSize: "16px", color: "#3D495C" }} />
            <div
              style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                backgroundColor: "#EA0029",
                color: "#FFFFFF",
                fontSize: "10px",
                fontWeight: 700,
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #FFFFFF",
              }}
            >
              02
            </div>
          </button>

          {/* Hamburger Menu */}
          <button
            onClick={() => setDrawerVisible(true)}
            style={{
              width: "40px",
              height: "40px",
              border: "2px solid #5383DA",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
            }}
          >
            <MenuOutlined style={{ fontSize: "16px", color: "#3D495C" }} />
          </button>
        </div>
      )}

      {/* Mobile View - Not Logged In */}
      {isMobile && !isAuthenticated && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button
            onClick={onLoginClick}
            variant="primary"
            className="px-3 py-1.5 text-xs"
          >
            Login
          </Button>
          <Button
            onClick={onSignupClick}
            variant="secondary"
            className="px-3 py-1.5 text-xs"
          >
            Sign up
          </Button>
        </div>
=======
      {/* Mobile: simple menu + auth in drawer */}
      {isMobile && (
        <MenuOutlined
          style={{ fontSize: 22, cursor: "pointer", color: PRIMARY_BLUE }}
          onClick={() => setDrawerVisible(true)}
        />
>>>>>>> e5d323e56c7a28ba29f31972700039392a8f34be
      )}

      {/* Drawer for navigation & auth (all breakpoints) */}
      <Drawer
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
      >
        {/* User Profile in Drawer */}
        {isAuthenticated && user && (
          <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #E4E4E7" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: 16 }}>
              <img
                src={avatarImage}
                alt="User avatar"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #E4E4E7",
                }}
              />
              <div>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#0A0C0F" }}>
                  {user.name?.split("@")[0] || "User"}
                </div>
                <div style={{ fontSize: "13px", color: "#3D495C" }}>
                  {user.email || ""}
                </div>
              </div>
            </div>

            {/* Currency & Language Selectors */}
            <div style={{ display: "flex", gap: "8px", marginBottom: 12 }}>
              <Dropdown
                menu={{
                  items: [
                    { key: "usd", label: "🇺🇸 USD - US Dollar" },
                    { key: "eur", label: "🇪🇺 EUR - Euro" },
                    { key: "gbp", label: "🇬🇧 GBP - British Pound" },
                    { key: "aed", label: "🇦🇪 AED - UAE Dirham" },
                  ],
                }}
              >
                <button
                  style={{
                    flex: 1,
                    height: "40px",
                    border: "2px solid #5383DA",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    backgroundColor: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "18px", lineHeight: 1 }}>🇺🇸</span>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#0A0C0F" }}>USD</span>
                </button>
              </Dropdown>

              <Dropdown
                menu={{
                  items: [
                    { key: "en", label: "🇺🇸 English" },
                    { key: "ar", label: "🇸🇦 العربية (Arabic)" },
                    { key: "fr", label: "🇫🇷 Français (French)" },
                  ],
                }}
              >
                <button
                  style={{
                    flex: 1,
                    height: "40px",
                    border: "2px solid #5383DA",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    backgroundColor: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "18px", lineHeight: 1 }}>🇺🇸</span>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#0A0C0F" }}>EN</span>
                </button>
              </Dropdown>
            </div>
          </div>
        )}

        <Menu
          mode="vertical"
          items={navItems}
          style={{ borderRight: "none" }}
          onClick={() => setDrawerVisible(false)}
        />

<<<<<<< HEAD
        {/* Drawer Actions */}
        {isAuthenticated && user && (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => {
                setDrawerVisible(false);
                navigate("/profile");
              }}
              style={{
                padding: "12px 16px",
                border: "2px solid #5383DA",
                borderRadius: "16px",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#0A0C0F",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F0F7FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
=======
        {/* Auth in Drawer */}
        <div style={{ marginTop: 20 }}>
          {isAuthenticated && user ? (
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Avatar style={{ backgroundColor: PRIMARY_BLUE }} size="large">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <span style={{ marginLeft: 8 }}>
                  Welcome, {user.name?.split("@")[0] || "User"}
                </span>
              </div>
            </Dropdown>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
>>>>>>> e5d323e56c7a28ba29f31972700039392a8f34be
              }}
            >
              <ProfileOutlined style={{ fontSize: "18px", color: "#5383DA" }} />
              View Profile
            </button>
            <button
              onClick={() => {
                setDrawerVisible(false);
                handleLogout();
              }}
              style={{
                padding: "12px 16px",
                border: "2px solid #EA0029",
                borderRadius: "16px",
                backgroundColor: "#FFF5F5",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#EA0029",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FFE5E5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFF5F5";
              }}
            >
              <LogoutOutlined style={{ fontSize: "18px" }} />
              Sign Out
            </button>
          </div>
        )}
      </Drawer>
    </Header>
  );
};

export default AppHeader;

// DESIGN UI WORKING
