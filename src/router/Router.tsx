import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy } from "react";
import AppLayout from "../components/layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import SearchFlight from "../pages/SearchFlight";
// Lazy load pages for better performance
const LandingPage = lazy(() => import("../pages/LandingPage"));
const TravelPage = lazy(() => import("../pages/TravelPage"));
const AuthPage = lazy(() => import("../pages/AuthPage"));
const PackagesPage = lazy(() => import("../pages/PackagesPage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const MyBookingsPage = lazy(() => import("../pages/MyBookingsPage"));
const HomePage = lazy(() => import("../features/flights/pages/HomePage"));
const FlightsPage = lazy(() => import("../features/flights/pages/FlightsPage"));
const HotelsPage = lazy(() => import("../features/hotels/pages/HotelsPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "auth",
        element: <AuthPage />,
      },
      {
        path: "travel",
        element: <TravelPage />,
      },
      {
        path: "search_flight",
        element: <SearchFlight />,
      },
      {
        path: "packages",
        element: <PackagesPage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "my-bookings",
        element: (
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "flights",
        element: <FlightsPage />,
      },
      {
        path: "hotels",
        element: <HotelsPage />,
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
