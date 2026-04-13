import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout, Menu, Dropdown, Drawer, Modal, Typography } from "antd";
import {
  MenuOutlined,
  LogoutOutlined,
  ProfileOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../features/auth/hooks/useAuth";
import Logo from "../atoms/Logo";
import Button from "../atoms/Button";
import {
  fetchNotificationsPage,
  markNotificationRead,
  type NotificationItem,
} from "../../services/notificationService";
import avatarImage from "../../assets/images/aavter.png";
import FlagUSA from "../../assets/svgs/Flag-usa.svg";
import FlagUAE from "../../assets/svgs/Flag-uae.svg";
import FlagIND from "../../assets/svgs/Flag-ind.svg";
import FlagUSCircle from "../../assets/images/flagofunitedstate.png";
import BasketIcon from "../../assets/images/Basket.png";
import CurrencyChevronIcon from "../../assets/images/Icon.png";
import { useUserProfileStore } from "../../store/userProfileStore";
import { buildMyBookingsUrl } from "../../utils/myBookingsUrl";

const { Header } = Layout;

// Flag Icon Component
const FlagIcon: React.FC<{ src: string; size?: number }> = ({
  src,
  size = 20,
}) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <img
      src={src}
      alt="flag"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </div>
);

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
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1200,
  );
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifNextToken, setNotifNextToken] = useState<string | null>(null);
  const [notifLoadingMore, setNotifLoadingMore] = useState(false);
  const navigate = useNavigate();

  const { avatarUrl, initials, displayName, fetchProfile, reset } =
    useUserProfileStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1200);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      void fetchProfile(user);
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await signOut();
    reset();
    navigate("/");
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const handleMarkRead = async (notification: NotificationItem) => {
    if (notification.read || !user?.id) return;
    try {
      await markNotificationRead(user.id, notification.notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notification.notificationId
            ? { ...n, read: true }
            : n,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const loadMoreNotifications = async () => {
    if (!notifNextToken || notifLoadingMore || !user?.id) return;
    setNotifLoadingMore(true);
    try {
      const response = await fetchNotificationsPage(
        user.id,
        20,
        notifNextToken,
      );
      setNotifications((prev) => [...prev, ...(response.items || [])]);
      setNotifNextToken(response.nextToken || null);
    } catch (error) {
      console.error("Failed to load more notifications:", error);
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

  // Navigation links
  const navItems = [
    { key: "home", label: <Link to="/">Home</Link> },
    { key: "travel", label: <Link to="/travel">Travel</Link> },
    { key: "packages", label: <Link to="/packages">Packages</Link> },
    { key: "about", label: <Link to="/about">About</Link> },
    ...(isAuthenticated
      ? [
          {
            key: "my-bookings",
            label: (
              <Link to={buildMyBookingsUrl()}>My bookings</Link>
            ),
          },
        ]
      : []),
  ];

  return (
    <Header
      className="bg-white"
      style={{
        background: "#FFFFFF",
        padding: isMobile ? "12px 16px" : isTablet ? "14px 24px" : "16px 134px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "2px solid #C2CAD6",
        height: "auto",
        minHeight: isMobile ? "72px" : "88px",
        width: "100%",
        boxSizing: "border-box",
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

      {/* Desktop right controls (Figma-style header) */}
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", gap: isTablet ? "8px" : "12px" }}>
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setDrawerVisible(true)}
            style={{
              width: isTablet ? "44px" : "50px",
              height: isTablet ? "44px" : "50px",
              border: "1.5px solid #5383DA",
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "4px 0",
                      }}
                    >
                      <FlagIcon src={FlagUSA} size={20} />
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#0A0C0F",
                        }}
                      >
                        USD - US Dollar
                      </span>
                    </div>
                  ),
                },
                {
                  key: "aed",
                  label: (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "4px 0",
                      }}
                    >
                      <FlagIcon src={FlagUAE} size={20} />
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#0A0C0F",
                        }}
                      >
                        AED - UAE Dirham
                      </span>
                    </div>
                  ),
                },
                {
                  key: "inr",
                  label: (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "4px 0",
                      }}
                    >
                      <FlagIcon src={FlagIND} size={20} />
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#0A0C0F",
                        }}
                      >
                        INR - Indian Rupee
                      </span>
                    </div>
                  ),
                },
              ],
            }}
            placement="bottomRight"
          >
            <button
              style={{
                width: isTablet ? "96px" : "110px",
                height: isTablet ? "44px" : "50px",
                padding: isTablet ? "0 12px" : "0 16px",
                border: "1.5px solid #5383DA",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
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
              <FlagIcon src={FlagUSCircle} size={isTablet ? 20 : 24} />
              <span
                style={{
                  fontSize: isTablet ? "12px" : "13px",
                  fontWeight: 500,
                  color: "#0A0C0F",
                }}
              >
                USD
              </span>
              <img
                src={CurrencyChevronIcon}
                alt="Open currency dropdown"
                style={{
                  width: "16px",
                  height: "16px",
                  objectFit: "contain",
                  marginLeft: "2px",
                }}
              />
            </button>
          </Dropdown>

          {/* EN Language Selector — removed from header per request */}

          {/* Auth area: avatar when logged in, Login/Sign up when not */}
          {isAuthenticated && user ? (
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
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User avatar"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid #E4E4E7",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#2351A3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid #E4E4E7",
                    }}
                  >
                    <span
                      style={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                    >
                      {initials}
                    </span>
                  </div>
                )}
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#0A0C0F",
                    whiteSpace: "nowrap",
                  }}
                >
                  Welcome, {displayName.split("@")[0]}
                </span>
              </div>
            </Dropdown>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isTablet ? "6px" : "8px",
                marginLeft: "8px",
              }}
            >
              <Button
                onClick={onLoginClick}
                overrideClasses
                className="
                  h-[47px]
                  px-[20px] xl:px-[40px]
                  rounded-[16px]
                  border-[1.5px]
                  border-[#5383DA]
                  text-[#2351A3]
                  text-[13px] xl:text-[14px]
                  font-semibold
                  flex items-center justify-center gap-[10px]
                  bg-white
                "
              >
                Login
              </Button>
              <Button
                onClick={onSignupClick}
                overrideClasses
                className="
                  h-[47px]
                  px-[20px] xl:px-[40px]
                  rounded-[16px]
                  border-[1.5px]
                  border-[#5383DA]
                  text-[#2351A3]
                  text-[13px] xl:text-[14px]
                  font-semibold
                  flex items-center justify-center gap-[10px]
                  bg-white
                "
              >
                Sign up
              </Button>
            </div>
          )}

          {/* Basket icon after Sign up */}
          <button
            onClick={() => navigate("/cart")}
            style={{
              width: isTablet ? "44px" : "50px",
              height: isTablet ? "44px" : "50px",
              border: "1.5px solid #5383DA",
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
            <img
              src={BasketIcon}
              alt="Cart"
              style={{ width: "24px", height: "24px", objectFit: "contain" }}
            />
          </button>
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
                  style={{
                    color: "#9ca3af",
                    fontSize: 12,
                    display: "block",
                    marginTop: 6,
                  }}
                >
                  {formatTimestamp(n.createdAt)}
                </Typography.Text>
              </div>
            ))}

            {notifNextToken && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  paddingTop: 6,
                }}
              >
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
            <ShoppingCartOutlined
              style={{ fontSize: "16px", color: "#3D495C" }}
            />
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
            overrideClasses
            className="h-[40px] px-3 rounded-[12px] border-[1.5px] border-[#5383DA] bg-[#2351A3] text-[#FFFFFF] text-xs font-semibold"
          >
            Login
          </Button>
          <Button
            onClick={onSignupClick}
            overrideClasses
            className="h-[40px] px-3 rounded-[12px] border-[1.5px] border-[#5383DA] bg-[#FFFFFF] text-[#2351A3] text-xs font-semibold"
          >
            Sign up
          </Button>
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
            aria-label="Open menu"
          >
            <MenuOutlined style={{ fontSize: "16px", color: "#3D495C" }} />
          </button>
        </div>
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
          <div
            style={{
              marginBottom: 24,
              paddingBottom: 24,
              borderBottom: "1px solid #E4E4E7",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: 16,
              }}
            >
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
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#0A0C0F",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user.name?.split("@")[0] || "User"}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#3D495C",
                    maxWidth: "100%",
                    lineHeight: 1.35,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
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
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#0A0C0F",
                    }}
                  >
                    USD
                  </span>
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
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#0A0C0F",
                    }}
                  >
                    EN
                  </span>
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

        {!isAuthenticated && (
          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <button
              onClick={() => {
                setDrawerVisible(false);
                onLoginClick();
              }}
              style={{
                padding: "12px 16px",
                border: "1.5px solid #5383DA",
                borderRadius: "14px",
                backgroundColor: "#2351A3",
                color: "#FFFFFF",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Login
            </button>
            <button
              onClick={() => {
                setDrawerVisible(false);
                onSignupClick();
              }}
              style={{
                padding: "12px 16px",
                border: "1.5px solid #5383DA",
                borderRadius: "14px",
                backgroundColor: "#FFFFFF",
                color: "#2351A3",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Sign up
            </button>
            <button
              onClick={() => {
                setDrawerVisible(false);
                navigate("/cart");
              }}
              style={{
                padding: "12px 16px",
                border: "1.5px solid #E4E4E7",
                borderRadius: "14px",
                backgroundColor: "#FFFFFF",
                color: "#0A0C0F",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <ShoppingCartOutlined />
              Go to cart
            </button>
          </div>
        )}

        {/* Drawer Actions */}
        {isAuthenticated && user && (
          <div
            style={{
              marginTop: 24,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
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
