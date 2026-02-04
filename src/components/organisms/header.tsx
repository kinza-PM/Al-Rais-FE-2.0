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
import { Layout, Menu, Dropdown, Avatar, Drawer, Badge, Modal, Typography } from "antd";
import {
  MenuOutlined,
  // UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../features/auth/hooks/useAuth";
import Logo from "../atoms/Logo";
import Button from "../atoms/Button";
import toast from "react-hot-toast";
import {
  fetchNotificationsPage,
  markNotificationRead,
  subscribeToNotifications,
  type NotificationItem,
} from "../../services/notificationService";

const { Header } = Layout;

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
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notifNextToken, setNotifNextToken] = useState<string | null>(null);
  const [notifLoadingMore, setNotifLoadingMore] = useState(false);
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

  useEffect(() => {
    let subscription: { unsubscribe?: () => void } | undefined;

    const init = async () => {
      if (!isAuthenticated || !user?.id) return;
      try {
        const page = await fetchNotificationsPage(user.id, 20, null);
        setNotifications(page.items ?? []);
        setNotifNextToken(page.nextToken ?? null);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }

      subscription = subscribeToNotifications(
        user.id,
        (notification) => {
          setNotifications((prev) => {
            const exists = prev.some((n) => n.notificationId === notification.notificationId);
            return exists ? prev : [notification, ...prev];
          });
          toast.success(notification.title || "New notification");
        },
        (err) => {
          console.error("Notification subscription error", err);
          toast.error("Real-time notifications disconnected");
        }
      );
    };

    void init();

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [isAuthenticated, user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const topNotifications = notifications.slice(0, 5);
  const hasMoreNotifications = notifications.length > 5;

  const formatTimestamp = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "" : d.toLocaleString();
  };

  const handleMarkRead = async (notification: NotificationItem) => {
    if (!user?.id) return;
    if (notification.read) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notification.notificationId ? { ...n, read: true } : n
      )
    );

    try {
      await markNotificationRead(user.id, notification.notificationId);
    } catch (err) {
      // Rollback on failure
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notification.notificationId
            ? { ...n, read: false }
            : n
        )
      );
      console.error("Failed to mark notification read", err);
      toast.error("Failed to mark as read");
    }
  };

  const loadMoreNotifications = async () => {
    if (!user?.id) return;
    if (!notifNextToken) return;
    if (notifLoadingMore) return;

    setNotifLoadingMore(true);
    try {
      const page = await fetchNotificationsPage(user.id, 20, notifNextToken);
      setNotifications((prev) => {
        const seen = new Set(prev.map((n) => n.notificationId));
        const merged = [...prev];
        for (const n of page.items ?? []) {
          if (!seen.has(n.notificationId)) merged.push(n);
        }
        return merged;
      });
      setNotifNextToken(page.nextToken ?? null);
    } catch (err) {
      console.error("Failed to load more notifications", err);
      toast.error("Failed to load more notifications");
    } finally {
      setNotifLoadingMore(false);
    }
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

  const notificationMenu = {
    items:
      topNotifications.length > 0
        ? [
          ...topNotifications.map((notification) => ({
            key: notification.notificationId,
            label: (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  minWidth: 240,
                  padding: 8,
                  borderRadius: 8,
                  marginBottom: 6,
                  backgroundColor: notification.read ? "#ffffff" : "#E0F2FF",
                  border: notification.read
                    ? "1px solid #f3f4f6"
                    : "1px solid #bfdbfe",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>
                    {notification.title}
                  </span>
                  {!notification.read && (
                    <span style={{ fontSize: 10, color: "#2563eb" }}>Unread</span>
                  )}
                </div>
                <span style={{ color: "#4b5563" }}>{notification.message}</span>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  {formatTimestamp(notification.createdAt)}
                </span>
              </div>
            ),
          })),
          ...(hasMoreNotifications
            ? [
              {
                key: "show-more",
                label: (
                  <div
                    style={{
                      padding: "8px 10px",
                      color: "#2563eb",
                      fontWeight: 600,
                    }}
                  >
                    Show more
                  </div>
                ),
                onClick: () => setShowAllNotifications(true),
              },
            ]
            : []),
        ]
        : [
          {
            key: "empty",
            label: (
              <div style={{ color: "#6b7280" }}>No new notifications</div>
            ),
            disabled: true,
          },
        ],
    onClick: ({ key }: { key: string }) => {
      if (key === "show-more") {
        setShowAllNotifications(true);
        return;
      }
      const n = notifications.find((x) => x.notificationId === key);
      if (n) void handleMarkRead(n);
    },
  };

  // Navigation links
  const navItems = [
    // { key: "travel", label: <Link to="/travel">Travel</Link> },
    // { key: "packages", label: <Link to="/packages">Packages</Link> },
    // { key: "about", label: <Link to="/about">About</Link> },
    { key: "travel", label: <Link to="#">Travel</Link> },
    { key: "packages", label: <Link to="#">Packages</Link> },
    { key: "about", label: <Link to="#">About</Link> },
    ...(isAuthenticated
      ? [
        {
          key: "my-bookings",
          label: <Link to="/my-bookings">My bookings</Link>,
        },
      ]
      : []),
  ];

  const notificationTrigger = (
    <Dropdown
      menu={notificationMenu}
      placement="bottomRight"
      trigger={["click"]}
    >
      <Badge
        count={unreadCount || null}
        overflowCount={9}
        size="small"
        showZero={false}
      >
        <BellOutlined
          style={{ fontSize: 20, color: "#1f2937", cursor: "pointer" }}
          aria-label="Notifications"
        />
      </Badge>
    </Dropdown>
  );

  return (
    <Header
      className="header-gradient"
      style={{
        padding: "0 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Logo */}
      <div>
        <Link to="/"
          aria-label="Go to home page"
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Logo src={logoSrc} alt="Al Rais Travel logo" size="small" />
        </Link>
      </div>

      {/* Desktop Navigation */}
      {!isMobile && (
        <div style={{ display: "flex", gap: "20px" }}>
          {navItems.map((item) => (
            <div key={item.key}>{item.label}</div>
          ))}
        </div>
      )}
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {notificationTrigger}
          {/* Auth Section */}
          {isAuthenticated && user ? (
            <Dropdown menu={userMenu} placement="bottomRight" arrow>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <Avatar style={{ backgroundColor: "#1890ff" }} size="large">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <span style={{ marginLeft: 8 }}>
                  Welcome, {user.name?.split("@")[0] || "User"}
                </span>
              </div>
            </Dropdown>
          ) : (
            <div style={{ display: "flex", gap: "10px" }}>
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
        </div>
      )}

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

      {/* Mobile Hamburger Button */}
      {isMobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {notificationTrigger}
          <MenuOutlined
            style={{ fontSize: 22, cursor: "pointer" }}
            onClick={() => setDrawerVisible(true)}
          />
        </div>
      )}

      {/* Mobile Drawer */}
      <Drawer
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Menu
          mode="vertical"
          items={navItems}
          style={{ borderRight: "none" }}
          onClick={() => setDrawerVisible(false)}
        />

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
                <Avatar style={{ backgroundColor: "#1890ff" }} size="large">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <span style={{ marginLeft: 8 }}>
                  Welcome, {user.name?.split("@")[0] || "User"}
                </span>
              </div>
            </Dropdown>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
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
        </div>
      </Drawer>
    </Header>
  );
};

export default AppHeader;

// DESIGN UI WORKING
