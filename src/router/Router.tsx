import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy } from "react";
import AppLayout from "../components/layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import SearchFlight from "../pages/SearchFlight";
import SearchHotel from "../pages/SearchHotel";
import HotellDetailListing from "../pages/HotellDetailListing";
const LandingPage = lazy(() => import("../pages/LandingPage"));
const SightseeingSearchPage = lazy(
  () => import("../pages/SightseeingSearchPage"),
);
// const TravelPage = lazy(() => import("../pages/TravelPage"));
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
const CustomerSupportPage = lazy(() => import("../pages/CustomerSupportPage"));
const CookiesPolicyPage = lazy(() => import("../pages/CookiesPolicyPage"));
const PrivacyPolicyPage = lazy(() => import("../pages/PrivacyPolicyPage"));
const TermsOfServicesPage = lazy(() => import("../pages/TermsOfServicesPage"));
const FAQPage = lazy(() => import("../pages/FAQPage"));
const PaymentsHelpPage = lazy(() => import("../pages/PaymentsHelpPage"));
const RefundCancellationPolicyPage = lazy(() => import("../pages/RefundCancellationPolicyPage")); // New import
const HotelCancellationPage = lazy(() => import("../pages/HotelCancellationPage"));
const HotelBookingDetailPage = lazy(() => import("../pages/HotelBookingDetailPage"));
const FlightCancellationPage = lazy(() => import("../pages/FlightCancellationPage"));

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
        element: <LandingPage />,
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
        path: "search-sightseeing",
        element: <SightseeingSearchPage />,
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
        path: "flight-cancellation",
        element: <FlightCancellationPage />,
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
        path: "customer-support",
        element: <CustomerSupportPage />,
      },
      {
        path: "cookies-policy",
        element: <CookiesPolicyPage />,
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicyPage />,
      },
      {
        path: "terms-of-services",
        element: <TermsOfServicesPage />,
      },
      {
        path: "faq",
        element: <FAQPage />,
      },
      {
        path: "payments-help",
        element: <PaymentsHelpPage />,
      },
      {
        path: "refund-cancellation-policy", // New route added
        element: <RefundCancellationPolicyPage />,
      },
      {
        path: "hotel-cancellation", // New route added
        element: <HotelCancellationPage />,
      },
      {
        path: "hotel-booking-detail",
        element: (
          <ProtectedRoute>
            <HotelBookingDetailPage />
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