import { useEffect, useState } from "react";
import FlightBookingBookSection from "../components/molecules/FlightBookingBookSection";
import FlightBookingReviewSection from "../components/molecules/FlightBookingReviewSection";
import FlightBookingPaymentSection from "../components/molecules/FlightBookingPaymentSection";
import FlightBookingETicketSection from "../components/molecules/FlightBookingETicketSection";
import { Button } from "../components";
import BookingBannerAlert from "../components/common/BookingBannerAlert";
import { useLocation } from "react-router-dom";
import {
  buildInitialFlightBookingPassengersPayload,
  type FlightFinalReservedBooking,
} from "../utils/flightBookingHelper";
import { useCityOptions } from "../hooks/masterListings/listing";
import Loader from "../components/atoms/Loader";
import { useFlightFareRuleSearch } from "../hooks/useFlightBooking";
import toast from "react-hot-toast";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";

const FlightBooking = () => {
  const location = useLocation();
  const initialOfferData =
    (location.state && (location.state as any)) ||
    (window.history.state && (window.history.state as any)) ||
    null;
  const [offerData, setOfferData] = useState<any>(initialOfferData);
  const [finalReservedFlightBookingData, setFinalReservedFlightBookingData] =
    useState<FlightFinalReservedBooking | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [fareBookingSearchRules, setFareBookingSearchRules] =
    useState<any>(null);
  const steps = ["Book", "Review", "Pay", "E-ticket"];
  const progressPct =
    steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

  const [flightBookingPayload, setFlightBookingPayload] = useState(() => ({
    offerId: offerData?.offerId,
    journey: offerData?.flightDetail?.raw?.journey,
    passengers: buildInitialFlightBookingPassengersPayload(
      offerData?.passengersForRequest
    ),
    reservationType: "TICKET",
    paymentDetails: {
      paymentMode: "CR",
    },
  }));

  const [flightReservationBookingPayload, setFlightReservationBookingPayload] =
    useState(() => ({
      bookingReferenceId: "",
      offerId: flightBookingPayload?.offerId,
      customerInfo: {
        emailAddress: "",
      },
      passengers: flightBookingPayload?.passengers,
      paymentDetails: {
        paymentMode: "CR",
        transactionAmount: null,
        cardInfo: "U2FsdGVkX1+aBcdefghijklmnoPQRS+tuvwxYZ1234==",
        address: {
          label: "Billing",
          street: [],
          postalCode: "",
          cityName: "",
          countryCode: "UAE",
        },
      },
    }));

  const { data: cityOptions, isLoading: isCountryLoading } =
    useCityOptions(true);

  const { mutateAsync, isPending } = useFlightFareRuleSearch();

  const setPassengerFlightInitialPayload = (
    obj: any,
    path: string,
    value: any
  ) => {
    const parts = path.split(".");
    let cur = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (/^\d+$/.test(key)) {
        const idx = Number(key);
        if (!Array.isArray(cur)) cur = []; // fallback
        if (!cur[idx]) cur[idx] = {};
        cur = cur[idx];
      } else {
        if (!cur[key]) cur[key] = {};
        cur = cur[key];
      }
    }
    const last = parts[parts.length - 1];
    if (/^\d+$/.test(last)) {
      const idx = Number(last);
      if (!Array.isArray(cur)) cur = [];
      cur[idx] = value;
    } else {
      cur[last] = value;
    }
  };

  const updatePassengerField = (index: number, path: string, value: any) => {
    setFlightBookingPayload((prev) => {
      const next = JSON.parse(JSON.stringify(prev)); // quick deep clone
      if (!next.passengers[index]) return prev;
      setPassengerFlightInitialPayload(next.passengers[index], path, value);
      return next;
    });
  };

  const handleUpdateFlightRawDetails = (
    newRaw: Partial<{
      detail: any;
      fare: any;
      financialInfo: any;
      journey: any;
      offerId?: string | number;
    }>
  ) => {
    setOfferData((prev: any) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        flightDetail: {
          ...(prev.flightDetail ?? {}),
          raw: {
            ...((prev.flightDetail && prev.flightDetail.raw) || {}),
            ...newRaw,
          },
        },
      };

      const candidateOfferId =
        (newRaw as any).offerId ?? (newRaw as any).detail?.offerId;
      if (candidateOfferId !== undefined) {
        updated.offerId = candidateOfferId;
      }

      return updated;
    });

    const candidateOfferId =
      (newRaw as any).offerId ?? (newRaw as any).detail?.offerId;
    if (candidateOfferId !== undefined) {
      setFlightBookingPayload((prev) => ({
        ...prev,
        offerId: candidateOfferId,
      }));
    }

    setFlightReservationBookingPayload((prev) => ({
      ...prev,
      offerId: candidateOfferId,
      passengers: flightBookingPayload?.passengers,
    }));
  };

  const handleFlightReservationBookingChange = (
    eOrPath:
      | React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
      | string,
    maybeValue?: any
  ) => {
    let path: string;
    let value: any;

    if (typeof eOrPath === "string") {
      path = eOrPath;
      value = maybeValue;
    } else {
      const target = eOrPath.target as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement;
      path = target.name;
      if (!path) {
        console.warn(
          "Input missing `name` attribute for generic reservation handler."
        );
        return;
      }
      if (target.type === "checkbox") {
        value = (target as HTMLInputElement).checked;
      } else if (target.type === "number") {
        const parsed = (target as HTMLInputElement).value;
        value = parsed === "" ? "" : Number(parsed);
      } else {
        value = target.value;
      }
    }

    setFlightReservationBookingPayload((prev) => {
      const next = JSON.parse(JSON.stringify(prev || {}));
      setPassengerFlightInitialPayload(next, path, value);
      return next;
    });
  };

  const onFinalReservationFlightBookingSuccess = (
    payload: FlightFinalReservedBooking
  ) => {
    setFinalReservedFlightBookingData(payload);
  };

  const showTimerBanner = [1, 2].includes(currentStep);

  const init = async () => {
    if (!offerData?.offerId) return;
    try {
      const response = await mutateAsync({ offerId: offerData?.offerId });
      const rules = response?.data?.[0]?.bookingRules ?? null;
      setFareBookingSearchRules(rules);
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (offerData?.passengersForRequest) {
      setFlightBookingPayload((prev) => ({
        ...prev,
        passengers: buildInitialFlightBookingPassengersPayload(
          offerData.passengersForRequest
        ),
      }));
    }
  }, [offerData?.passengersForRequest]);

  return (
    <>
      {showTimerBanner && (
        <BookingBannerAlert
          message="Please complete your booking"
          time="00:10:00"
          onExpire={() => {
            setCurrentStep(0);
            setOfferData(initialOfferData);
            setFlightBookingPayload((prev) => ({
              ...prev,
              offerId: initialOfferData.offerId ?? prev.offerId,
              journey:
                initialOfferData.flightDetail?.raw?.journey ?? prev.journey,
            }));
          }}
        />
      )}
      <Loader
        show={isCountryLoading || isPending}
        label="Please wait while we are fetching records..."
      />
      <div className={`p-8 ${showTimerBanner ? "pt-8" : ""}`}>
        <div className="relative mx-auto max-w-[420px] md:max-w-[520px]">
          <div className="absolute left-[10px] right-[15px] top-3 -translate-y-1/2 z-0">
            <div className="relative h-[2px]">
              <div className="absolute inset-0 bg-[#F2F2F3]" />
              <div
                className="absolute inset-y-0 left-0 bg-[#2351A3] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <ol className="relative z-10 flex items-center justify-between">
            {steps.map((label, i) => {
              // const isCurrent = i === currentStep;
              // const isCompleted = i < currentStep;
              const isReached = i <= currentStep;

              return (
                <li key={label} className="flex flex-col items-center">
                  <Button
                    type="button"
                    // onClick={() => setCurrentStep(i)}
                    className={[
                      "flex h-5 w-5 items-center justify-center rounded-full border transition p-0", // keep circle shape
                      "focus:outline-none",
                      isReached
                        ? "bg-[#2351A3] border-[#2351A3]"
                        : "bg-[#C2CAD6] border-[#C2CAD6]",
                    ].join(" ")}
                    overrideClasses
                  >
                    {""}
                  </Button>

                  <Button
                    type="button"
                    // onClick={() => setCurrentStep(i)}
                    className={[
                      "mt-2 text-sm transition-colors bg-transparent border-none hover:text-[#2351A3]",
                      isReached
                        ? "text-[#2351A3] font-medium"
                        : "text-[#3D495C]",
                    ].join(" ")}
                    overrideClasses
                  >
                    {label}
                  </Button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-6">
          {currentStep === 0 && (
            <FlightBookingBookSection
              trip={offerData.flightDetail}
              passengers={flightBookingPayload.passengers}
              flightBookingPayload={flightBookingPayload}
              onPassengerFieldChange={updatePassengerField}
              cities={cityOptions}
              fareBookingSearchRules={fareBookingSearchRules}
              onNext={() => setCurrentStep(1)}
              onUpdateFlightRaw={handleUpdateFlightRawDetails}
            />
          )}
          {currentStep === 1 && (
            <FlightBookingReviewSection
              trip={offerData.flightDetail}
              fareBookingSearchRules={fareBookingSearchRules}
              flightBookingPayload={flightBookingPayload}
              cities={cityOptions}
              onNext={() => setCurrentStep(2)}
              onPrevious={() => {
                setCurrentStep(0);
                setOfferData(initialOfferData);
                setFlightBookingPayload((prev) => ({
                  ...prev,
                  offerId: initialOfferData.offerId ?? prev.offerId,
                  journey:
                    initialOfferData.flightDetail?.raw?.journey ?? prev.journey,
                }));
              }}
            />
          )}
          {currentStep === 2 && (
            <FlightBookingPaymentSection
              trip={offerData.flightDetail}
              cities={cityOptions}
              reservation={flightReservationBookingPayload}
              onReservationChange={handleFlightReservationBookingChange}
              onNext={() => setCurrentStep(3)}
              onFinalReservationFlightBookingSuccess={
                onFinalReservationFlightBookingSuccess
              }
            />
          )}
          {currentStep === 3 && (
            <FlightBookingETicketSection
              reservedFlightBooking={finalReservedFlightBookingData}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default FlightBooking;
