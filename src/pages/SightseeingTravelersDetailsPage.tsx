import React, { useEffect } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import type { SightseeingTravelersPageState } from "../features/sightseeing/sightseeingBooking";

/**
 * Traveler forms now live on {@link SightseeingBookingPage} below Free cancellation.
 * This route redirects so old links and bookmarks keep working.
 */
const SightseeingTravelersDetailsPage: React.FC = () => {
  const { activityCode: rawCode } = useParams<{ activityCode: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const pageState = location.state as SightseeingTravelersPageState | null;

  const activityCode = rawCode ? decodeURIComponent(rawCode) : "";

  useEffect(() => {
    if (!activityCode) return;
    navigate(`/sightseeing-booking/${encodeURIComponent(activityCode)}`, {
      replace: true,
      state: pageState ?? undefined,
    });
  }, [activityCode, navigate, pageState]);

  return (
    <div className="min-h-screen bg-white px-6 py-16 font-[Inter,sans-serif]">
      <div className="mx-auto max-w-lg text-center">
        <p className="text-[15px] text-[#64748B]">Taking you to booking…</p>
        <Link
          to="/search-sightseeing"
          className="mt-6 inline-block text-[15px] font-semibold text-[#2563EB] hover:underline"
        >
          Browse sightseeing
        </Link>
      </div>
    </div>
  );
};

export default SightseeingTravelersDetailsPage;
