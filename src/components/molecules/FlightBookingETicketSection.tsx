import { useState, useEffect, useRef, useMemo } from "react";
// import EmirateLogo from "../../assets/images/emirates.png";
import AlRaisLogo from "../../assets/images/al-rais-logo.png";
import tripImageCard1 from "../../assets/images/tripimagecard1.jpg";
import tripImageCard2 from "../../assets/images/tripimagecard2.jpg";
import tripImageCard3 from "../../assets/images/tripimagecard3.jpg";
import ShareTicketModal from "../atoms/ShareTicketModal";
import INFO_ICON from "../../assets/svgs/info.svg";
import Button from "../atoms/Button";
import {
  formatDate,
  formatFlightDurationLabel,
  formatTime,
} from "../../utils/helpers";
import {
  generateFlightTicketPDF,
  generateFlightTicketPDFBlob,
} from "../../utils/pdfGenerator";
import toast from "react-hot-toast";
import {
  useUploadImagePreSignedUrl,
  useUploadTicket,
} from "../../hooks/useFlightBooking";
import Loader from "../atoms/Loader";
import { VITE_S3_TICKET_PUBLIC_BASE } from "../../config/publicEnv";

// import { uploadToS3 } from "../../utils/s3Helper";

/** Base URL for uploaded ticket PDFs on S3 (bucket + region) */
const S3_TICKET_BASE = VITE_S3_TICKET_PUBLIC_BASE;

type FlightBookingETicketSectionProps = {
  reservedFlightBooking?: any;
  offerId?: string | number;
  ancillarySummary?: {
    totalAmount: number;
    currency: string;
    selectedCount: number;
    breakdown?: Array<{
      category: "baggage" | "meals" | "seats" | "other";
      label: string;
      amount: number;
      currency: string;
      ancillaryOfferId: string;
    }>;
  };
};

