import { useState, useMemo, useEffect } from "react";
import CollapsibleCard from "./CollapsibleCard";
import MealQuantityStepper from "./MealQuantityStepper";
import type { SegmentSummary } from "../../utils/flightBookingHelper";
import { useAncillaryStore } from "../../store/useAncillaryStore";

type FlightBookingMealSectionProps = {
  open: boolean;
  onToggleOpen: () => void;
  flightPassengers: Array<any>;
  flightAncillarySearch?: any;
  flightJourneys: Array<{ flightSegments: SegmentSummary[] }>;
};

type SelectionState = Record<
  string,
  Record<string, Record<string, Record<string, number>>>
>;

export default function FlightBookingMealsSection({
  open,
  onToggleOpen,
  flightPassengers,
  flightAncillarySearch,
  flightJourneys,
}: FlightBookingMealSectionProps) {
  const { setMealSelections, mealSelections } = useAncillaryStore();
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

  // Store selections: { segmentKey: { passengerKey: { [category]: { itemId: quantity } } } }
  const [selections, setSelections] = useState<SelectionState>({});

  // Get items grouped by category for current segment
  const getItemsForSegment = (segmentKey: string) => {
    if (!flightAncillarySearch?.meals) return {};

    const categorizedItems: Record<string, any[]> = {};

    flightAncillarySearch.meals.forEach((item: any) => {
      const mapping = item.segmentPassengerMapping;
      if (mapping?.segmentKeys?.includes(segmentKey)) {
        const category = item.ancillary.type || "Other";

        if (!categorizedItems[category]) {
          categorizedItems[category] = [];
        }
        categorizedItems[category].push(item);
      }
    });

    return categorizedItems;
  };

  const categorizedItems = getItemsForSegment(currentSegment?.segmentKey || "");
  const categories = Object.keys(categorizedItems);

  // Helper functions
  const getCurrentPassengerSelections = () => {
    const segmentKey = currentSegment.segmentKey;
    const passengerKey = eligiblePassengers[activePassengerIndex]?.passengerKey;
    return selections[segmentKey]?.[passengerKey] || {};
  };

  const isChecked = (category: string, itemId: string) => {
    const current = getCurrentPassengerSelections();
    return ((current[category] || {})[itemId] || 0) > 0;
  };

  const toggleItem = (category: string, itemId: string) => {
    const segmentKey = currentSegment.segmentKey;
    const passengerKey = eligiblePassengers[activePassengerIndex]?.passengerKey;

    setSelections((prev) => {
      const segmentSelections = { ...(prev[segmentKey] || {}) };
      const passengerSelections = {
        ...(segmentSelections[passengerKey] || {}),
      };
      const categorySelections = { ...(passengerSelections[category] || {}) };

      if (categorySelections[itemId]) {
        delete categorySelections[itemId];
      } else {
        // NEW: Clear all other items in this category first
        // Then set only this item to 1
        passengerSelections[category] = { [itemId]: 1 };
        segmentSelections[passengerKey] = passengerSelections;

        return {
          ...prev,
          [segmentKey]: segmentSelections,
        };
      }

      passengerSelections[category] = categorySelections;
      segmentSelections[passengerKey] = passengerSelections;

      return {
        ...prev,
        [segmentKey]: segmentSelections,
      };
    });
  };

  const getRemainingInventory = (
    segmentKey: string,
    itemId: string,
    maxQuantity: number
  ) => {
    const segmentSelections = selections[segmentKey] || {};
    let totalUsed = 0;

    // Sum up all quantities used by all passengers for this item
    Object.values(segmentSelections).forEach((passengerSelections) => {
      Object.values(passengerSelections).forEach((categoryItems) => {
        totalUsed += categoryItems[itemId] || 0;
      });
    });

    return maxQuantity - totalUsed;
  };

  const changeQty = (category: string, itemId: string, delta: number) => {
    const segmentKey = currentSegment.segmentKey;
    const passengerKey = eligiblePassengers[activePassengerIndex]?.passengerKey;

    const item = categorizedItems[category]?.find(
      (item: any) => item.ancillary.ancillaryOfferId === itemId
    );
    const maxQuantity = item?.ancillary?.quantity || 0;

    setSelections((prev: SelectionState) => {
      const segmentSelections = { ...(prev[segmentKey] || {}) };
      const passengerSelections = {
        ...(segmentSelections[passengerKey] || {}),
      };
      const categorySelections = { ...(passengerSelections[category] || {}) };

      const currentQty = categorySelections[itemId] || 0;
      const newQty = currentQty + delta;

      // NEW: Don't allow quantity more than 1
      if (newQty > 1) {
        return prev;
      }

      const remaining = getRemainingInventory(segmentKey, itemId, maxQuantity);
      const maxAllowed = remaining + currentQty;

      if (newQty > maxAllowed) {
        return prev;
      }

      if (newQty <= 0) {
        delete categorySelections[itemId];
      } else {
        categorySelections[itemId] = newQty;
      }

      passengerSelections[category] = categorySelections;
      segmentSelections[passengerKey] = passengerSelections;

      return {
        ...prev,
        [segmentKey]: segmentSelections,
      };
    });
  };

  // const changeQty = (category: string, itemId: string, delta: number) => {
  //   const segmentKey = currentSegment.segmentKey;
  //   const passengerKey = eligiblePassengers[activePassengerIndex]?.passengerKey;

  //   // Find the item to get max quantity
  //   const item = categorizedItems[category]?.find(
  //     (item: any) => item.ancillary.ancillaryOfferId === itemId
  //   );
  //   const maxQuantity = item?.ancillary?.quantity || 0;

  //   setSelections((prev: SelectionState) => {
  //     const segmentSelections = { ...(prev[segmentKey] || {}) };
  //     const passengerSelections = {
  //       ...(segmentSelections[passengerKey] || {}),
  //     };
  //     const categorySelections = { ...(passengerSelections[category] || {}) };

  //     const currentQty = categorySelections[itemId] || 0;
  //     const newQty = currentQty + delta;

  //     // Don't allow quantity to exceed max available
  //     if (newQty > maxQuantity) {
  //       console.log(`Cannot exceed maximum quantity of ${maxQuantity}`);
  //       return prev; // Return previous state without changes
  //     }

  //     if (newQty <= 0) {
  //       delete categorySelections[itemId];
  //     } else {
  //       categorySelections[itemId] = newQty;
  //     }

  //     passengerSelections[category] = categorySelections;
  //     segmentSelections[passengerKey] = passengerSelections;

  //     return {
  //       ...prev,
  //       [segmentKey]: segmentSelections,
  //     };
  //   });
  // };

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

  // const getSelectedMealsSummary = () => {
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
  //     selectedItems: Array<{
  //       passengerKey: string;
  //       ptc: string;
  //       category: string;
  //       items: Array<{
  //         ancillaryOfferId: string;
  //         ancillaryCode: string;
  //         ancillaryDescription: string;
  //         quantity: number;
  //         price: {
  //           buyingCurrency: string;
  //           buyingAmount: number;
  //           sellingCurrency: string;
  //           sellingAmount: number;
  //         };
  //         totalPrice: {
  //           currency: string;
  //           amount: number;
  //         };
  //       }>;
  //       passengerTotal: {
  //         currency: string;
  //         amount: number;
  //       };
  //     }>;
  //     totalAmount: {
  //       currency: string;
  //       amount: number;
  //     };
  //   }> = [];

  //   let grandTotal = 0;
  //   let totalCurrency = "AED"; // fallback – will be overwritten by first item

  //   allSegments.forEach((segment) => {
  //     const segmentSelections = selections[segment.segmentKey] || {};
  //     const selectedItemsForSegment: (typeof result)[0]["selectedItems"] = [];
  //     let segmentTotal = 0;

  //     Object.entries(segmentSelections).forEach(
  //       ([passengerKey, categorySelections]) => {
  //         const passenger = flightPassengers.find(
  //           (p) => p.passengerKey === passengerKey
  //         );
  //         if (!passenger) return;

  //         let passengerTotal = 0;
  //         const passengerItems: (typeof result)[0]["selectedItems"][0]["items"] =
  //           [];

  //         Object.entries(categorySelections).forEach(([_, items]) => {
  //           // Object.entries(categorySelections).forEach(([category, items]) => {
  //           Object.entries(items).forEach(([itemId, quantity]) => {
  //             // Find the actual item data
  //             const itemData = flightAncillarySearch?.meals?.find(
  //               (meal: any) => meal.ancillary.ancillaryOfferId === itemId
  //             );

  //             if (!itemData) return;

  //             const fareObj = itemData.fare?.[0] || {
  //               buyingCurrency: "AED",
  //               buyingAmount: 0,
  //               sellingCurrency: "AED",
  //               sellingAmount: 0,
  //             };

  //             // Use selling amount as the price shown to customer
  //             const pricePerUnit = fareObj.sellingAmount;
  //             const totalItemPrice = pricePerUnit * quantity;

  //             passengerTotal += totalItemPrice;
  //             segmentTotal += totalItemPrice;
  //             grandTotal += totalItemPrice;
  //             totalCurrency = fareObj.sellingCurrency;

  //             passengerItems.push({
  //               ancillaryOfferId: itemData.ancillary.ancillaryOfferId,
  //               ancillaryCode: itemData.ancillary.ancillaryCode,
  //               ancillaryDescription: itemData.ancillary.ancillaryDescription,
  //               quantity: quantity,
  //               price: {
  //                 buyingCurrency: fareObj.buyingCurrency,
  //                 buyingAmount: fareObj.buyingAmount,
  //                 sellingCurrency: fareObj.sellingCurrency,
  //                 sellingAmount: fareObj.sellingAmount,
  //               },
  //               totalPrice: {
  //                 currency: fareObj.sellingCurrency,
  //                 amount: totalItemPrice,
  //               },
  //             });
  //           });
  //         });

  //         if (passengerItems.length > 0) {
  //           // Group items by category for better organization
  //           const itemsByCategory: Record<string, typeof passengerItems> = {};
  //           passengerItems.forEach((item) => {
  //             const itemFullData = flightAncillarySearch?.meals?.find(
  //               (meal: any) =>
  //                 meal.ancillary.ancillaryOfferId === item.ancillaryOfferId
  //             );
  //             const category = itemFullData?.ancillary?.type || "Other";

  //             if (!itemsByCategory[category]) {
  //               itemsByCategory[category] = [];
  //             }
  //             itemsByCategory[category].push(item);
  //           });

  //           // Create separate entries for each category
  //           Object.entries(itemsByCategory).forEach(
  //             ([category, categoryItems]) => {
  //               const categoryTotal = categoryItems.reduce(
  //                 (sum, item) => sum + item.totalPrice.amount,
  //                 0
  //               );

  //               selectedItemsForSegment.push({
  //                 passengerKey,
  //                 ptc: passenger.ptc,
  //                 category,
  //                 items: categoryItems,
  //                 passengerTotal: {
  //                   currency: totalCurrency,
  //                   amount: categoryTotal,
  //                 },
  //               });
  //             }
  //           );
  //         }
  //       }
  //     );

  //     if (selectedItemsForSegment.length > 0) {
  //       result.push({
  //         segmentKey: segment.segmentKey,
  //         journeyType: segment.journeyType,
  //         segmentInfo: segment,
  //         selectedItems: selectedItemsForSegment,
  //         totalAmount: {
  //           currency: totalCurrency,
  //           amount: segmentTotal,
  //         },
  //       });
  //     }
  //   });

  //   // Add grand total across all segments
  //   return {
  //     segments: result,
  //     grandTotal: {
  //       currency: totalCurrency,
  //       amount: grandTotal,
  //     },
  //   };
  // };

  // const handleConfirmSelection = () => {
  //   const summary = getSelectedMealsSummary();
  //   console.log("FINAL MEALS & DRINKS SUMMARY →", summary);
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

  const RoundCheck = ({ checked }: { checked: boolean }) => (
    <span
      className={`relative inline-flex h-[18px] w-[18px] items-center justify-center rounded-lg border ${
        checked ? "bg-[#2351A3] border-[#2351A3]" : "border-[#A7C0EC] bg-white"
      }`}
    >
      {checked && (
        <svg
          width="10"
          height="8"
          viewBox="0 0 13 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.354 0.853784L4.35403 8.85378C4.30759 8.90027 4.25245 8.93715 4.19175 8.96231C4.13105 8.98748 4.06599 9.00043 4.00028 9.00043C3.93457 9.00043 3.86951 8.98748 3.80881 8.96231C3.74811 8.93715 3.69296 8.90027 3.64653 8.85378L0.146528 5.35378C0.0527077 5.25996 0 5.13272 0 5.00003C0 4.86735 0.0527077 4.7401 0.146528 4.64628C0.240348 4.55246 0.367596 4.49976 0.500278 4.49976C0.63296 4.49976 0.760208 4.55246 0.854028 4.64628L4.00028 7.79316L11.6465 0.146284C11.7403 0.0524633 11.8676 -0.000244142 12.0003 -0.000244141C12.133 -0.00024414 12.2602 0.0524633 12.354 0.146284C12.4478 0.240104 12.5006 0.367352 12.5006 0.500034C12.5006 0.632716 12.4478 0.759964 12.354 0.853784Z"
            fill="white"
          />
        </svg>
      )}
    </span>
  );

  if (!currentSegment) {
    return null;
  }

  // useEffect(() => {
  //   setMealSelections(selections);
  // }, [selections, setMealSelections]);

  // useEffect(() => {
  //   if (
  //     Object.keys(mealSelections).length === 0 &&
  //     Object.keys(selections).length > 0
  //   ) {
  //     setSelections({});
  //     setCurrentSegmentIndex(0);
  //     setActivePassengerIndex(0);
  //   } else if (
  //     Object.keys(mealSelections).length > 0 &&
  //     Object.keys(selections).length === 0
  //   ) {
  //     setSelections(mealSelections);
  //   }
  // }, [mealSelections]);

  useEffect(() => {
    const localBaggageJSON = JSON.stringify(selections);
    const storeBaggageJSON = JSON.stringify(mealSelections);

    if (localBaggageJSON !== storeBaggageJSON) {
      setMealSelections(selections);
    }
  }, [selections]);

  useEffect(() => {
    if (
      Object.keys(mealSelections).length === 0 &&
      Object.keys(selections).length > 0
    ) {
      setSelections({});
      setCurrentSegmentIndex(0);
      setActivePassengerIndex(0);
    }
  }, [mealSelections]);

  return (
    <div className="px-3 pb-3 mt-3">
      <CollapsibleCard
        open={open}
        onToggle={onToggleOpen}
        icon={
          <svg
            width="26"
            height="25"
            viewBox="0 0 26 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M25 9.99992H23.9538C23.7025 7.26851 22.4398 4.72952 20.4134 2.88094C18.3869 1.03236 15.7429 0.00756836 13 0.00756836C10.2571 0.00756836 7.61308 1.03236 5.58664 2.88094C3.5602 4.72952 2.29752 7.26851 2.04625 9.99992H1C0.734784 9.99992 0.48043 10.1053 0.292893 10.2928C0.105357 10.4803 0 10.7347 0 10.9999C0.00439376 13.3781 0.658866 15.7098 1.89264 17.7428C3.12641 19.7759 4.89253 21.433 7 22.5349V22.9999C7 23.5304 7.21071 24.0391 7.58579 24.4141C7.96086 24.7892 8.46957 24.9999 9 24.9999H17C17.5304 24.9999 18.0391 24.7892 18.4142 24.4141C18.7893 24.0391 19 23.5304 19 22.9999V22.5349C21.1075 21.433 22.8736 19.7759 24.1074 17.7428C25.3411 15.7098 25.9956 13.3781 26 10.9999C26 10.7347 25.8946 10.4803 25.7071 10.2928C25.5196 10.1053 25.2652 9.99992 25 9.99992ZM21.9425 9.99992H15.515C16.7274 8.18102 18.5616 6.86681 20.6737 6.30367C21.3643 7.42698 21.7976 8.68928 21.9425 9.99992ZM18.685 4.02867C18.9142 4.21617 19.1338 4.41408 19.3438 4.62242C16.6817 5.55886 14.4819 7.48342 13.2 9.99742H9.5125C10.1375 8.24545 11.2882 6.72917 12.8073 5.65572C14.3264 4.58227 16.1399 4.004 18 3.99992C18.2288 3.99992 18.4575 4.01117 18.685 4.02867ZM13 1.99992C13.8025 2.00045 14.6012 2.10849 15.375 2.32117C13.4905 2.78863 11.7626 3.74459 10.3653 5.09269C8.96809 6.44079 7.95088 8.1334 7.41625 9.99992H4.0575C4.30556 7.80099 5.35415 5.77025 7.00338 4.29484C8.65262 2.81944 10.7871 2.00255 13 1.99992ZM17.5825 20.9999C17.4081 21.0801 17.2604 21.2087 17.1571 21.3705C17.0538 21.5323 16.9993 21.7205 17 21.9124V22.9999H9V21.9124C9.00073 21.7205 8.9462 21.5323 8.84291 21.3705C8.73962 21.2087 8.59194 21.0801 8.4175 20.9999C6.6589 20.1907 5.1441 18.9331 4.02513 17.3534C2.90617 15.7737 2.22242 13.9274 2.0425 11.9999H23.9538C23.7742 13.927 23.091 15.773 21.9727 17.3527C20.8544 18.9323 19.3404 20.1902 17.5825 20.9999Z"
              fill="#1A3C7A"
            />
          </svg>
        }
        title="Meals & Drinks"
        subtitle="Choose from a selection of hot meals and cold drinks served during your flight."
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

        {/* Check if items available for current segment */}
        {categories.length === 0 ? (
          <div className="text-center py-8 text-[#3D495C] font-semibold">
            No meals or drinks available for this segment
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {categories.map((category) => (
              <div key={category}>
                <div className="mb-3 text-[16px] font-semibold text-[#0A0C0F]">
                  {category}
                </div>
                <ul>
                  {categorizedItems[category].map((item) => {
                    const itemId = item.ancillary.ancillaryOfferId;
                    const checked = isChecked(category, itemId);
                    const qty =
                      (getCurrentPassengerSelections()[category] || {})[
                        itemId
                      ] || 0;
                    const price = item.fare[0]?.sellingAmount || 0;
                    const currency = item.fare[0]?.sellingCurrency || "AED";
                    const maxQuantity = item.ancillary.quantity || 0; // Get max quantity

                    return (
                      <li
                        key={itemId}
                        className="flex items-center justify-between py-2"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(category, itemId)}
                          className="group flex items-start gap-3"
                        >
                          <RoundCheck checked={checked} />
                          <div className="text-left">
                            <div className="text-[14px] text-[#0A0C0F] font-medium">
                              {item.ancillary.ancillaryDescription}
                            </div>
                            <div className="text-[12px] text-[#3D495C]">
                              {currency} {price.toFixed(2)} •{" "}
                              {getRemainingInventory(
                                currentSegment.segmentKey,
                                itemId,
                                maxQuantity
                              )}{" "}
                              available
                            </div>
                            {/* <div className="text-[12px] text-[#3D495C]">
                              {currency} {price.toFixed(2)} • {maxQuantity}{" "}
                              available
                            </div> */}
                          </div>
                        </button>

                        <MealQuantityStepper
                          qty={qty}
                          onInc={() => changeQty(category, itemId, 1)}
                          onDec={() => changeQty(category, itemId, -1)}
                          maxQty={1} // Pass max quantity if your component supports it
                          // maxQty={maxQuantity} // Pass max quantity if your component supports it
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
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
