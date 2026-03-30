import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import HotelBookingETicketSetion from "../components/molecules/HotelBookingETicketSetion";
import { buildMyBookingsUrl } from "../utils/myBookingsUrl";

/**
 * Page to view hotel booking details (receipt) from My Bookings.
 * Receives bookingReferenceId, searchKey, bookingKey from location.state.
 */
const HotelBookingDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as {
    bookingReferenceId?: string;
    searchKey?: string;
    bookingKey?: string;
    /** e.g. "?mode=hotels&status=pending" — matches URL when leaving My Bookings */
    myBookingsSearch?: string;
  };

  const { bookingReferenceId, searchKey } = state;

  const navigateBackToMyBookings = () => {
    if (state.myBookingsSearch) {
      navigate(`/my-bookings${state.myBookingsSearch}`);
      return;
    }
    navigate(buildMyBookingsUrl({ mode: "hotels", status: "all" }));
  };

  if (!bookingReferenceId || !searchKey) {
    return (
      <div className="py-12 px-6 text-center">
        <p className="text-[#3D495C] mb-4">
          Missing booking information. Please go back to My Bookings.
        </p>
        <Button
          type="button"
          onClick={navigateBackToMyBookings}
          overrideClasses
        >
          Back to My Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8 px-6">
      <div className="mb-6">
        <Button
          type="button"
          onClick={navigateBackToMyBookings}
          className="text-[#5383DA] hover:underline bg-transparent border-none"
          overrideClasses
        >
          ← Back to My Bookings
        </Button>
      </div>
      <HotelBookingETicketSetion />
    </div>
  );
};

export default HotelBookingDetailPage;