export default function FlightBookingETicketSection({
  reservedFlightBooking,
  offerId,
  ancillarySummary,
}: FlightBookingETicketSectionProps) {
  const [openShareModal, setOpenShareModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [isFetchingTicket, setIsFetchingTicket] = useState(true);
  const uploadToS3Attempted = useRef(false);
  const { mutateAsync: getPreSignedUrl } = useUploadImagePreSignedUrl();
  const { mutateAsync: uploadTicket } = useUploadTicket();

  // Extract data from booking
  const bookingRef = reservedFlightBooking?.bookingReferenceId || "N/A";
  const ticketDoc = reservedFlightBooking?.ticketDocument?.[0];
  const ticketNumber = ticketDoc?.ticketDocNbr || "N/A";
  const airlineLocator =
    ticketDoc?.airlineLocators?.[0]?.airlineLocator || "N/A";

  // Extract passenger info
  const passengers = reservedFlightBooking?.passengers || [];
  const getPassengerName = (passenger: any) => {
    if (!passenger) return "N/A";
    const title = passenger.passengerInfo?.nameTitle || "";
    const givenName = passenger.passengerInfo?.givenName || "";
    const surname = passenger.passengerInfo?.surname || "";
    const capitalizedTitle = title
      ? title.charAt(0).toUpperCase() + title.slice(1).toLowerCase()
      : "";

    return `${capitalizedTitle} ${givenName} ${surname}`.trim();
  };

  const getPassengerType = (passenger: any) => {
    const ptc = passenger?.ptc || "ADT";
    switch (ptc) {
      case "ADT":
        return "Adult";
      case "CHD":
        return "Child";
      case "INF":
        return "Infant";
      case "SEN":
        return "Senior";
      default:
        return "Adult";
    }
  };

  // Extract flight info - handle oneway, roundtrip and multicity
  const journeys = reservedFlightBooking?.journey || [];

  // First journey/segment for cabin class and baggage (used in header and baggage section)
  const outboundJourney = journeys[0];
  const outboundSegment = outboundJourney?.flightSegments?.[0];
  const outboundCabinClass = outboundSegment?.cabinClass || "Economy";

  // Build a list of flight blocks to render (oneway: 1, roundtrip: 2, multicity: N)
  // For flights with stops, include stop details (airport code + layover) from all segments
  const flightBlocks = useMemo(() => {
    const jList = reservedFlightBooking?.journey || [];
    if (jList.length === 0) return [];
    return jList
      .map((journey: any, i: number) => {
        const allSegments = journey?.flightSegments ?? [];
        const seg = allSegments[0];
        if (!seg) return null;
        const isOneway = jList.length === 1;
        const isRoundtripTrip = jList.length === 2;
        let heading: string;
        if (isOneway) heading = "Flight Details";
        else if (isRoundtripTrip)
          heading = i === 0 ? "Outbound Flight" : "Return Flight";
        else heading = `Flight ${String(i + 1).padStart(2, "0")}`;
        // Journey-level duration from API (total leg); avoid first-segment-only duration on multi-stop
        const rawDuration =
          journey?.flight?.flightInfo?.duration || seg?.duration || "";
        const duration = rawDuration
          ? formatFlightDurationLabel(rawDuration)
          : "N/A";
        const stopQuantity =
          seg?.stopQuantity ??
          (Array.isArray(allSegments)
            ? Math.max(0, allSegments.length - 1)
            : 0);
        const isDirect = stopQuantity === 0;
        const stopsLabel = isDirect ? "Direct" : `${stopQuantity} stop(s)`;
        // Build stop details: each stop = arrival airport of segment[i], layover = segment[i+1].layoverTime
        const stopDetails: Array<{ airportCode: string; layover?: string }> =
          [];
        if (Array.isArray(allSegments) && allSegments.length > 1) {
          for (let s = 0; s < allSegments.length - 1; s++) {
            const arrSeg = allSegments[s];
            const nextSeg = allSegments[s + 1];
            const airportCode =
              arrSeg?.arrivalAirportCode ?? nextSeg?.departureAirportCode ?? "";
            const layover = nextSeg?.layoverTime ?? undefined;
            if (airportCode) {
              stopDetails.push({ airportCode, layover });
            }
          }
        }
        return {
          heading,
          airlineCode: seg?.marketingAirline || "EK",
          flightNumber: seg?.flightNumber || "N/A",
          duration,
          stops: stopsLabel,
          stopDetails,
          depCode: seg?.departureAirportCode || "",
          arrCode:
            allSegments.length > 0
              ? ((allSegments[allSegments.length - 1] as any)
                  ?.arrivalAirportCode ??
                seg?.arrivalAirportCode ??
                "")
              : seg?.arrivalAirportCode || "",
          depTime: seg?.departureDateTime || "",
          arrTime:
            allSegments.length > 0
              ? ((allSegments[allSegments.length - 1] as any)
                  ?.arrivalDateTime ??
                seg?.arrivalDateTime ??
                "")
              : seg?.arrivalDateTime || "",
          depTerminal: seg?.departureTerminal || "",
          arrTerminal:
            allSegments.length > 0
              ? ((allSegments[allSegments.length - 1] as any)
                  ?.arrivalTerminal ??
                seg?.arrivalTerminal ??
                "")
              : seg?.arrivalTerminal || "",
        };
      })
      .filter(Boolean) as Array<{
      heading: string;
      airlineCode: string;
      flightNumber: string;
      duration: string;
      stops: string;
      stopDetails: Array<{ airportCode: string; layover?: string }>;
      depCode: string;
      arrCode: string;
      depTime: string;
      arrTime: string;
      depTerminal: string;
      arrTerminal: string;
    }>;
  }, [reservedFlightBooking?.journey]);

  // Extract baggage info - use outbound segment for baggage info
  const baggageAllowance = outboundSegment?.baggageAllowance;

  // Get baggage info for specific passenger type
  const getBaggageForPassenger = (passenger: any) => {
    const ptc = passenger?.ptc || "ADT";
    const carryOnForPax = baggageAllowance?.carryOnBaggage?.find(
      (item: any) => item.paxType === ptc,
    );
    const checkedInForPax = baggageAllowance?.checkedInBaggage?.find(
      (item: any) => item.paxType === ptc,
    );

    return {
      carryOn: carryOnForPax
        ? `${carryOnForPax.value}${carryOnForPax.unit}`
        : "None",
      checkedIn: checkedInForPax
        ? `${checkedInForPax.value}${checkedInForPax.unit}`
        : "None",
    };
  };

  const seatLabelsFromAncillaries = useMemo(() => {
    return (ancillarySummary?.breakdown ?? [])
      .filter(
        (b) => b?.category === "seats" && String(b?.label || "").trim(),
      )
      .map((b) => String(b.label).trim());
  }, [ancillarySummary?.breakdown]);

  const seatLabelsFromPassengers = useMemo(() => {
    return (passengers || [])
      .map((p: any) => String(p?.seat || "").trim())
      .filter(Boolean)
      .map((s: string) =>
        s.toLowerCase().startsWith("seat ") ? s : `Seat ${s}`,
      );
  }, [passengers]);

  /** Shown in header row; seat ancillaries are listed here, not under Ancillaries. */
  const seatDisplayText = useMemo(() => {
    if (seatLabelsFromAncillaries.length) {
      return seatLabelsFromAncillaries.join(", ");
    }
    if (seatLabelsFromPassengers.length) {
      return seatLabelsFromPassengers.join(", ");
    }
    return "";
  }, [seatLabelsFromAncillaries, seatLabelsFromPassengers]);

  const ancillaryBreakdownNonSeat = useMemo(() => {
    return (ancillarySummary?.breakdown ?? []).filter(
      (b) => b?.category !== "seats",
    );
  }, [ancillarySummary?.breakdown]);

  // When E-ticket page is shown: get pre-signed URL, upload ticket PDF to S3, then register via uploadTicket API
  useEffect(() => {
    const offerIdStr =
      offerId != null && offerId !== ""
        ? String(offerId)
        : reservedFlightBooking?.offerId;
    // console.log("offerIdStr", offerIdStr, offerId, reservedFlightBooking);
    if (!offerIdStr || !reservedFlightBooking || uploadToS3Attempted.current) {
      setIsFetchingTicket(false);
      return;
    }
    uploadToS3Attempted.current = true;

    const runUploadFlow = async () => {
      try {
        const { uploadUrl, fileKey } = await getPreSignedUrl({
          offerId: offerIdStr,
          contentType: "application/pdf",
        });
        if (!uploadUrl) {
          setIsFetchingTicket(false);
          return;
        }

        const pdfBlob = await generateFlightTicketPDFBlob();
        const res = await fetch(uploadUrl, {
          method: "PUT",
          body: pdfBlob,
          headers: { "Content-Type": "application/pdf" },
        });
        if (!res.ok) {
          throw new Error(`Upload failed: ${res.status}`);
        }

        const pdfUrl = fileKey ? `${S3_TICKET_BASE}/${fileKey}` : null;
        setUploadedPdfUrl(pdfUrl);

        if (pdfUrl) {
          await uploadTicket({
            ticketImage: pdfUrl,
            offerId: offerIdStr,
          });
        }
      } catch (err) {
        console.error("Ticket upload failed:", err);
        toast.error(
          "Failed to upload ticket to cloud. You can still download it.",
        );
      } finally {
        setIsFetchingTicket(false);
      }
    };

    const t = setTimeout(runUploadFlow, 500);
    return () => clearTimeout(t);
  }, [offerId, reservedFlightBooking, getPreSignedUrl, uploadTicket]);

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateFlightTicketPDF(bookingRef);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const NotchDivider = () => (
    <div className="relative mt-7 mb-10 -mx-2">
      <div className="absolute inset-x-0 bottom-2">
        <div className="border-t border-dashed border-[#E4E4E7]" />
      </div>

      <span
        className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2"
        style={{ transform: "translate(-9px, -50%)" }}
      >
        <svg
          width="10"
          height="20"
          viewBox="0 0 10 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.5 0.512695C5.51429 0.772696 9.5 4.92101 9.5 10C9.5 15.079 5.51426 19.2263 0.5 19.4863V0.512695Z"
            fill="white"
            stroke="#C2CAD6"
          />
        </svg>
      </span>

      <span
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
        style={{ transform: "translate(9px, -50%)" }}
      >
        <svg
          width="10"
          height="20"
          viewBox="0 0 10 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.5 0.512695C4.48571 0.772696 0.5 4.92101 0.5 10C0.5 15.079 4.48574 19.2263 9.5 19.4863V0.512695Z"
            fill="white"
            stroke="#C2CAD6"
          />
        </svg>
      </span>
    </div>
  );

  const InfoRow = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2">
      <img src={INFO_ICON} alt="info" />
      <p className="text-[13px] text-[#3D495C]">{children}</p>
    </div>
  );

  const InstructionsCard = () => (
    <>
      <div
        id="flight-instructions-content"
        className="rounded-2xl border border-[#E4E4E7] bg-white shadow-sm px-4 pt-4 pb-2"
      >
        <div>
          <InfoRow>
            During various procedures in the airport, passengers must provide
            the valid ID used to purchase their ticket. Their boarding pass or
            itinerary may also be required.
          </InfoRow>
          <InfoRow>
            Please ensure that all passengers requiring special assistance
            contact the airline at least 48 hours prior to departure.
          </InfoRow>
          <InfoRow>
            Please note that tickets must be used in the sequence set out in the
            itinerary, otherwise airlines reserve the right to refuse carriage.
            Al Rais Travels takes no responsibility if passengers are unable to
            board a plane due to not complying with airline policies and
            regulations.
          </InfoRow>
          <InfoRow>
            We suggest you to arrive at Dubai international airport at least 3h
            prior to departure to ensure you have enough time to check in.
          </InfoRow>
        </div>

        <NotchDivider />

        {/* Baggage table */}
        {/* <div className="grid grid-cols-[120px_1fr] gap-x-2 gap-y-2 [font-variant-numeric:tabular-nums]">
          <div className="text-[12px] text-[#3D495C]">Personal item</div>
          <div className="text-[14px] font-medium text-[#0A0C0F] text-right">
            1 piece per person, 7kg each, dimensions cannot exceed 56×36×23 cm
          </div>

          <div className="text-[12px] text-[#3D495C]">Carry-on baggage</div>
          <div className="text-[14px] font-medium text-[#0A0C0F] text-right">
            {carryOnText}
          </div>

          <div className="text-[12px] text-[#3D495C]">Checked baggage</div>
          <div className="text-[14px] font-medium text-[#0A0C0F] text-right">
            {checkedInText}
          </div>
        </div>

        <NotchDivider /> */}

        {/* Individual passenger baggage details */}
        <div className="space-y-3">
          {passengers.map((passenger: any, index: number) => {
            const baggage = getBaggageForPassenger(passenger);
            return (
              <div
                key={index}
                className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.4fr]"
              >
                <div>
                  <div className="text-[15px] font-medium text-[#0A0C0F]">
                    Passenger {String(index + 1).padStart(2, "0")} (
                    {getPassengerType(passenger)})
                  </div>
                </div>

                <div className="[font-variant-numeric:tabular-nums]">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-y-2">
                    <div className="text-[12px] text-[#3D495C]">
                      Carry-on baggage
                    </div>
                    <div className="text-[15px] font-medium text-[#0A0C0F] text-right">
                      {baggage.carryOn}
                    </div>

                    <div className="text-[12px] text-[#3D495C]">
                      Checked baggage
                    </div>
                    <div className="text-[15px] font-medium text-[#0A0C0F] text-right">
                      {baggage.checkedIn}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <NotchDivider />

        <div className="pb-6 pt-2 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 select-none">
            <img alt="logo" src={AlRaisLogo} className="w-50 h-16" />
          </div>
          <div className="mt-2 text-center font-medium text-[13px] text-[#3D495C]">
            Thanks for choosing Al Rais.
            <br />
            Have a safe journey.
          </div>
        </div>

        <div className="pdf-hide">
          <NotchDivider />
        </div>

        <div className="pb-2 text-center">
          <Button
            type="button"
            className="text-[15px] font-medium text-[#5383DA] hover:underline pdf-hide"
            onClick={() => setShowInstructions(false)}
            overrideClasses
          >
            Go Back
          </Button>
        </div>
      </div>
    </>
  );

  const FlightTicketContentCard = () => (
    <div
      id="flight-ticket-content"
      className="rounded-2xl border border-[#E4E4E7] bg-[#ededed] shadow-sm px-4 pt-4 pb-2"
    >
      <div>
        <div className="flex items-center justify-center gap-2 px-6">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 0.25C8.07164 0.25 6.18657 0.821828 4.58319 1.89317C2.97982 2.96451 1.73013 4.48726 0.992179 6.26884C0.254225 8.05042 0.061142 10.0108 0.437348 11.9021C0.813554 13.7934 1.74215 15.5307 3.10571 16.8943C4.46928 18.2579 6.20656 19.1865 8.09787 19.5627C9.98919 19.9389 11.9496 19.7458 13.7312 19.0078C15.5127 18.2699 17.0355 17.0202 18.1068 15.4168C19.1782 13.8134 19.75 11.9284 19.75 10C19.7473 7.41498 18.7192 4.93661 16.8913 3.10872C15.0634 1.28084 12.585 0.25273 10 0.25ZM10 18.25C8.36831 18.25 6.77326 17.7661 5.41655 16.8596C4.05984 15.9531 3.00242 14.6646 2.378 13.1571C1.75358 11.6496 1.5902 9.99085 1.90853 8.3905C2.22685 6.79016 3.01259 5.32015 4.16637 4.16637C5.32016 3.01259 6.79017 2.22685 8.39051 1.90852C9.99085 1.59019 11.6497 1.75357 13.1571 2.37799C14.6646 3.00242 15.9531 4.05984 16.8596 5.41655C17.7661 6.77325 18.25 8.3683 18.25 10C18.2475 12.1873 17.3775 14.2843 15.8309 15.8309C14.2843 17.3775 12.1873 18.2475 10 18.25ZM11.5 14.5C11.5 14.6989 11.421 14.8897 11.2803 15.0303C11.1397 15.171 10.9489 15.25 10.75 15.25C10.3522 15.25 9.97065 15.092 9.68934 14.8107C9.40804 14.5294 9.25 14.1478 9.25 13.75V10C9.05109 10 8.86033 9.92098 8.71967 9.78033C8.57902 9.63968 8.5 9.44891 8.5 9.25C8.5 9.05109 8.57902 8.86032 8.71967 8.71967C8.86033 8.57902 9.05109 8.5 9.25 8.5C9.64783 8.5 10.0294 8.65804 10.3107 8.93934C10.592 9.22064 10.75 9.60218 10.75 10V13.75C10.9489 13.75 11.1397 13.829 11.2803 13.9697C11.421 14.1103 11.5 14.3011 11.5 14.5ZM8.5 5.875C8.5 5.6525 8.56598 5.43499 8.6896 5.24998C8.81322 5.06498 8.98892 4.92078 9.19449 4.83564C9.40005 4.75049 9.62625 4.72821 9.84448 4.77162C10.0627 4.81502 10.2632 4.92217 10.4205 5.0795C10.5778 5.23684 10.685 5.43729 10.7284 5.65552C10.7718 5.87375 10.7495 6.09995 10.6644 6.30552C10.5792 6.51109 10.435 6.68679 10.25 6.8104C10.065 6.93402 9.84751 7 9.625 7C9.32664 7 9.04049 6.88147 8.82951 6.6705C8.61853 6.45952 8.5 6.17337 8.5 5.875Z"
              fill="#EA0029"
            />
          </svg>

          <p className="text-[13px] text-[#3D495C]">
            We advise you to print out your itinerary and take it with you to
            ensure your trip goes as smoothly as possible.
          </p>
        </div>

        <div className="mt-4 mb-4 grid grid-cols-3 gap-10 sm:grid-cols-3">
          <div>
            <div className="text-[13px] text-[#3D495C]">Booking number</div>
            <div className="text-[15px] font-medium text-[#0A0C0F]">
              {bookingRef}
            </div>
          </div>

          <div>
            <div className="text-[13px] text-[#3D495C]">E-ticket number</div>
            <div className="text-[15px] font-medium text-[#0A0C0F]">
              {ticketNumber}
            </div>
          </div>

          <div>
            <div className="text-[13px] text-[#3D495C]">
              Airline booking reference
            </div>
            <div className="text-[15px] font-medium text-[#0A0C0F]">
              {airlineLocator}
            </div>
          </div>
        </div>
      </div>

      <NotchDivider />

      <div className="mt-4 mb-4 grid grid-cols-3 gap-10 sm:grid-cols-3">
        <div>
          <div className="text-[13px] text-[#3D495C]">Title & Full Name</div>
          <div className="text-[15px] font-medium text-[#0A0C0F]">
            {getPassengerName(passengers[0])}
          </div>
        </div>
        <div>
          <div className="text-[13px] text-[#3D495C]">Class</div>
          <div className="text-[15px] font-medium text-[#0A0C0F]">
            {outboundCabinClass}
          </div>
        </div>
        <div>
          <div className="text-[13px] text-[#3D495C]">Seat</div>
          <div className="text-[15px] font-medium text-[#0A0C0F]">
            {seatDisplayText ? `${seatDisplayText}` : "—"}
          </div>
        </div>
      </div>

      <NotchDivider />

      <div className="space-y-3">
        {/* Flight(s): oneway (1), roundtrip (2), multicity (N) */}
        {flightBlocks.map((block, blockIndex) => (
          <div key={blockIndex}>
            {blockIndex > 0 && <NotchDivider />}
            <div className={blockIndex > 0 ? "mt-4" : ""}>
              <div className="mb-2">
                <div className="text-[12px] font-medium text-[#3D495C]">
                  {block.heading}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-10">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-[14px] text-nowrap font-medium text-[#0A0C0F]">
                      {block.airlineCode} Airlines
                    </div>
                    <div className="text-[12px] text-[#3D495C]">
                      {block.airlineCode} {block.flightNumber}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-[#3D495C]">Duration</div>
                  <div className="text-[14px] font-medium text-[#0A0C0F]">
                    {block.duration}
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-[#3D495C]">Stops</div>
                  <div className="text-[14px] font-medium text-[#0A0C0F]">
                    {block.stops}
                  </div>
                </div>
              </div>
              {block.stopDetails && block.stopDetails.length > 0 && (
                <div className="mt-3 px-3 py-2">
                  <div className="text-[11px] font-medium text-[#3D495C] mb-1.5">
                    Stop(s) & layover
                  </div>
                  <ul className="space-y-1.5">
                    {block.stopDetails.map((stop, stopIdx) => (
                      <li
                        key={stopIdx}
                        className="text-[13px] text-[#0A0C0F] flex flex-wrap items-baseline gap-x-2"
                      >
                        <span className="font-medium">
                          {stopIdx + 1}. {stop.airportCode}
                        </span>
                        {stop.layover && (
                          <span className="text-[12px] text-[#3D495C]">
                            (Layover: {stop.layover})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="py-4">
                <div className="flex items-center gap-2">
                  <svg
                    width="20"
                    height="14"
                    viewBox="0 0 20 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.7486 13.375C13.7486 13.5408 13.6828 13.6998 13.5656 13.817C13.4483 13.9342 13.2894 14 13.1236 14H1.87362C1.70786 14 1.54889 13.9342 1.43167 13.817C1.31446 13.6998 1.24862 13.5408 1.24862 13.375C1.24862 13.2093 1.31446 13.0503 1.43167 12.9331C1.54889 12.8159 1.70786 12.75 1.87362 12.75H13.1236C13.2894 12.75 13.4483 12.8159 13.5656 12.9331C13.6828 13.0503 13.7486 13.2093 13.7486 13.375ZM19.3627 3.77737C19.3463 3.86436 19.3117 3.94688 19.261 4.01947C19.2104 4.09207 19.1449 4.15308 19.0689 4.19846L7.55252 11.0735C7.07247 11.355 6.52621 11.5038 5.96971 11.5047C5.17699 11.5038 4.41457 11.2 3.83846 10.6555L3.82909 10.6461L1.01424 7.89065C0.865311 7.74922 0.753524 7.57328 0.688765 7.37837C0.624005 7.18347 0.608269 6.97561 0.642948 6.77317C0.677626 6.57074 0.761651 6.37997 0.887593 6.21773C1.01353 6.05549 1.17751 5.92679 1.36502 5.843L1.5994 5.72815C1.74741 5.65549 1.91814 5.64425 2.0744 5.6969L4.28221 6.44221L5.85799 5.48909L4.15252 3.83362C3.99915 3.69232 3.88356 3.51489 3.8163 3.31749C3.74903 3.12009 3.73222 2.909 3.7674 2.70344C3.80258 2.49789 3.88863 2.3044 4.01771 2.14061C4.14679 1.97681 4.31479 1.84791 4.50643 1.76565L4.53143 1.7555L5.09002 1.54378C5.23086 1.49126 5.3859 1.49126 5.52674 1.54378L9.7408 3.09221L13.7697 0.687527C14.4118 0.305408 15.1699 0.167121 15.9055 0.297947C16.6411 0.428772 17.305 0.819971 17.776 1.40003L17.7853 1.41175L19.2416 3.27815C19.296 3.34803 19.3349 3.42868 19.3558 3.51475C19.3767 3.60081 19.379 3.69033 19.3627 3.77737ZM17.8205 3.48831L16.8049 2.18596C16.5222 1.84016 16.1248 1.60724 15.685 1.52954C15.2452 1.45183 14.792 1.53451 14.408 1.76253L10.1267 4.31878C10.0466 4.36632 9.95682 4.39547 9.864 4.40411C9.77119 4.41276 9.67761 4.40069 9.59002 4.36878L5.31112 2.79534L4.99862 2.91487L5.01502 2.9305L7.30877 5.15628C7.37727 5.22284 7.42961 5.30422 7.46176 5.39416C7.49391 5.4841 7.50502 5.58021 7.49423 5.67511C7.48344 5.77002 7.45104 5.86119 7.39953 5.94162C7.34801 6.02205 7.27875 6.0896 7.19705 6.13909L4.68065 7.66175C4.6028 7.70876 4.51563 7.73822 4.42523 7.74807C4.33482 7.75792 4.24335 7.74793 4.15721 7.71878L1.91737 6.96331L1.90252 6.97112L1.87362 6.9844C1.87738 6.98709 1.88079 6.99024 1.88377 6.99378L4.69627 9.74847C4.98979 10.0243 5.36478 10.1976 5.76506 10.2424C6.16535 10.2872 6.56937 10.201 6.91659 9.9969L17.8205 3.48831Z"
                      fill="#3D495C"
                    />
                  </svg>
                  <div>
                    <div className="text-[12px] font-medium text-[#0A0C0F]">
                      {block.depCode} Airport ({block.depCode})
                    </div>
                    <div className="text-[12px] text-[#3D495C]">
                      {formatTime(block.depTime)} • {formatDate(block.depTime)}{" "}
                      {block.depTerminal
                        ? `• Terminal ${block.depTerminal}`
                        : ""}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <svg
                    width="19"
                    height="15"
                    viewBox="0 0 19 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 14.375C19 14.5407 18.9342 14.6997 18.8169 14.8169C18.6997 14.9341 18.5408 15 18.375 15H7.125C6.95924 15 6.80027 14.9341 6.68306 14.8169C6.56585 14.6997 6.5 14.5407 6.5 14.375C6.5 14.2092 6.56585 14.0502 6.68306 13.933C6.80027 13.8158 6.95924 13.75 7.125 13.75H18.375C18.5408 13.75 18.6997 13.8158 18.8169 13.933C18.9342 14.0502 19 14.2092 19 14.375ZM16.9562 12.4765L3.15703 8.61247C2.5012 8.42715 1.92365 8.03312 1.51186 7.49009C1.10008 6.94705 0.876497 6.2846 0.875 5.6031V1.24997C0.874985 1.0519 0.922042 0.856653 1.01229 0.680333C1.10254 0.504013 1.2334 0.351665 1.39409 0.235844C1.55477 0.120023 1.74068 0.0440462 1.93649 0.0141745C2.1323 -0.0156971 2.3324 0.00139196 2.52031 0.0640332L2.94766 0.206221C3.03728 0.236003 3.11899 0.285711 3.18665 0.351608C3.25431 0.417505 3.30615 0.497879 3.33828 0.586689L4.16641 2.88122L6.5 3.54606V1.24997C6.49999 1.0519 6.54704 0.856653 6.63729 0.680333C6.72754 0.504013 6.8584 0.351665 7.01909 0.235844C7.17977 0.120023 7.36568 0.0440462 7.56149 0.0141745C7.7573 -0.0156971 7.9574 0.00139196 8.14531 0.0640332L8.57266 0.206221C8.65723 0.234407 8.7348 0.280361 8.80016 0.340997C8.86551 0.401634 8.91713 0.47555 8.95156 0.557783L10.7094 4.74763L15.4625 6.07575C16.1197 6.2603 16.6986 6.65428 17.1115 7.19785C17.5244 7.74142 17.7485 8.40489 17.75 9.08747V11.875C17.75 11.9714 17.7276 12.0666 17.6847 12.153C17.6417 12.2393 17.5794 12.3146 17.5025 12.3729C17.4256 12.4311 17.3363 12.4708 17.2415 12.4888C17.1468 12.5068 17.0491 12.5026 16.9562 12.4765ZM16.5 9.08747C16.4989 8.67784 16.3642 8.27974 16.1163 7.95361C15.8685 7.62749 15.521 7.39114 15.1266 7.28044L10.082 5.87419C9.99116 5.84888 9.9072 5.80333 9.83644 5.74096C9.76568 5.67859 9.70995 5.60101 9.67344 5.51403L7.90625 1.30231L7.75 1.24997V4.37497C7.75007 4.47169 7.72769 4.56711 7.68462 4.65371C7.64155 4.74032 7.57897 4.81574 7.5018 4.87405C7.42463 4.93237 7.33498 4.97197 7.23991 4.98975C7.14484 5.00754 7.04693 5.00301 6.95391 4.97653L3.51641 3.99685C3.42096 3.96949 3.33341 3.91979 3.26099 3.85186C3.18858 3.78393 3.13339 3.69973 3.1 3.60622L2.26484 1.29606L2.125 1.24997V5.6031C2.12601 6.01209 2.26023 6.40962 2.50734 6.73553C2.75444 7.06143 3.10099 7.29797 3.49453 7.40935L16.5 11.0508V9.08747Z"
                      fill="#3D495C"
                    />
                  </svg>
                  <div>
                    <div className="text-[12px] font-medium text-[#0A0C0F]">
                      {block.arrCode} Airport ({block.arrCode})
                    </div>
                    <div className="text-[12px] text-[#3D495C]">
                      {formatTime(block.arrTime)} • {formatDate(block.arrTime)}{" "}
                      {block.arrTerminal
                        ? `• Terminal ${block.arrTerminal}`
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <NotchDivider />

      {passengers.map((passenger: any, index: number) => {
        const baggage = getBaggageForPassenger(passenger);
        return (
          <div
            key={index}
            className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1.4fr] mt-3"
          >
            <div>
              <div className="text-[13px] text-[#3D495C]">
                Passenger {String(index + 1).padStart(2, "0")} (
                {getPassengerType(passenger)})
              </div>
              <div className="text-[16px] font-medium text-[#0A0C0F]">
                {getPassengerName(passenger)}
              </div>
            </div>

            <div className="[font-variant-numeric:tabular-nums]">
              <div className="grid grid-cols-[1fr_auto] items-center gap-y-2">
                <div className="text-[12px] text-[#3D495C]">
                  Carry-on baggage
                </div>
                <div className="text-[15px] font-medium text-[#0A0C0F] text-right">
                  {baggage.carryOn}
                </div>

                <div className="text-[12px] text-[#3D495C]">
                  Checked baggage
                </div>
                <div className="text-[15px] font-medium text-[#0A0C0F] text-right">
                  {baggage.checkedIn}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {ancillaryBreakdownNonSeat.length > 0 && (
          <>
            <NotchDivider />
            <div className="mt-3">
              <div className="text-[13px] text-[#3D495C]">Ancillaries</div>
              <div className="mt-2 space-y-2 [font-variant-numeric:tabular-nums]">
                {ancillaryBreakdownNonSeat.map((item, idx) => (
                  <div
                    key={`${item.ancillaryOfferId}-${idx}`}
                    className="grid grid-cols-[1fr_auto] items-start gap-6"
                  >
                    <div className="text-[12px] font-medium text-[#0A0C0F]">
                      {item.category.toUpperCase()} • {item.label}
                    </div>
                    {/* <div className="text-[12px] font-semibold text-[#0A0C0F] text-right">
                      {item.currency} {Number(item.amount || 0).toFixed(2)}
                    </div> */}
                  </div>
                ))}

                {/* <div className="pt-2 border-t border-[#E4E4E7] grid grid-cols-[1fr_auto] items-center gap-6">
                  <div className="text-[13px] font-semibold text-[#3D495C]">
                    Total ancillaries
                  </div>
                  <div className="text-[15px] font-bold text-[#0A0C0F] text-right">
                    {(ancillarySummary?.currency || "USD") +
                      " " +
                      Number(ancillarySummary?.totalAmount || 0).toFixed(2)}
                  </div>
                </div> */}
              </div>
            </div>
          </>
        )}

      <div className="pdf-hide">
        <NotchDivider />
      </div>

      <div className="pb-2 text-center">
        <Button
          type="button"
          className="text-[15px] font-medium text-[#5383DA] hover:underline pdf-hide"
          onClick={() => setShowInstructions(true)}
          overrideClasses
        >
          View Instructions
        </Button>
      </div>
    </div>
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Loader
        show={isFetchingTicket}
        label="Please wait while we are fetching your ticket."
      />
      <section className="mt-8 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-[503px]">
          <div style={{ display: !showInstructions ? "block" : "none" }}>
            <FlightTicketContentCard />
          </div>

          <div style={{ display: showInstructions ? "block" : "none" }}>
            <InstructionsCard />
          </div>

          <div
            id="flight-ticket-pdf"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-20000px",
              top: 0,
              width: "580px", // match your visible width
              overflow: "visible",
              pointerEvents: "none",
              zIndex: -1,
            }}
          >
            <FlightTicketContentCard />
            <InstructionsCard />
          </div>

          <div
            id="flight-ticket-print"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "-20000px",
              top: 0,
              width: "100%", // match your visible width
              overflow: "visible",
              pointerEvents: "none",
              zIndex: -1,
            }}
          >
            <div className="print-page">
              <FlightTicketContentCard />
            </div>

            <div className="print-page">
              <InstructionsCard />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-10 mb-12">
            {/* Share Button */}
            <Button
              type="button"
              overrideClasses
              onClick={() => setOpenShareModal(true)}
              className="
              h-[47px]
              px-[40px]
              rounded-[100px]
              border-[1.5px]
              border-[#2351A3]
              text-[#2351A3]
              text-[16px]
              font-semibold
              flex items-center justify-center gap-[10px]
              bg-transparent
            "
            >
              Share your ticket
            </Button>

            {/* Download Button */}
            <Button
              type="button"
              overrideClasses
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="
              h-[47px]
              px-[40px]
              rounded-[100px]
              text-white
              text-[16px]
              font-semibold
              flex items-center justify-center gap-[10px]
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-[linear-gradient(90.59deg,#5383DA_0%,#2351A3_50%,#081326_100%)]
            "
            >
              {isGeneratingPDF ? "Generating PDF..." : "Download your ticket"}
            </Button>
          </div>
        </div>

        {/* New container: promotional cards in a single row, no scrollbar */}
        <div className="pdf-hide w-full mt-8 mb-12 px-4 flex flex-row flex-nowrap items-center justify-center gap-4">
          {/* Card 1: Hotels */}
          <div
            className="flex flex-shrink-0 w-[477px] h-[120px] rounded-[16px] overflow-hidden bg-white border border-[#E4E4E7]"
            style={{ opacity: 1 }}
          >
            <div className="flex-1 flex flex-col justify-center pl-4 pr-2 py-3 min-w-0">
              <p className="text-[15px] font-semibold text-[#0A0C0F] leading-tight">
                Enjoy your trip!
              </p>
              <p className="text-[13px] text-[#3D495C] mt-0.5 leading-[1.2]">
                We have hotels at your destination start just from{" "}
                <span className="font-semibold text-[#0A0C0F]">$42</span>
                /night
              </p>
              <a
                href="/hotels"
                className="text-[13px] text-[#5383DA] underline mt-1 font-medium hover:text-[#2351A3]"
              >
                Explore hotels listings in Mumbai
              </a>
            </div>
            <div className="w-[180px] h-full flex-shrink-0 overflow-hidden rounded-r-[16px]">
              <img
                src={tripImageCard1}
                alt="Hotels at your destination"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Card 2: Car bookings - gradient */}
          <div
            className="flex flex-shrink-0 w-[477px] h-[120px] rounded-[16px] overflow-hidden"
            style={{
              background:
                "linear-gradient(90.59deg, #5383DA 0%, #2351A3 50%, #081326 100%)",
              opacity: 1,
            }}
          >
            <div className="flex-1 flex flex-col justify-center pl-4 pr-2 py-3 min-w-0">
              <p className="text-[15px] font-semibold text-white leading-tight">
                Travel without worry!
              </p>
              <p
                className="text-[14px] text-white mt-0.5 leading-[100%] font-normal"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Al-Rais offers car bookings with un-matched prices!
              </p>
            </div>
            <div className="w-[180px] h-full flex-shrink-0 overflow-hidden rounded-r-[16px]">
              <img
                src={tripImageCard2}
                alt="Car bookings"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Card 3: Tour */}
          <div
            className="flex flex-shrink-0 w-[477px] h-[120px] rounded-[16px] overflow-hidden bg-white border border-[#E4E4E7] shadow-sm"
            style={{ opacity: 1 }}
          >
            <div className="flex flex-col justify-center pl-4 pr-2 py-3 min-w-0 w-[237px] flex-shrink-0">
              <p
                className="text-[15px] text-[#0A0C0F] leading-[100%] font-medium"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Book a complete tour with your all-in-one travel booking
                companion
              </p>
            </div>
            <div className="flex-1 min-w-[180px] h-full flex-shrink-0 overflow-hidden rounded-r-[16px]">
              <img
                src={tripImageCard3}
                alt="Tour with travel companion"
                className="block w-full h-full object-cover object-right"
              />
            </div>
          </div>
        </div>

        {openShareModal && (
          <ShareTicketModal
            closeModal={() => setOpenShareModal(false)}
            bookingRef={bookingRef}
            passengerName={getPassengerName(passengers[0])}
            onPrint={handlePrint}
            ticketPdfUrl={uploadedPdfUrl}
          />
        )}
      </section>
    </>
  );
}
