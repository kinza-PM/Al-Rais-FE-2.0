import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ShareTicketModal from "../atoms/ShareTicketModal";
import {
  useAddHotelFavourite,
  useGetHotelFavourites,
} from "../../hooks/useHotelSearch";
import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";
import { useHotelStore } from "../../store/UseHotelStore";
import TailwindCustomInput from "../common/TailwindCustomInput";
import SearchableDropdown from "../common/SearchableDropdown";
import type { DropdownOption } from "../common/SearchableDropdown";
import HotelListCard from "./HotelListCard";
import Loader from "../atoms/Loader";

type ParsedPropertyInfo = {
  providerHotelId?: string;
  hotelName?: string;
  address?: string;
  phoneNumber?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  imageUrl?: string;
  facilities?: string[];
  propertyType?: string;
  starRating?: string;
};
type ParsedRoomRate = {
  currency?: string;
  netAmount?: number;
  rates?: Array<{
    name?: string;
    amount?: number;
    from?: string;
    rateIndex?: string;
    to?: string;
  }>;
  taxes?: Array<{ name?: string; amount?: number; included?: boolean }>;
};
type ParsedRatePlan = {
  supplierCode?: string;
  meal?: string;
  availableStatus?: string;
  cancelPolicyIndicator?: string;
  code?: string;
  isPackage?: boolean;
  fixedCombo?: boolean;
  gstAssured?: boolean;
  lastCancellationDate?: string;
};
type ParsedRoomDetails = {
  roomIndex?: number;
  roomKey?: string;
  roomId?: string;
  roomTypeName?: string;
  roomTypeDesc?: string;
  maxOccupancy?: number;
  roomFacilities?: string[];
  ratePlan?: ParsedRatePlan;
  roomRate?: ParsedRoomRate;
  rateNotes?: string;
  financialInfo?: { tmc?: string; supplier?: string };
  isAllPaxInfoMandatory?: boolean;
};
type FavouriteApiItem = {
  searchKey?: string;
  propertyInfo?: string | ParsedPropertyInfo;
  roomDetails?: string | ParsedRoomDetails[];
  hotelKey?: string;
  totalPrice?: string | number;
};

