import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy } from "react";
import AppLayout from "../components/layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import SearchFlight from "../pages/SearchFlight";
import SearchHotel from "../pages/SearchHotel";
import HotellDetailListing from "../pages/HotellDetailListing";
const LandingPage = lazy(() => import("../pages/LandingPage"));
// const TravelPage = lazy(() => import("../pages/TravelPage"));
const AuthPage = lazy(() => import("../pages/AuthPage"));
const PackagesPage = lazy(() => import("../pages/PackagesPage"));
const AboutPage = lazy(() => import("../pages/AboutPage"));
const MyBookingsPage = lazy(() => import("../pages/MyBookingsPage"));
const HomePage = lazy(() => import("../features/flights/pages/HomePage"));
const FlightsPage = lazy(() => import("../features/flights/pages/FlightsPage"));
const HotelsPage = lazy(() => import("../features/hotels/pages/HotelsPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
// Lazy load pages for better performance
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const Travellers = lazy(() => import("../pages/Travellers"));
const FlightBooking = lazy(() => import("../pages/FlightBooking"));
const HotelBooking = lazy(() => import("../pages/HotelBooking"));

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
        element: <Travellers />,
        // element: <TravelPage />,
      },
      {
        path: "search_flight",
        element: <SearchFlight />,
      },
      {
        path: "search-hotel",
        element: <SearchHotel />,
      },
      {
        path: "hotel-detail/:hotelKey",
        element: <HotellDetailListing />,
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
        path: "flight-booking",
        element: <FlightBooking />,
      },
      {
        path: "hotel-booking",
        element: <HotelBooking />,
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
