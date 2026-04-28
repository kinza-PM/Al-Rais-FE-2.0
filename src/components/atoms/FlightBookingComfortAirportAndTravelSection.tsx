import { useState, useMemo, useEffect } from "react";
// import INFO_ICON from "../../assets/svgs/info.svg";
import CustomToggle from "../common/CustomToggle";
import CardFeaturingRow from "./CardFeaturingRow";
import CollapsibleCard from "./CollapsibleCard";
import { useAncillaryStore } from "../../store/useAncillaryStore";
import type { SegmentSummary } from "../../utils/flightBookingHelper";
import { getMarketingAirlineDisplayName } from "../../utils/helpers";

type ComfortAirportTravelProps = {
  flightPassengers: Array<any>;
  flightAncillarySearch?: any;
  flightJourneys: Array<{ flightSegments: SegmentSummary[] }>;
};

// Define the selection state type: { segmentKey: { passengerKey: { ancillaryOfferId: boolean } } }
type OtherAncillarySelectionState = Record<
  string,
  Record<string, Record<string, boolean>>
>;

export default function FlightBookingComfortAirportAndTravelSection({
  flightPassengers,
  flightAncillarySearch,
  flightJourneys,
}: ComfortAirportTravelProps) {
  const { setOtherAncillariesSelections, otherAncillariesSelections } =
    useAncillaryStore();
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

  // Store selections: { segmentKey: { passengerKey: { ancillaryOfferId: boolean } } }
  const [selections, setSelections] = useState<OtherAncillarySelectionState>(
    {}
  );

  // Group ancillaries by type
  const groupedAncillaries = useMemo(() => {
    if (!flightAncillarySearch?.otherAncillaries) return {};

    const grouped: Record<string, any[]> = {};

    flightAncillarySearch.otherAncillaries.forEach((item: any) => {
      const type = item.ancillary.type || "OTHER";

      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(item);
    });

    return grouped;
  }, [flightAncillarySearch?.otherAncillaries]);

  const ancillaryTypes = Object.keys(groupedAncillaries);

  const [openStates, setOpenStates] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ancillaryTypes.forEach((type, index) => {
      initial[type] = index === 0; // First one open by default
    });
    return initial;
  });

  // Get ancillaries for current segment
  const getAncillariesForSegment = (segmentKey: string, type: string) => {
    return (
      groupedAncillaries[type]?.filter((item: any) => {
        const mapping = item.segmentPassengerMapping;
        return mapping?.segmentKeys?.includes(segmentKey);
      }) || []
    );
  };

  const toggleAncillary = (ancillaryOfferId: string) => {
    const segmentKey = currentSegment.segmentKey;
    const passengerKey = eligiblePassengers[activePassengerIndex]?.passengerKey;

    setSelections((prev: OtherAncillarySelectionState) => {
      const segmentSelections = { ...(prev[segmentKey] || {}) };
      const passengerSelections = {
        ...(segmentSelections[passengerKey] || {}),
      };

      passengerSelections[ancillaryOfferId] =
        !passengerSelections[ancillaryOfferId];

      segmentSelections[passengerKey] = passengerSelections;

      return {
        ...prev,
        [segmentKey]: segmentSelections,
      };
    });
  };

  const isAncillarySelected = (ancillaryOfferId: string) => {
    const segmentKey = currentSegment.segmentKey;
    const passengerKey = eligiblePassengers[activePassengerIndex]?.passengerKey;
    return !!selections[segmentKey]?.[passengerKey]?.[ancillaryOfferId];
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

  const toggleType = (type: string) => {
    setOpenStates((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const getPassengerLabel = (passenger: any, index: number) => {
    const ptcLabel =
      passenger.ptc === "ADT"
        ? "Adult"
        : passenger.ptc === "CHD" || passenger.ptc === "CNN"
        ? "Child"
        : passenger.ptc;
    return `${ptcLabel} ${index + 1}`;
  };

  const formatTypeName = (type: string) => {
    return type
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getIconForType = (type: string) => {
    if (type.includes("COMFORT") || type.includes("ENTERTAINMENT")) {
      return (
        <svg
          width="25"
          height="25"
          viewBox="0 0 28 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.5005 19.4999C15.5005 19.7966 15.4125 20.0866 15.2477 20.3333C15.0829 20.5799 14.8486 20.7722 14.5745 20.8857C14.3004 20.9993 13.9988 21.029 13.7078 20.9711C13.4169 20.9132 13.1496 20.7703 12.9398 20.5606C12.73 20.3508 12.5872 20.0835 12.5293 19.7925C12.4714 19.5016 12.5011 19.2 12.6147 18.9259C12.7282 18.6518 12.9204 18.4175 13.1671 18.2527C13.4138 18.0879 13.7038 17.9999 14.0005 17.9999C14.3983 17.9999 14.7798 18.1579 15.0611 18.4393C15.3424 18.7206 15.5005 19.1021 15.5005 19.4999ZM27.6355 4.87491C23.7911 1.72164 18.9726 -0.00170898 14.0005 -0.00170898C9.02831 -0.00170898 4.20985 1.72164 0.365474 4.87491C0.263945 4.9583 0.179836 5.06087 0.117948 5.17677C0.0560597 5.29266 0.0176049 5.41961 0.00477885 5.55037C-0.00804724 5.68112 0.00500665 5.81313 0.0431952 5.93884C0.0813838 6.06455 0.143959 6.18151 0.227349 6.28304C0.310738 6.38456 0.413308 6.46867 0.529203 6.53056C0.645098 6.59245 0.772048 6.6309 0.902804 6.64373C1.16688 6.66963 1.43043 6.58957 1.63547 6.42116C5.12198 3.56205 9.49156 1.99952 14.0005 1.99952C18.5094 1.99952 22.879 3.56205 26.3655 6.42116C26.5705 6.58957 26.8341 6.66963 27.0981 6.64373C27.3622 6.61783 27.6052 6.48808 27.7736 6.28304C27.942 6.07799 28.0221 5.81444 27.9962 5.55037C27.9703 5.28629 27.8405 5.04332 27.6355 4.87491ZM23.6255 9.34616C20.8871 7.17819 17.4969 5.99859 14.0042 5.99859C10.5116 5.99859 7.1213 7.17819 4.38297 9.34616C4.17511 9.51093 4.04121 9.75152 4.01074 10.015C3.98026 10.2785 4.05571 10.5433 4.22047 10.7512C4.38524 10.959 4.62583 11.0929 4.88932 11.1234C5.15281 11.1539 5.41761 11.0784 5.62547 10.9137C8.0103 9.02594 10.9627 7.99887 14.0042 7.99887C17.0457 7.99887 19.9981 9.02594 22.383 10.9137C22.4859 10.9953 22.6039 11.0558 22.7302 11.0918C22.8565 11.1278 22.9887 11.1385 23.1191 11.1234C23.2496 11.1083 23.3758 11.0677 23.4906 11.0038C23.6053 10.94 23.7064 10.8541 23.788 10.7512C23.8696 10.6482 23.9301 10.5303 23.9661 10.4039C24.0021 10.2776 24.0128 10.1455 23.9978 10.015C23.9827 9.88453 23.942 9.75831 23.8781 9.64355C23.8143 9.52879 23.7284 9.42774 23.6255 9.34616ZM19.593 13.8162C17.9686 12.6357 16.0122 11.9998 14.0042 11.9998C11.9962 11.9998 10.0398 12.6357 8.41547 13.8162C8.20098 13.9723 8.0573 14.2073 8.01604 14.4693C7.97478 14.7314 8.03933 14.9992 8.19547 15.2137C8.35162 15.4282 8.58658 15.5718 8.84866 15.6131C9.11074 15.6544 9.37848 15.5898 9.59297 15.4337C10.8749 14.5014 12.4192 13.9992 14.0042 13.9992C15.5893 13.9992 17.1336 14.5014 18.4155 15.4337C18.5217 15.511 18.6421 15.5666 18.7698 15.5974C18.8975 15.6282 19.03 15.6335 19.1598 15.6131C19.2896 15.5927 19.414 15.5469 19.5261 15.4783C19.6382 15.4098 19.7357 15.3199 19.813 15.2137C19.8903 15.1075 19.9459 14.9871 19.9767 14.8593C20.0075 14.7316 20.0128 14.5991 19.9924 14.4693C19.972 14.3396 19.9262 14.2151 19.8577 14.103C19.7891 13.991 19.6992 13.8935 19.593 13.8162Z"
            fill="#1A3C7A"
          />
        </svg>
      );
    } else if (type.includes("AIRPORT")) {
      return (
        <svg
          width="26"
          height="25"
          viewBox="0 0 26 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M25.6391 6.8525C25.4546 6.58913 25.2094 6.37413 24.9241 6.22572C24.6388 6.07732 24.322 5.99989 24.0004 6H14.0004V2H16.0004C16.2656 2 16.52 1.89464 16.7075 1.70711C16.895 1.51957 17.0004 1.26522 17.0004 1C17.0004 0.734784 16.895 0.48043 16.7075 0.292893C16.52 0.105357 16.2656 0 16.0004 0H10.0004C9.73518 0 9.48082 0.105357 9.29329 0.292893C9.10575 0.48043 9.00039 0.734784 9.00039 1C9.00039 1.26522 9.10575 1.51957 9.29329 1.70711C9.48082 1.89464 9.73518 2 10.0004 2H12.0004V6H2.00039C1.67928 6.00072 1.36306 6.07875 1.07847 6.2275C0.793879 6.37624 0.549289 6.59132 0.36538 6.85456C0.18147 7.11779 0.0636486 7.42144 0.0218769 7.73983C-0.0198948 8.05822 0.0156117 8.38198 0.125394 8.68375L3.39914 17.6838C3.53922 18.0688 3.79417 18.4015 4.12952 18.6369C4.46486 18.8723 4.86442 18.9991 5.27414 19H9.00039V27C9.00039 27.2652 9.10575 27.5196 9.29329 27.7071C9.48082 27.8946 9.73518 28 10.0004 28C10.2656 28 10.52 27.8946 10.7075 27.7071C10.895 27.5196 11.0004 27.2652 11.0004 27V19H15.0004V27C15.0004 27.2652 15.1058 27.5196 15.2933 27.7071C15.4808 27.8946 15.7352 28 16.0004 28C16.2656 28 16.52 27.8946 16.7075 27.7071C16.895 27.5196 17.0004 27.2652 17.0004 27V19H20.7279C21.1376 18.9991 21.5372 18.8723 21.8725 18.6369C22.2079 18.4015 22.4628 18.0688 22.6029 17.6838L25.8766 8.68375C25.9871 8.38189 26.0232 8.05785 25.9819 7.73907C25.9405 7.4203 25.823 7.11619 25.6391 6.8525ZM10.8354 17L9.19789 8H16.8029L15.1654 17H10.8354ZM2.00039 8H7.16539L8.80164 17H5.27289L2.00039 8ZM20.7279 17H17.1991L18.8354 8H24.0004L20.7279 17Z"
            fill="#1A3C7A"
          />
        </svg>
      );
    }
    return (
      <svg
        width="26"
        height="25"
        viewBox="0 0 26 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M25.6391 6.8525C25.4546 6.58913 25.2094 6.37413 24.9241 6.22572C24.6388 6.07732 24.322 5.99989 24.0004 6H14.0004V2H16.0004C16.2656 2 16.52 1.89464 16.7075 1.70711C16.895 1.51957 17.0004 1.26522 17.0004 1C17.0004 0.734784 16.895 0.48043 16.7075 0.292893C16.52 0.105357 16.2656 0 16.0004 0H10.0004C9.73518 0 9.48082 0.105357 9.29329 0.292893C9.10575 0.48043 9.00039 0.734784 9.00039 1C9.00039 1.26522 9.10575 1.51957 9.29329 1.70711C9.48082 1.89464 9.73518 2 10.0004 2H12.0004V6H2.00039C1.67928 6.00072 1.36306 6.07875 1.07847 6.2275C0.793879 6.37624 0.549289 6.59132 0.36538 6.85456C0.18147 7.11779 0.0636486 7.42144 0.0218769 7.73983C-0.0198948 8.05822 0.0156117 8.38198 0.125394 8.68375L3.39914 17.6838C3.53922 18.0688 3.79417 18.4015 4.12952 18.6369C4.46486 18.8723 4.86442 18.9991 5.27414 19H9.00039V27C9.00039 27.2652 9.10575 27.5196 9.29329 27.7071C9.48082 27.8946 9.73518 28 10.0004 28C10.2656 28 10.52 27.8946 10.7075 27.7071C10.895 27.5196 11.0004 27.2652 11.0004 27V19H15.0004V27C15.0004 27.2652 15.1058 27.5196 15.2933 27.7071C15.4808 27.8946 15.7352 28 16.0004 28C16.2656 28 16.52 27.8946 16.7075 27.7071C16.895 27.5196 17.0004 27.2652 17.0004 27V19H20.7279C21.1376 18.9991 21.5372 18.8723 21.8725 18.6369C22.2079 18.4015 22.4628 18.0688 22.6029 17.6838L25.8766 8.68375C25.9871 8.38189 26.0232 8.05785 25.9819 7.73907C25.9405 7.4203 25.823 7.11619 25.6391 6.8525ZM10.8354 17L9.19789 8H16.8029L15.1654 17H10.8354ZM2.00039 8H7.16539L8.80164 17H5.27289L2.00039 8ZM20.7279 17H17.1991L18.8354 8H24.0004L20.7279 17Z"
          fill="#1A3C7A"
        />
      </svg>
    );
  };

  const getSubtitleForType = (type: string) => {
    if (type.includes("TRAVEL"))
      return "Get refund options, seat and date change options.";
    if (type.includes("COMFORT"))
      return "Enjoy a selection of movies & music, higher speed of wi-fi.";
    if (type.includes("AIRPORT"))
      return "Get lounge access, fast track security and priority boarding.";
    return "Additional travel services for your flight.";
  };

  // const getSelectedAncillariesSummary = () => {
  //   // Implementation similar to previous versions but with per-passenger data
  //   const result: any[] = [];
  //   let grandTotal = 0;
  //   let totalCurrency = "AED";

  //   allSegments.forEach((segment) => {
  //     const segmentSelections = selections[segment.segmentKey] || {};

  //     Object.entries(segmentSelections).forEach(
  //       ([passengerKey, ancillarySelections]) => {
  //         const passenger = eligiblePassengers.find(
  //           (p) => p.passengerKey === passengerKey
  //         );
  //         if (!passenger) return;

  //         Object.entries(ancillarySelections).forEach(
  //           ([ancillaryId, isSelected]) => {
  //             if (!isSelected) return;

  //             const ancillary = flightAncillarySearch?.otherAncillaries?.find(
  //               (item: any) => item.ancillary.ancillaryOfferId === ancillaryId
  //             );

  //             if (!ancillary) return;

  //             const fareObj = ancillary.fare?.[0] || {
  //               buyingCurrency: "AED",
  //               buyingAmount: 0,
  //               sellingCurrency: "AED",
  //               sellingAmount: 0,
  //             };

  //             grandTotal += fareObj.sellingAmount;
  //             totalCurrency = fareObj.sellingCurrency;

  //             result.push({
  //               segmentKey: segment.segmentKey,
  //               journeyType: segment.journeyType,
  //               passengerKey,
  //               ptc: passenger.ptc,
  //               ancillaryOfferId: ancillary.ancillary.ancillaryOfferId,
  //               ancillaryDescription: ancillary.ancillary.ancillaryDescription,
  //               type: ancillary.ancillary.type,
  //               price: fareObj.sellingAmount,
  //               currency: fareObj.sellingCurrency,
  //             });
  //           }
  //         );
  //       }
  //     );
  //   });

  //   return {
  //     selections: result,
  //     grandTotal: { amount: grandTotal, currency: totalCurrency },
  //   };
  // };

  // const handleConfirmSelection = () => {
  //   const summary = getSelectedAncillariesSummary();
  //   console.log("FINAL OTHER ANCILLARIES SUMMARY →", summary);
  //   console.log(
  //     `Other ancillaries confirmed! Total: ${summary.grandTotal.amount} ${summary.grandTotal.currency}`
  //   );
  // };

  if (!currentSegment || ancillaryTypes.length === 0) {
    return null;
  }

  // useEffect(() => {
  //   setOtherAncillariesSelections(selections);
  // }, [selections, setOtherAncillariesSelections]);

  // useEffect(() => {
  //   if (
  //     Object.keys(otherAncillariesSelections).length === 0 &&
  //     Object.keys(selections).length > 0
  //   ) {
  //     setSelections({});
  //     setCurrentSegmentIndex(0);
  //     setActivePassengerIndex(0);
  //   } else if (
  //     Object.keys(otherAncillariesSelections).length > 0 &&
  //     Object.keys(selections).length === 0
  //   ) {
  //     setSelections(otherAncillariesSelections);
  //   }
  // }, [otherAncillariesSelections]);

  useEffect(() => {
    const localBaggageJSON = JSON.stringify(selections);
    const storeBaggageJSON = JSON.stringify(otherAncillariesSelections);

    if (localBaggageJSON !== storeBaggageJSON) {
      setOtherAncillariesSelections(selections);
    }
  }, [selections]);

  useEffect(() => {
    if (
      Object.keys(otherAncillariesSelections).length === 0 &&
      Object.keys(selections).length > 0
    ) {
      setSelections({});
      setCurrentSegmentIndex(0);
      setActivePassengerIndex(0);
    }
  }, [otherAncillariesSelections]);

  return (
    <>
      {ancillaryTypes.map((type) => {
        const currentAncillaries = getAncillariesForSegment(
          currentSegment.segmentKey,
          type
        );

        if (currentAncillaries.length === 0) return null;

        return (
          <div key={type} className="px-3 pb-3 mt-3">
            <CollapsibleCard
              open={openStates[type] || false}
              onToggle={() => toggleType(type)}
              icon={getIconForType(type)}
              title={formatTypeName(type)}
              subtitle={getSubtitleForType(type)}
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

              {/* Current segment services */}
              <div className="mb-2 text-[15px] font-semibold text-[#0A0C0F]">
                {currentSegment.journeyType} flight
                {currentSegment.isMultiStop &&
                  ` (Stop ${currentSegment.stopNumber})`}
              </div>

              <div className="space-y-3">
                {currentAncillaries.map((ancillary: any) => {
                  const ancillaryId = ancillary.ancillary.ancillaryOfferId;
                  const isSelected = isAncillarySelected(ancillaryId);
                  const price = ancillary.fare[0]?.sellingAmount || 0;
                  const currency = ancillary.fare[0]?.sellingCurrency || "AED";

                  return (
                    <CardFeaturingRow
                      key={ancillaryId}
                      airline={{
                        logo: `/airlines/${currentSegment.marketingAirline}.png`,
                        name: getMarketingAirlineDisplayName(currentSegment),
                        flight: `${currentSegment.flightNumber} – ${currentSegment.cabinClass}`,
                      }}
                      blocks={[
                        {
                          label: "Description",
                          value: ancillary.ancillary.ancillaryDescription, // Empty value since we're using label as the description
                        },
                        {
                          label: "Upgrade cost",
                          value: (
                            <span className="font-bold text-[15px]">
                              {currency} {price.toFixed(2)}
                            </span>
                          ),
                        },
                        {
                          label: "Added to purchase",
                          value: isSelected ? (
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
                          checked={isSelected}
                          onChange={() => toggleAncillary(ancillaryId)}
                        />
                      }
                      className="gap-10 enhance-baggage-grid"
                    />
                  );
                })}
              </div>

              {/* Confirm button - show only on last segment for this type */}
              {/* {currentSegmentIndex === allSegments.length - 1 &&
                typeIndex === ancillaryTypes.length - 1 && (
                  <>
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={handleConfirmSelection}
                        className="px-12 rounded-xl bg-[#2351A3] py-3 text-[16px] font-semibold text-[#F2F2F3] hover:brightness-95 active:brightness-90"
                      >
                        Confirm selection
                      </button>
                    </div>
                  </>
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
      })}
    </>
  );
}