const safeJsonParse = <T,>(value: unknown, fallback: T): T => {
  if (!value) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const buildHotelShareUrl = (
  hotelKey: string,
  searchKey: string,
  bookingParams?: object | null,
) => {
  const params = new URLSearchParams();
  if (searchKey) params.set("searchKey", searchKey);
  if (bookingParams) params.set("bookingParams", JSON.stringify(bookingParams));
  const qs = params.toString();
  return `${window.location.origin}/hotel-detail/${hotelKey}${qs ? `?${qs}` : ""}`;
};

const ProfileFavouriteHotels: React.FC = () => {
  const navigate = useNavigate();
  const { hotel: bookingParams } = useHotelStore();
  const [searchText, setSearchText] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [openShareModal, setOpenShareModal] = useState(false);
  const [selectedShareHotel, setSelectedShareHotel] = useState<any>(null);

  const {
    data,
    isLoading,
    isFetching: isFetchingFavourites,
    isError,
    error,
    refetch: refetchFavourites,
  } = useGetHotelFavourites(true, selectedCity === "All" ? "" : selectedCity);
  const {
    mutateAsync: addHotelFavouriteAsync,
    isPending: isUpdatingFavourite,
  } = useAddHotelFavourite();

  const favouritesByCity = useMemo<Record<string, FavouriteApiItem[]>>(() => {
    const payload = (data as any)?.data ?? data;

    if (Array.isArray(payload)) {
      return { undefined: payload as FavouriteApiItem[] };
    }

    if (payload && typeof payload === "object") {
      return Object.entries(payload).reduce(
        (acc, [cityKey, items]) => {
          acc[cityKey] = Array.isArray(items) ? (items as FavouriteApiItem[]) : [];
          return acc;
        },
        {} as Record<string, FavouriteApiItem[]>,
      );
    }

    return {};
  }, [data]);

  const cityOptions = useMemo<DropdownOption[]>(() => {
    const cityKeys = Object.entries(favouritesByCity)
      .filter(
        ([key, items]) =>
          key &&
          key !== "undefined" &&
          Array.isArray(items) &&
          items.length > 0,
      )
      .map(([key]) => key);
      console.log(favouritesByCity);
    return [
      { id: "all", value: "All", label: "All" },
      ...cityKeys.map((city) => ({ id: city, value: city, label: city })),
    ];
  }, [favouritesByCity]);

  useEffect(() => {
    if (selectedCity === "All") return;
    const hasSelectedCity = cityOptions.some((option) => option.value === selectedCity);
    if (!hasSelectedCity) {
      setSelectedCity("All");
    }
  }, [selectedCity, cityOptions]);

  const favourites = useMemo(() => {
    return Object.entries(favouritesByCity).flatMap(([cityKey, items]) =>
      items.map((item: FavouriteApiItem) => {
        const normalizedCity = cityKey === "undefined" ? "" : cityKey;
        return {
          ...item,
          city: (item as any)?.city || normalizedCity,
        };
      }),
    );
  }, [favouritesByCity]);

  const parsedFavourites = useMemo(() => {
    return favourites.map((item: FavouriteApiItem & { city?: string }) => {
      const propertyInfo = safeJsonParse<ParsedPropertyInfo>(
        item.propertyInfo,
        {},
      );
      const roomDetails = safeJsonParse<ParsedRoomDetails[]>(
        item.roomDetails,
        [],
      );
      return {
        ...item,
        propertyInfoParsed: propertyInfo,
        roomDetailsParsed: roomDetails,
        totalPriceParsed:
          typeof item.totalPrice === "number"
            ? item.totalPrice
            : Number(item.totalPrice || 0),
      };
    });
  }, [favourites]);

  const normalizedHotels = useMemo(
    () =>
      parsedFavourites.map((item: any) => ({
        ...item,
        propertyInfo: item.propertyInfoParsed || {},
        rooms: item.roomDetailsParsed || [],
        totalPrice: Number(item.totalPriceParsed || 0),
        searchKey: item.searchKey || "",
        city: item.city || "",
      })),
    [parsedFavourites],
  );

  const filteredHotels = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return normalizedHotels.filter((hotel: any) => {
      const name = (hotel?.propertyInfo?.hotelName || "").toLowerCase();
      const city = (hotel?.city || "").trim();
      return (
        (!q || name.includes(q)) &&
        (selectedCity === "All" || city === selectedCity)
      );
    });
  }, [normalizedHotels, searchText, selectedCity]);
  
  const handleShareClick = useCallback((hotel: any) => {
    setSelectedShareHotel(hotel);
    setOpenShareModal(true);
  }, []);

  const buildFavouritePayload = useCallback((hotel: any, flag: boolean) => {
    const propertyInfo: ParsedPropertyInfo = hotel?.propertyInfoParsed || {};
    const roomDetails: ParsedRoomDetails[] = hotel?.roomDetailsParsed || [];
    const rooms = roomDetails.map((room: ParsedRoomDetails) => ({
      roomIndex: room?.roomIndex ?? 1,
      roomKey: room?.roomKey ?? "",
      roomId: room?.roomId ?? "",
      roomTypeName: room?.roomTypeName ?? "",
      roomTypeDesc: room?.roomTypeDesc ?? room?.roomTypeName ?? "",
      maxOccupancy: room?.maxOccupancy ?? -1,
      roomFacilities: room?.roomFacilities ?? [],
      ratePlan: {
        supplierCode: room?.ratePlan?.supplierCode ?? "",
        meal: room?.ratePlan?.meal ?? "",
        availableStatus: room?.ratePlan?.availableStatus ?? "",
        cancelPolicyIndicator: room?.ratePlan?.cancelPolicyIndicator ?? "",
        code: room?.ratePlan?.code ?? "",
        isPackage: room?.ratePlan?.isPackage ?? false,
        fixedCombo: room?.ratePlan?.fixedCombo ?? false,
        gstAssured: room?.ratePlan?.gstAssured ?? false,
        lastCancellationDate: room?.ratePlan?.lastCancellationDate ?? "",
      },
      roomRate: {
        currency: room?.roomRate?.currency ?? "AED",
        netAmount: room?.roomRate?.netAmount ?? 0,
        rates: (room?.roomRate?.rates ?? []).map((rate) => ({
          name: rate?.name ?? "",
          amount: rate?.amount ?? 0,
          from: rate?.from ?? "",
          rateIndex: rate?.rateIndex ?? "",
          to: rate?.to ?? "",
        })),
        taxes: (room?.roomRate?.taxes ?? []).map((tax: any) => ({
          name: tax?.name ?? "",
          amount: tax?.amount ?? 0,
          included: tax?.included ?? false,
        })),
      },
      rateNotes: room?.rateNotes ?? "",
      financialInfo: {
        tmc: room?.financialInfo?.tmc ?? "",
        supplier: room?.financialInfo?.supplier ?? "",
      },
      isAllPaxInfoMandatory: room?.isAllPaxInfoMandatory ?? false,
    }));

    return {
      hotelKey: hotel?.hotelKey ?? "",
      propertyInfo: {
        providerHotelId: propertyInfo?.providerHotelId?.toString() ?? "",
        hotelName: propertyInfo?.hotelName ?? "",
        address: propertyInfo?.address ?? "",
        phoneNumber: propertyInfo?.phoneNumber ?? "",
        location: propertyInfo?.location ?? "",
        latitude: propertyInfo?.latitude?.toString() ?? "",
        longitude: propertyInfo?.longitude?.toString() ?? "",
        imageUrl: propertyInfo?.imageUrl ?? "",
        facilities: propertyInfo?.facilities ?? [],
        propertyType: propertyInfo?.propertyType ?? "",
        starRating: propertyInfo?.starRating?.toString() ?? "",
      },
      rooms,
      totalPrice: Number(hotel?.totalPriceParsed || 0),
      searchKey: hotel?.searchKey ?? "",
      city: hotel?.city || propertyInfo?.location || "",
      flag,
    };
  }, []);

  const handleRemoveFavourite = useCallback(
    async (hotel: any) => {
      if (!hotel?.hotelKey) return;
      try {
        await addHotelFavouriteAsync(buildFavouritePayload(hotel, false));
        toast.success("Hotel removed from favourites");
        await refetchFavourites();
      } catch (err) {
        toast.error(
          extractErrorFromAxiosApiError(err) || "Failed to remove favourite",
        );
      }
    },
    [addHotelFavouriteAsync, buildFavouritePayload, refetchFavourites],
  );

  const handleCheckAvailability = useCallback(
    (hotel: any) => {
      if (!hotel?.hotelKey) return toast.error("Hotel Id not found");
      if (!hotel?.searchKey)
        return toast.error(
          "Search session expired. Please search hotels again.",
        );
      const detailUrl = buildHotelShareUrl(
        hotel.hotelKey,
        hotel.searchKey,
        bookingParams ?? null,
      );
      const url = new URL(detailUrl);
      navigate(`${url.pathname}${url.search}`, {
        state: {
          searchKey: hotel?.searchKey ?? "",
          bookingParams: bookingParams ?? undefined,
        },
      });
    },
    [bookingParams, navigate],
  );

  if (isLoading)
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <p className="text-sm text-[#3D495C]">Loading favourite hotels...</p>
      </div>
    );
  if (isError)
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <p className="text-sm text-[#EA0029]">
          {(error as any)?.message || "Failed to load favourite hotels."}
        </p>
      </div>
    );
  return (
    <>
      <Loader
        show={isUpdatingFavourite || (!isLoading && isFetchingFavourites)}
        label={isUpdatingFavourite ? "Updating favourites..." : "Loading favourites..."}
      />

      <div className="mx-auto w-full max-w-[1368px]">
        <div className="mb-16 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="w-full md:max-w-[400px]">
            <TailwindCustomInput
              label="Search"
              placeholder="Search in your favorites"
              value={searchText}
              className="h-[50px] w-full rounded-[16px] border-[1.5px] border-[#C2CAD6] bg-[#FFFFFF] px-3 text-sm placeholder:text-[#C2CAD6] text-[#0A0C0F] focus:outline-none focus:border-[#5383DA] focus:ring-2 focus:ring-[#5383DA]/20"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="w-full md:max-w-[220px]">
            <SearchableDropdown
              label="Cities"
              options={cityOptions}
              value={selectedCity}
              onChange={setSelectedCity}
              placeholder="Select city"
            />
          </div>
        </div>

        <div className="px-16">
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel: any, index: number) => (
              <HotelListCard
                key={`${hotel.hotelKey}-${index}`}
                hotel={hotel}
                isFavourite
                isAddFavouritePending={isUpdatingFavourite}
                onToggleFavourite={handleRemoveFavourite}
                onShare={handleShareClick}
                onCheckAvailability={handleCheckAvailability}
              />
            ))
          ) : (
            <div className="w-full py-14 flex flex-col items-center justify-center text-center">
              <p className="text-base font-semibold text-[#0A0C0F]">
                {normalizedHotels.length === 0
                  ? "No favourite hotels found"
                  : "No hotels match your filters"}
              </p>
              <p className="mt-2 text-sm text-[#3D495C]">
                {normalizedHotels.length === 0
                  ? "Hotels you add to favourites will appear here."
                  : "Try changing hotel name search or city selection."}
              </p>
            </div>
          )}
        </div>
      </div>

      {openShareModal && selectedShareHotel && (
        <ShareTicketModal
          closeModal={() => {
            setOpenShareModal(false);
            setSelectedShareHotel(null);
          }}
          mode="hotel"
          showPrint={false}
          shareUrl={buildHotelShareUrl(
            selectedShareHotel?.hotelKey ?? "",
            selectedShareHotel?.searchKey ?? "",
            bookingParams ?? null,
          )}
          title="Share this Hotel"
          description="Send this hotel to family and friends. Share the property details and location instantly."
          cardTitle={
            selectedShareHotel?.propertyInfo?.hotelName || "Hotel details"
          }
          cardSubtitle={[
            selectedShareHotel?.propertyInfo?.address,
            selectedShareHotel?.propertyInfo?.location,
          ]
            .filter(Boolean)
            .join(", ")}
          passengerName={
            selectedShareHotel?.propertyInfo?.hotelName || "Hotel details"
          }
        />
      )}
    </>
  );
};

export default ProfileFavouriteHotels;
