import { useEffect, useState } from "react";
import FlightBookingBookSection from "../components/molecules/FlightBookingBookSection";
import FlightBookingReviewSection from "../components/molecules/FlightBookingReviewSection";
import FlightBookingPaymentSection from "../components/molecules/FlightBookingPaymentSection";
import FlightBookingETicketSection from "../components/molecules/FlightBookingETicketSection";
import { Button } from "../components";
import BookingBannerAlert from "../components/common/BookingBannerAlert";
import { useLocation, useNavigate } from "react-router-dom";
import {
  buildInitialFlightBookingPassengersPayload,
  type FlightFinalReservedBooking,
} from "../utils/flightBookingHelper";
import { generateUUID } from "../utils/helpers";
import {
  // useAiprortOptions,
  useCountriesOptions,
} from "../hooks/masterListings/listing";
import Loader from "../components/atoms/Loader";
import {
  useFlightAncillarySearch,
  useFlightFareRuleSearch,
} from "../hooks/useFlightBooking";
import toast from "react-hot-toast";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";
import FlightBookingAnicllarySection from "../components/molecules/FlightBookingAnicllarySection";

const FlightBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialOfferData =
    (location.state && (location.state as any)) ||
    (window.history.state && (window.history.state as any)) ||
    null;
  const [offerData, setOfferData] = useState<any>(initialOfferData);
  const [ancillarySearchData, setAncillarySearchData] = useState<any>(null);
  const [finalReservedFlightBookingData, setFinalReservedFlightBookingData] =
    useState<FlightFinalReservedBooking | null>(null);
  // const [currentStep, setCurrentStep] = useState(0);
  const [fareBookingSearchRules, setFareBookingSearchRules] =
    useState<any>(null);
  const enhanceAvailable =
    !!initialOfferData?.flightDetail?.raw?.detail?.ancillaryDetailsAvailable;
  // const steps = ["Book", "Enhance", "Review", "Pay", "E-ticket"];
  const [steps, _] = useState<string[]>(
    enhanceAvailable
      ? ["Book", "Enhance", "Review", "Pay", "E-ticket"]
      : ["Book", "Review", "Pay", "E-ticket"],
  );

  // Check if this is a pending booking (skip to payment)
  const isPendingBooking = initialOfferData?.isPendingBooking || false;

  const [currentStep, setCurrentStep] = useState(() => {
    if (isPendingBooking) {
      const payStep = steps.indexOf("Pay");
      return payStep >= 0 ? payStep : 0;
    }
    return 0;
  });
  const progressPct =
    steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;
  // console.log('offerData------------', offerData);
  // const [flightBookingPayload, setFlightBookingPayload] = useState(() => ({
  //   offerId: offerData?.offerId,
  //   searchKey: offerData?.searchKey,
  //   journey: offerData?.flightDetail?.raw?.journey,
  //   passengers: buildInitialFlightBookingPassengersPayload(
  //     offerData?.passengersForRequest
  //   ),
  //   reservationType: "TICKET",
  //   paymentDetails: {
  //     paymentMode: "CR",
  //   },
  // }));
  const [flightBookingPayload, setFlightBookingPayload] = useState(() => {
    // For pending bookings, use passengers data from API
    let passengers = buildInitialFlightBookingPassengersPayload(
      offerData?.passengersForRequest,
    );

    // If pending booking, pre-fill passenger data from API
    if (isPendingBooking && offerData?.passengersData) {
      passengers = offerData.passengersData.map((p: any) => ({
        passengerKey: p.passengerKey || generateUUID(),
        ptc: p.ptc || "ADT",
        passengerInfo: p.passengerInfo || {
          birthDate: null,
          gender: "",
          nameTitle: "",
          givenName: "",
          surname: "",
        },
        identityDocuments: p.identityDocuments || [
          {
            idDocumentNumber: "",
            idType: "PT",
            issuingCountryCode: "",
            residenceCountryCode: "",
            expiryDate: null,
          },
        ],
        contact: p.contact || {
          contactsProvided: [
            {
              emailAddress: [""],
              phone: [
                {
                  label: "Origin",
                  areaCode: "+1",
                  phoneNumber: "",
                },
              ],
            },
          ],
        },
      }));
    }

    return {
      offerId: offerData?.offerId,
      searchKey: offerData?.searchKey,
      journey: offerData?.flightDetail?.raw?.journey,
      passengers,
      reservationType: "TICKET",
      paymentDetails: {
        paymentMode: "CR",
      },
    };
  });
  // console.log(initialOfferData);
  const [flightReservationBookingPayload, setFlightReservationBookingPayload] =
    // useState(() => ({
    //   bookingReferenceId: "",
    //   offerId: flightBookingPayload?.offerId,
    //   customerInfo: {
    //     emailAddress: "",
    //   },
    //   passengers: flightBookingPayload?.passengers,
    //   paymentDetails: {
    //     paymentMode: "CR",
    //     transactionAmount: null,
    //     // cardInfo: "U2FsdGVkX1+aBcdefghijklmnoPQRS+tuvwxYZ1234==",
    //     cardInfo: "",
    //     address: {
    //       label: "Billing",
    //       street: [],
    //       postalCode: "",
    //       cityName: "",
    //       countryCode: "UAE",
    //     },
    //   },
    // }));
    useState(() => {
      return {
        bookingReferenceId: "",
        offerId: flightBookingPayload?.offerId,
        searchKey: offerData?.searchKey,
        customerInfo: {
          emailAddress: "",
        },
        passengers: flightBookingPayload?.passengers,
        paymentDetails: {
          paymentMode: "CR",
          transactionAmount: null,
          // cardInfo: "U2FsdGVkX1+aBcdefghijklmnoPQRS+tuvwxYZ1234==",
          cardInfo: "",
          address: {
            label: "Billing",
            street: [],
            postalCode: "",
            cityName: "",
            countryCode: "UAE",
          },
        },
      };
    });

  // const { data: cityOptions, isLoading: isCountryLoading } =
  //   useAiprortOptions(true);
  const { data: countriesOptions, isLoading: isCountriesLoading } =
    useCountriesOptions();

  const { mutateAsync, isPending } = useFlightFareRuleSearch();
  const { mutateAsync: mutateAsyncAncillary, isPending: isPendingAncillary } =
    useFlightAncillarySearch();

  const setPassengerFlightInitialPayload = (
    obj: any,
    path: string,
    value: any,
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
    }>,
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
    maybeValue?: any,
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
          "Input missing `name` attribute for generic reservation handler.",
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
    payload: FlightFinalReservedBooking,
  ) => {
    setFinalReservedFlightBookingData(payload);
  };

  const reviewStepIndex = steps.indexOf("Review");
  const payStepIndex = steps.indexOf("Pay");
  const eticketStepIndex = steps.indexOf("E-ticket");
  const enhanceStepIndex = steps.indexOf("Enhance");

  // Set initial step - skip to payment for pending bookings

  // const showTimerBanner = [0, 1, 2].includes(currentStep);
  const showTimerBanner = currentStep < eticketStepIndex;

  const init = async () => {
    // Skip fare rule search for pending bookings
    if (isPendingBooking) {
      return;
    }

    if (!offerData?.offerId) return;
    try {
      const response = await mutateAsync({ offerId: offerData?.offerId });
      const rules = response?.data?.[0]?.bookingRules ?? null;
      setFareBookingSearchRules(rules);
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
      if (err == "Offer Id Invalid or Expired") {
        navigate("/search_flight");
        // return
      }
    }
  };

  const flightAncillarySearch = async (offerId: string) => {
    if (!offerId) return;
    try {
      const response = await mutateAsyncAncillary({
        offerId: offerId,
        seatMapRequested: true,
        otherAncillaryRequested: true,
        formOfPayment: "CR",
        travelType: "P",
      });
      const ancillarySearch = response?.data?.[0] ?? null;
      setAncillarySearchData(ancillarySearch);
      return ancillarySearch;
    } catch (error) {
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err);
      return null;
    }
  };

  const hasAncillaries =
    ancillarySearchData?.seatMap ||
    ancillarySearchData?.baggages ||
    ancillarySearchData?.meals ||
    ancillarySearchData?.otherAncillaries;

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (offerData?.passengersForRequest && !isPendingBooking) {
      setFlightBookingPayload((prev) => ({
        ...prev,
        passengers: buildInitialFlightBookingPassengersPayload(
          offerData.passengersForRequest,
        ),
      }));
    }
    // For pending bookings, passengers are already set in initial state
  }, [offerData?.passengersForRequest, isPendingBooking]);

  return (
    <>
      {showTimerBanner && (
        <BookingBannerAlert
          message="Please complete your booking"
          time="00:15:00"
          onExpire={() => {
            navigate("/search_flight");
            // setCurrentStep(0);
            // setOfferData(initialOfferData);
            // setFlightBookingPayload((prev) => ({
            //   ...prev,
            //   offerId: initialOfferData.offerId ?? prev.offerId,
            //   journey:
            //     initialOfferData.flightDetail?.raw?.journey ?? prev.journey,
            // }));
          }}
        />
      )}
      <Loader
        show={isCountriesLoading || isPending || isPendingAncillary}
        // show={isCountryLoading || isPending}
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
              countries={countriesOptions}
              fareBookingSearchRules={fareBookingSearchRules}
              // onNext={() => setCurrentStep(hasAncillaries ? 1 : 2)}
              onNext={async (newOfferId?: string) => {
                const usedOfferId = newOfferId ?? offerData.offerId;
                // if the initial offer indicates ancillaries are available -> fetch them now
                if (enhanceAvailable) {
                  const ancillary = await flightAncillarySearch(usedOfferId);
                  const hasData =
                    !!ancillary?.seatMap ||
                    !!ancillary?.baggages ||
                    !!ancillary?.meals ||
                    !!ancillary?.otherAncillaries;

                  setCurrentStep(hasData ? 1 : 2);
                } else {
                  // no enhance step in stepper, go straight to Review
                  setCurrentStep(1);
                }
              }}
              onUpdateFlightRaw={handleUpdateFlightRawDetails}
              // flightAncillarySearch={ancillarySearchData}
            />
          )}
          {currentStep === enhanceStepIndex &&
            enhanceStepIndex !== -1 &&
            hasAncillaries && (
              <FlightBookingAnicllarySection
                trip={offerData.flightDetail}
                passengers={flightBookingPayload.passengers}
                flightAncillarySearch={ancillarySearchData}
                onNext={() => setCurrentStep(2)}
                offerId={offerData?.offerId}
              />
            )}
          {currentStep === reviewStepIndex && (
            <FlightBookingReviewSection
              trip={offerData.flightDetail}
              fareBookingSearchRules={fareBookingSearchRules}
              flightBookingPayload={flightBookingPayload}
              // cities={cityOptions}
              countries={countriesOptions}
              onNext={() => setCurrentStep(enhanceAvailable ? 3 : 2)}
              // onNext={() => setCurrentStep(3)}
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
          {currentStep === payStepIndex && (
            <FlightBookingPaymentSection
              trip={offerData.flightDetail}
              // cities={cityOptions}
              countries={countriesOptions}
              reservation={flightReservationBookingPayload}
              onReservationChange={handleFlightReservationBookingChange}
              onNext={() => setCurrentStep(4)}
              onFinalReservationFlightBookingSuccess={
                onFinalReservationFlightBookingSuccess
              }
            />
          )}
          {currentStep === eticketStepIndex && (
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
