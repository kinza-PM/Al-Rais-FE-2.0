import { useState, useMemo, useEffect } from "react";
import baggage from "../../assets/svgs/enhance-baggage.svg";
import CustomToggle from "../common/CustomToggle";
import CollapsibleCard from "./CollapsibleCard";
import CardFeaturingRow from "./CardFeaturingRow";
import type { SegmentSummary } from "../../utils/flightBookingHelper";
import { useAncillaryStore } from "../../store/useAncillaryStore";

type FlightBookingBaggageSectionProps = {
  open: boolean;
  onToggleOpen: () => void;
  flightPassengers: Array<any>;
  flightAncillarySearch?: any;
  flightJourneys: Array<{ flightSegments: SegmentSummary[] }>;
};

// Define the selection state type
type BaggageSelectionState = Record<string, Record<string, string | null>>;

export default function FlightBookingBaggageSection({
  open,
  onToggleOpen,
  flightPassengers,
  flightAncillarySearch,
  flightJourneys,
}: FlightBookingBaggageSectionProps) {
  const { setBaggageSelections, baggageSelections } = useAncillaryStore();
  // Calculate eligible passengers (exclude INF)
  const eligiblePassengers = useMemo(() => {
    return flightPassengers.filter((p) => p.ptc !== "INF");
  }, [flightPassengers]);

  // Get all segments with metadata
  const allSegments = useMemo(() => {
    const segments: Array<
      SegmentSummary & {
        journeyIndex: number;
        segmentIndex: number;
        journeyType: string;
        isMultiStop: boolean;
        stopNumber: number | null;
      }
    > = [];

    flightJourneys.forEach((journey, journeyIdx) => {
      journey.flightSegments.forEach((segment, segmentIdx) => {
        segments.push({
          ...segment,
          journeyIndex: journeyIdx,
          segmentIndex: segmentIdx,
          journeyType:
            flightJourneys.length > 1
              ? journeyIdx === 0
                ? "Departure"
                : "Return"
              : "Departure",
          isMultiStop: journey.flightSegments.length > 1,
          stopNumber: journey.flightSegments.length > 1 ? segmentIdx + 1 : null,
        });
      });
    });
    return segments;
  }, [flightJourneys]);

  // Current segment being viewed
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const currentSegment = allSegments[currentSegmentIndex];

  // Currently active passenger
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);

  // Store selections: { segmentKey: { passengerKey: baggageOfferId | null } }
  const [selections, setSelections] = useState<BaggageSelectionState>({});

  // Get baggage options for current segment
  const getBaggageForSegment = (segmentKey: string) => {
    if (!flightAncillarySearch?.baggages) return [];

    const baggageOptions: any[] = [];

    flightAncillarySearch.baggages.forEach((item: any) => {
      const mapping = item.segmentPassengerMapping;
      if (mapping?.segmentKeys?.includes(segmentKey)) {
        baggageOptions.push(item);
      }
    });

    return baggageOptions;
  };

  const currentBaggageOptions = getBaggageForSegment(
    currentSegment?.segmentKey || ""
  );

  // Helper functions
  const getSelectedBaggageForPassenger = (passengerKey: string) => {
    const segmentKey = currentSegment.segmentKey;
    const baggageId = selections[segmentKey]?.[passengerKey];
    if (!baggageId) return null;

    return currentBaggageOptions.find(
      (item) => item.ancillary.ancillaryOfferId === baggageId
    );
  };

  const toggleBaggageForPassenger = (
    passengerKey: string,
    baggageOfferId: string
  ) => {
    const segmentKey = currentSegment.segmentKey;

    setSelections((prev: BaggageSelectionState) => {
      const segmentSelections = { ...(prev[segmentKey] || {}) };

      // If same baggage is selected, deselect it
      if (segmentSelections[passengerKey] === baggageOfferId) {
        segmentSelections[passengerKey] = null;
      } else {
        // Select new baggage
        segmentSelections[passengerKey] = baggageOfferId;
      }

      return {
        ...prev,
        [segmentKey]: segmentSelections,
      };
    });
  };

  const goToNextSegment = () => {
    if (currentSegmentIndex < allSegments.length - 1) {
      setCurrentSegmentIndex(currentSegmentIndex + 1);
      setActivePassengerIndex(0);
    }
  };

  const goToPreviousSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex(currentSegmentIndex - 1);
      setActivePassengerIndex(0);
    }
  };

  // const getSelectedBaggageSummary = () => {
  //   const result: Array<{
  //     segmentKey: string;
  //     journeyType: string;
  //     segmentInfo: SegmentSummary & {
  //       journeyIndex: number;
  //       segmentIndex: number;
  //       journeyType: string;
  //       isMultiStop: boolean;
  //       stopNumber: number | null;
  //     };
  //     selectedBaggages: Array<{
  //       passengerKey: string;
  //       ptc: string;
  //       ancillaryOfferId: string;
  //       ancillaryCode: string;
  //       ancillaryDescription: string;
  //       price: {
  //         buyingCurrency: string;
  //         buyingAmount: number;
  //         sellingCurrency: string;
  //         sellingAmount: number;
  //       };
  //     }>;
  //     totalAmount: {
  //       currency: string;
  //       amount: number;
  //     };
  //   }> = [];

  //   let grandTotal = 0;
  //   let totalCurrency = "AED";

  //   allSegments.forEach((segment) => {
  //     const segmentSelections = selections[segment.segmentKey] || {};
  //     const selectedBaggagesForSegment: (typeof result)[0]["selectedBaggages"] =
  //       [];
  //     let segmentTotal = 0;

  //     Object.entries(segmentSelections).forEach(([passengerKey, baggageId]) => {
  //       if (!baggageId) return;

  //       const passenger = eligiblePassengers.find(
  //         (p) => p.passengerKey === passengerKey
  //       );
  //       if (!passenger) return;

  //       // Find the actual baggage data
  //       const baggageData = flightAncillarySearch?.baggages?.find(
  //         (baggage: any) => baggage.ancillary.ancillaryOfferId === baggageId
  //       );

  //       if (!baggageData) return;

  //       const fareObj = baggageData.fare?.[0] || {
  //         buyingCurrency: "AED",
  //         buyingAmount: 0,
  //         sellingCurrency: "AED",
  //         sellingAmount: 0,
  //       };

  //       const priceAmount = fareObj.sellingAmount;
  //       segmentTotal += priceAmount;
  //       grandTotal += priceAmount;
  //       totalCurrency = fareObj.sellingCurrency;

  //       selectedBaggagesForSegment.push({
  //         passengerKey,
  //         ptc: passenger.ptc,
  //         ancillaryOfferId: baggageData.ancillary.ancillaryOfferId,
  //         ancillaryCode: baggageData.ancillary.ancillaryCode,
  //         ancillaryDescription: baggageData.ancillary.ancillaryDescription,
  //         price: {
  //           buyingCurrency: fareObj.buyingCurrency,
  //           buyingAmount: fareObj.buyingAmount,
  //           sellingCurrency: fareObj.sellingCurrency,
  //           sellingAmount: fareObj.sellingAmount,
  //         },
  //       });
  //     });

  //     if (selectedBaggagesForSegment.length > 0) {
  //       result.push({
  //         segmentKey: segment.segmentKey,
  //         journeyType: segment.journeyType,
  //         segmentInfo: segment,
  //         selectedBaggages: selectedBaggagesForSegment,
  //         totalAmount: {
  //           currency: totalCurrency,
  //           amount: segmentTotal,
  //         },
  //       });
  //     }
  //   });

  //   return {
  //     segments: result,
  //     grandTotal: {
  //       currency: totalCurrency,
  //       amount: grandTotal,
  //     },
  //   };
  // };

  // const handleConfirmSelection = () => {
  //   const summary = getSelectedBaggageSummary();
  //   console.log("FINAL BAGGAGE SUMMARY →", summary);
  //   console.log(
  //     `Baggage confirmed! Total: ${summary.grandTotal.amount} ${summary.grandTotal.currency}`
  //   );
  // };

  const getPassengerLabel = (passenger: any, index: number) => {
    const ptcLabel =
      passenger.ptc === "ADT"
        ? "Adult"
        : passenger.ptc === "CHD" || passenger.ptc === "CNN"
        ? "Child"
        : passenger.ptc;
    return `${ptcLabel} ${index + 1}`;
  };

  if (!currentSegment) {
    return null;
  }

  const currentPassenger = eligiblePassengers[activePassengerIndex];
  const selectedBaggage = getSelectedBaggageForPassenger(
    currentPassenger?.passengerKey
  );

  // useEffect(() => {
  //   setBaggageSelections(selections);
  // }, [selections, setBaggageSelections]);

  // useEffect(() => {
  //   if (
  //     Object.keys(baggageSelections).length === 0 &&
  //     Object.keys(selections).length > 0
  //   ) {
  //     setSelections({});
  //     setCurrentSegmentIndex(0);
  //     setActivePassengerIndex(0);
  //   } else if (
  //     Object.keys(baggageSelections).length > 0 &&
  //     Object.keys(selections).length === 0
  //   ) {
  //     setSelections(baggageSelections);
  //   }
  // }, [baggageSelections]);

  useEffect(() => {
    const localBaggageJSON = JSON.stringify(selections);
    const storeBaggageJSON = JSON.stringify(baggageSelections);

    if (localBaggageJSON !== storeBaggageJSON) {
      setBaggageSelections(selections);
    }
  }, [selections]);

  useEffect(() => {
    if (
      Object.keys(baggageSelections).length === 0 &&
      Object.keys(selections).length > 0
    ) {
      setSelections({});
      setCurrentSegmentIndex(0);
      setActivePassengerIndex(0);
    }
  }, [baggageSelections]);

  return (
    <div className="px-3 pb-3 mt-3">
      <CollapsibleCard
        open={open}
        onToggle={onToggleOpen}
        icon={<img src={baggage} alt="baggage" className="w-6 h-6" />}
        title="Baggage"
        subtitle="Add extra baggage to your booking."
      >
        {/* Segment Navigation - Show only if multiple segments */}
        {allSegments.length > 1 && (
          <div className="mb-4 flex items-center justify-between bg-[#EFF6FF] px-4 py-3 rounded-xl">
            <button
              type="button"
              onClick={goToPreviousSegment}
              disabled={currentSegmentIndex === 0}
              className="flex items-center gap-1 text-[#2351A3] disabled:opacity-30 disabled:cursor-not-allowed hover:underline"
            >
              <span className="text-[18px]">←</span>
              <span className="text-[13px] font-medium">Previous</span>
            </button>

            <div className="text-center flex-1">
              <div className="text-[14px] font-semibold text-[#0A0C0F]">
                {currentSegment.journeyType} Flight
                {currentSegment.isMultiStop &&
                  ` - Stop ${currentSegment.stopNumber}`}
              </div>
              <div className="text-[12px] text-[#3D495C]">
                Segment {currentSegmentIndex + 1} of {allSegments.length}
              </div>
            </div>

            <button
              type="button"
              onClick={goToNextSegment}
              disabled={currentSegmentIndex === allSegments.length - 1}
              className="flex items-center gap-1 text-[#2351A3] disabled:opacity-30 disabled:cursor-not-allowed hover:underline"
            >
              <span className="text-[13px] font-medium">Next</span>
              <span className="text-[18px]">→</span>
            </button>
          </div>
        )}

        {/* Passenger switcher */}
        <div className="mb-5 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-xl border border-[#C2CAD6] bg-white p-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
            {eligiblePassengers.map((passenger, i) => (
              <button
                key={passenger.passengerKey}
                type="button"
                onClick={() => setActivePassengerIndex(i)}
                className={`px-6 py-1.5 text-[14px] font-medium rounded-xl transition ${
                  activePassengerIndex === i
                    ? "bg-[#2351A3] text-white shadow-sm"
                    : "text-[#3D495C] hover:bg-[#F2F6FF]"
                }`}
              >
                {getPassengerLabel(passenger, i)}
              </button>
            ))}
          </div>
        </div>

        {/* Check if baggage options available for current segment */}
        {currentBaggageOptions.length === 0 ? (
          <div className="text-center py-8 text-[#3D495C] font-semibold">
            No baggage options available for this segment
          </div>
        ) : (
          <div>
            <div className="mb-2 text-[15px] font-semibold text-[#0A0C0F]">
              {currentSegment.journeyType} flight
              {currentSegment.isMultiStop &&
                ` (Stop ${currentSegment.stopNumber})`}
            </div>

            <div className="space-y-3">
              {currentBaggageOptions.map((baggageOption) => {
                const baggageId = baggageOption.ancillary.ancillaryOfferId;
                const isThisSelected =
                  selectedBaggage?.ancillary.ancillaryOfferId === baggageId;
                const price = baggageOption.fare[0]?.sellingAmount || 0;
                const currency =
                  baggageOption.fare[0]?.sellingCurrency || "AED";

                return (
                  <CardFeaturingRow
                    key={baggageId}
                    airline={{
                      logo: `/airlines/${currentSegment.marketingAirline}.png`,
                      name: `${currentSegment.marketingAirline} Airlines`,
                      flight: `${currentSegment.flightNumber} – ${currentSegment.cabinClass}`,
                    }}
                    blocks={[
                      {
                        label: "Baggage",
                        value: baggageOption.ancillary.ancillaryDescription,
                      },
                      {
                        label: "Upgrade cost",
                        value: (
                          <>
                            <span className="font-bold text-[15px]">
                              {currency} {price.toFixed(2)}
                            </span>
                            <span className="text-[13px]">/per item</span>
                          </>
                        ),
                      },
                      {
                        label: "Added to purchase",
                        value: isThisSelected ? (
                          <span className="text-[#00522E] font-medium">
                            Added
                          </span>
                        ) : (
                          <span className="text-[#0A0C0F]">-</span>
                        ),
                      },
                    ]}
                    right={
                      <CustomToggle
                        checked={isThisSelected}
                        onChange={() =>
                          toggleBaggageForPassenger(
                            currentPassenger.passengerKey,
                            baggageId
                          )
                        }
                      />
                    }
                    className="enhance-baggage-grid"
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Confirm button - show only on last segment */}
        {/* {currentSegmentIndex === allSegments.length - 1 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleConfirmSelection}
              className="px-12 rounded-xl bg-[#2351A3] py-3 text-[16px] font-semibold text-[#F2F2F3] hover:brightness-95 active:brightness-90"
            >
              Confirm selection
            </button>
          </div>
        )}
        {currentSegmentIndex < allSegments.length - 1 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={goToNextSegment}
              className="px-12 rounded-xl bg-[#2351A3] py-3 text-[16px] font-semibold text-[#F2F2F3] hover:brightness-95 active:brightness-90"
            >
              Next segment →
            </button>
          </div>
        )} */}
      </CollapsibleCard>
    </div>
  );
}
