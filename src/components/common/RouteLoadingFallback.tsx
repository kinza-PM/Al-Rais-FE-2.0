import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../atoms/Loader";

/**
 * Full-screen loading UI for lazy route chunks — same Al Rais logo + copy pattern as {@link Loader} on hotel flows.
 */
export default function RouteLoadingFallback() {
  const { pathname } = useLocation();

  const label = useMemo(() => {
    const p = pathname.toLowerCase();

    if (
      p.startsWith("/search-hotel") ||
      p.includes("/hotel-detail") ||
      p.includes("/hotel-booking") ||
      p.includes("/hotel-cancellation")
    ) {
      return "Loading hotels, please wait…";
    }
    if (
      p.startsWith("/search_flight") ||
      p.includes("/flight-booking") ||
      p.includes("/flight-cancellation") ||
      p.includes("/flights")
    ) {
      return "Loading flights, please wait…";
    }
    if (p.includes("sightseeing")) {
      return "Loading activities, please wait…";
    }
    if (p.includes("my-bookings")) {
      return "Loading your bookings, please wait…";
    }
    if (p.startsWith("/profile")) {
      return "Loading profile, please wait…";
    }
    if (p.startsWith("/packages")) {
      return "Loading packages, please wait…";
    }
    if (p.startsWith("/travel")) {
      return "Loading travel, please wait…";
    }
    if (
      p.includes("customer-support") ||
      p.includes("faq") ||
      p.includes("privacy") ||
      p.includes("cookies") ||
      p.includes("terms") ||
      p.includes("refund") ||
      p.includes("payments-help")
    ) {
      return "Loading page, please wait…";
    }
    if (p === "/" || p === "/auth") {
      return "Loading, please wait…";
    }
    return "Loading page, please wait…";
  }, [pathname]);

  return <Loader show label={label} />;
}
