import { useLocation, useNavigate } from "react-router-dom";
import Button from "../components/atoms/Button";
import HotelBookingETicketSetion from "../components/molecules/HotelBookingETicketSetion";

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
  };

  const { bookingReferenceId, searchKey } = state;

  if (!bookingReferenceId || !searchKey) {
    return (
      <div className="py-12 px-6 text-center">
        <p className="text-[#3D495C] mb-4">
          Missing booking information. Please go back to My Bookings.
        </p>
        <Button
          type="button"
          onClick={() => navigate("/my-bookings")}
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
          onClick={() => navigate("/my-bookings")}
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
