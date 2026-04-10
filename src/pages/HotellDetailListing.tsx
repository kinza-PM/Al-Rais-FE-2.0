import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import FilledStar from "../assets/svgs/filled_star.svg";
import HotelImage from "../assets/images/Hotel Image.png";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../components";
import HotelDetailOverviewSection from "../components/molecules/HotelDetailOverviewSection";
import HotelDetailAmenetiesSection from "../components/molecules/HotelDetailAmenetiesSection";
import HotelImages from "../components/molecules/HotelImages";
import HotelDetailRoomSection from "../components/molecules/HotelDetailRoomSection";
import ShareTicketModal from "../components/atoms/ShareTicketModal";
import {
  useHotelSearch,
  useHotelDetail,
  useHotelGetMoreRooms,
  useAddHotelFavourite,
  useGetHotelFavourites,
} from "../hooks/useHotelSearch";
import { useHotelStore } from "../store/UseHotelStore";
import type { HotelSearchRequest } from "../services/api/hotelSearch";
import Loader from "../components/atoms/Loader";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";
import {
  convertPaxToRooms,
  normalizeHotelBookingParams,
  safeParseHotelBookingParams,
  serializeHotelBookingParams,
  type HotelBookingParams,
} from "../utils/hotelBookingParams";
import toast from "react-hot-toast";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  HOTEL_LEAFLET_TILE_ATTRIBUTION_ESRI,
  HOTEL_LEAFLET_TILE_URL_ESRI_WORLD_STREET,
} from "../constants/hotelMapTiles";

const tabItems = [
  { label: "Overview", value: "Overview" },
  { label: "Rooms", value: "Rooms" },
  { label: "Amenities", value: "Amenities" },
] as const;

type HotelDetailTab = (typeof tabItems)[number]["value"];

type LocationState = {
  searchKey?: string;
  bookingParams?: HotelBookingParams;
};

const buildHotelShareUrl = (
  hotelKey: string,
  searchKey: string,
  bookingParams?: object | null
) => {
  const params = new URLSearchParams();

  if (searchKey) {
    params.set("searchKey", searchKey);
  }

  if (bookingParams) {
    params.set("bookingParams", serializeHotelBookingParams(bookingParams));
  }

  const queryString = params.toString();

  return `${window.location.origin}/hotel-detail/${hotelKey}${
    queryString ? `?${queryString}` : ""
  }`;
};

const defaultMarkerIconUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png";

const shadowUrl =
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png";

const escapeHtml = (value: string = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const createHotelMarkerIcon = (label: string) =>
  L.divIcon({
    className: "custom-hotel-marker-wrapper",
    html: `
      <div style="position: relative; display: inline-flex; align-items: center;">
        <div style="position: relative; width: 25px; height: 41px; flex-shrink: 0;">
          <img
            src="${defaultMarkerIconUrl}"
            alt="marker"
            style="
              width: 25px;
              height: 41px;
              display: block;
            "
          />
        </div>

        <div
          style="
            margin-left: 8px;
            background: rgba(255,255,255,0.95);
            color: #111827;
            font-size: 12px;
            font-weight: 700;
            line-height: 1.2;
            padding: 6px 10px;
            border-radius: 999px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
            white-space: nowrap;
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            border: 1px solid #E5E7EB;
          "
          title="${escapeHtml(label)}"
        >
          ${escapeHtml(label)}
        </div>
      </div>
    `,
    iconSize: [220, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -34],
    tooltipAnchor: [18, -28],
    shadowUrl,
    shadowSize: [41, 41],
  });

const renderMapStars = (rating: string | number | undefined) => {
  const numRating = rating ? Math.floor(Number(rating)) : 0;
  const totalStars = 5;

  return (
    <div className="flex items-center gap-[3px] mt-1 mb-0">
      {Array.from({ length: numRating }).map((_, i) => (
        <img
          key={`filled-${i}`}
          src={FilledStar}
          alt="filled star"
          className="w-[16px] h-[16px]"
        />
      ))}
      {Array.from({ length: totalStars - numRating }).map((_, i) => (
        <img
          key={`empty-${i}`}
          src={FilledStar}
          alt="empty star"
          className="w-[16px] h-[16px] opacity-25"
        />
      ))}
    </div>
  );
};

const getMarkerPriceLabel = (hotel: any) => {
  const firstRoom = hotel?.rooms?.[0];
  const currency = firstRoom?.roomRate?.currency || "AED";
  const price = Number(hotel?.totalPrice || firstRoom?.roomRate?.netAmount || 0);

  return `${currency} ${price.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const getPreviewData = (hotel: any) => {
  const firstRoom = hotel?.rooms?.[0];
  const price = hotel?.totalPrice || firstRoom?.roomRate?.netAmount || 0;
  const currency = firstRoom?.roomRate?.currency || "AED";
  const roomName = firstRoom?.roomTypeName || "Superior Single Room";
  const meal = firstRoom?.ratePlan?.meal || "";
  const cancellationPolicy = firstRoom?.ratePlan?.cancelPolicyIndicator || "";
  const adults = firstRoom?.maxOccupancy || 2;
  const nights = firstRoom?.roomRate?.rates?.length || 1;

  const taxesAndFees = hotel?.taxesAndFees || 0;
  const reviewScore =
    hotel?.reviewScore || hotel?.propertyInfo?.reviewScore || 7.3;
  const reviewText =
    reviewScore >= 8 ? "Very good" : reviewScore >= 7 ? "Good" : "Average";
  const reviewCount = hotel?.reviewCount || 131;
  const locationScore = hotel?.locationScore || 8.4;
  const beachDistance = hotel?.beachDistance || "600 m from beach";

  return {
    price,
    currency,
    roomName,
    meal,
    cancellationPolicy,
    adults,
    nights,
    taxesAndFees,
    reviewScore,
    reviewText,
    reviewCount,
    locationScore,
    beachDistance,
  };
};

const HotelMapHoverCard = ({ hotel }: { hotel: any }) => {
  const imageUrl = hotel?.propertyInfo?.imageUrl || HotelImage;
  const hotelName = hotel?.propertyInfo?.hotelName || "Hotel";
  const starRating = hotel?.propertyInfo?.starRating || 0;

  const {
    price,
    currency,
    roomName,
    meal,
    cancellationPolicy,
    adults,
    nights,
    taxesAndFees,
    reviewScore,
    reviewText,
    reviewCount,
    locationScore,
    beachDistance,
  } = getPreviewData(hotel);

  return (
    <div
      className="hotel-map-hover-card"
      style={{
        position: "relative",
        background: "#FFFFFF",
        border: "1px solid #D9DEE7",
        borderRadius: "14px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
        width: "100%",
        minWidth: "220px",
        maxWidth: "260px",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={(e) => e.preventDefault()}
        style={{
          position: "absolute",
          top: "6px",
          left: "8px",
          zIndex: 2,
          fontSize: "14px",
          color: "#6B7280",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>

      <div>
        <img
          src={imageUrl}
          alt={hotelName}
          onError={(e) => {
            e.currentTarget.src = HotelImage;
          }}
          style={{
            width: "100%",
            height: "96px",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      <div
        style={{
          padding: "10px 12px 12px",
          minWidth: 0,
        }}
      >
        <h3
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "#0A0C0F",
            margin: 0,
            lineHeight: "16px",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {hotelName}
        </h3>

        <div
          style={{
            fontWeight: 700,
            fontSize: "14px",
            color: "#0A0C0F",
            marginTop: "8px",
            marginBottom: "6px",
            lineHeight: "18px",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
          }}
        >
          {currency} {Number(price).toLocaleString()}
        </div>

        <div className="mb-2">{renderMapStars(starRating)}</div>

        <div
          style={{
            fontSize: "11px",
            color: "#3D495C",
            marginBottom: "3px",
            lineHeight: "15px",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {beachDistance}
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#3D495C",
            marginBottom: "3px",
            lineHeight: "15px",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {reviewScore}
          {reviewText} · {reviewCount} reviews
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#3D495C",
            marginBottom: "6px",
            lineHeight: "15px",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {locationScore} Location
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#0A0C0F",
            marginBottom: "3px",
            lineHeight: "15px",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          <strong>{roomName}:</strong> {adults > 1 ? `${adults} beds` : "1 bed"}
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#3D495C",
            marginBottom: "3px",
            lineHeight: "15px",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {nights} night{nights > 1 ? "s" : ""}, {adults} adult
          {adults > 1 ? "s" : ""}
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "#3D495C",
            marginBottom: "6px",
            lineHeight: "15px",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          +{currency} {Number(taxesAndFees).toLocaleString()} taxes and fees
        </div>

        {meal && (
          <div
            style={{
              fontSize: "11px",
              color: "#3D495C",
              marginBottom: cancellationPolicy ? "3px" : "0",
              lineHeight: "15px",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {meal.toLowerCase().includes("breakfast")
              ? "Breakfast included"
              : meal}
          </div>
        )}

        {cancellationPolicy && (
          <div
            style={{
              fontSize: "11px",
              color: "#3D495C",
              lineHeight: "15px",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {cancellationPolicy.toLowerCase().includes("free")
              ? "Free cancellation"
              : cancellationPolicy}
          </div>
        )}
      </div>
    </div>
  );
};

const MapAutoFix = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    map.setView([lat, lng], map.getZoom(), { animate: false });

    const t1 = setTimeout(() => {
      map.invalidateSize();
      map.setView([lat, lng], map.getZoom(), { animate: false });
    }, 250);

    const t2 = setTimeout(() => {
      map.invalidateSize();
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map, lat, lng]);

  return null;
};

const HotelDetailListing = () => {
  const params = useParams<{ hotelKey?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state || {}) as LocationState;
  const { hotel: hotelSearchState, setHotel: setHotelSearchState } =
    useHotelStore();

  const [openShareModal, setOpenShareModal] = useState(false);
  const [hotelDetail, setHotelDetail] = useState<any>(null);
  const [hotelMoreRooms, setHotelMoreRooms] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<HotelDetailTab>("Overview");
  const [showHotelDetailImages, setShowHotelDetailImages] =
    useState<boolean>(false);
  const [showLocationMap, setShowLocationMap] = useState<boolean>(false);
  const [selectedRooms, setSelectedRooms] = useState<any[]>([]);
  const [resolvedBookingParams, setResolvedBookingParams] = useState<
    HotelBookingParams | undefined
  >(normalizeHotelBookingParams(state.bookingParams));
  const [resolvedSearchKey, setResolvedSearchKey] = useState<string>(
    state.searchKey ?? ""
  );
  const [isFavourite, setIsFavourite] = useState(false);

  const { mutateAsync, isPending } = useHotelDetail();
  const {
    mutateAsync: searchHotelsAsync,
    isPending: isHotelSearchPending,
  } = useHotelSearch();
  const {
    mutateAsync: fetchMoreRoomsAsync,
    isPending: isHotelMoreRoomsPending,
  } = useHotelGetMoreRooms();

  const {
    mutateAsync: addHotelFavouriteAsync,
    isPending: isAddingFavourite,
  } = useAddHotelFavourite();

  const {
    data: favouriteHotelsResponse,
    isLoading: isGetFavouritesLoading,
    refetch: refetchFavourites,
  } = useGetHotelFavourites();

  const favouriteItems = useMemo(() => {
    if (Array.isArray(favouriteHotelsResponse)) {
      return favouriteHotelsResponse;
    }

    if (Array.isArray((favouriteHotelsResponse as any)?.data)) {
      return (favouriteHotelsResponse as any).data;
    }

    return [];
  }, [favouriteHotelsResponse]);

  useEffect(() => {
    const currentHotelKey = params.hotelKey ?? "";
    if (!currentHotelKey) {
      setIsFavourite(false);
      return;
    }

    const exists = favouriteItems.some(
      (item: any) => item?.hotelKey === currentHotelKey
    );

    setIsFavourite(exists);
  }, [favouriteItems, params.hotelKey]);

  const fetchHotelData = useCallback(
    async (searchKey: string) => {
      const body = {
        hotelKey: params.hotelKey ?? "",
        searchKey,
        culture: "en",
      };

      try {
        const results = await Promise.allSettled([
          mutateAsync(body),
          fetchMoreRoomsAsync(body),
        ]);

        const [detailResult, roomsResult] = results;

        if (detailResult.status === "fulfilled") {
          setHotelDetail(detailResult.value?.data?.[0] ?? null);
        } else {
          const err = extractErrorFromAxiosApiError(detailResult.reason);
          toast.error(err);
        }

        if (roomsResult.status === "fulfilled") {
          setHotelMoreRooms(roomsResult.value?.data?.[0] ?? null);
        } else {
          const err = extractErrorFromAxiosApiError(roomsResult.reason);
          toast.error(err);
        }
      } catch (unexpected) {
        console.log("unexpected promised failed--------------", unexpected);
      }
    },
    [params.hotelKey, mutateAsync, fetchMoreRoomsAsync]
  );

  const init = useCallback(async () => {
    const searchParams = new URLSearchParams(location.search);
    const searchKeyFromUrl = searchParams.get("searchKey") ?? "";
    const bookingParamsFromUrl = safeParseHotelBookingParams(
      searchParams.get("bookingParams")
    );
    const bookingParamsFromState = normalizeHotelBookingParams(state.bookingParams);

    const nextResolvedSearchKey = state.searchKey || searchKeyFromUrl;
    const nextResolvedBookingParams =
      bookingParamsFromUrl || bookingParamsFromState;

    setResolvedSearchKey(nextResolvedSearchKey);
    setResolvedBookingParams(nextResolvedBookingParams);

    if (!nextResolvedSearchKey) {
      setHotelDetail(null);
      setHotelMoreRooms(null);
      return;
    }

    await fetchHotelData(nextResolvedSearchKey);
  }, [location.search, state.searchKey, state.bookingParams, fetchHotelData]);

  useEffect(() => {
    init();
  }, [init]);

  const primaryImages = useMemo(
    () => hotelDetail?.images || [],
    [hotelDetail?.images]
  );

  const dynamicImages = useMemo(() => {
    const totalImages = primaryImages.length;
    const maxGridImages = 6;
    return totalImages > 0
      ? primaryImages.slice(0, Math.min(totalImages, maxGridImages))
      : [];
  }, [primaryImages]);

  const coordinates = useMemo(
    () => ({
      latitude: hotelDetail?.latitude
        ? parseFloat(hotelDetail.latitude)
        : 24.8607,
      longitude: hotelDetail?.longitude
        ? parseFloat(hotelDetail.longitude)
        : 67.0011,
    }),
    [hotelDetail?.latitude, hotelDetail?.longitude]
  );

  const nearbyInfo = useMemo(() => {
    const firstNearbyArea = hotelDetail?.nearbyAreas?.[0];
    const nearbyDistanceKm =
      firstNearbyArea?.distance != null
        ? (Number(firstNearbyArea.distance) / 1000).toFixed(1)
        : null;
    return { firstNearbyArea, nearbyDistanceKm };
  }, [hotelDetail?.nearbyAreas]);

  const starRatingCount = useMemo(
    () =>
      Math.max(
        0,
        Math.min(
          7,
          Number.isFinite(Number(hotelDetail?.starRating))
            ? Number(hotelDetail?.starRating)
            : 0
        )
      ),
    [hotelDetail?.starRating]
  );

  
  const totalPrice = useMemo(() => {
    return selectedRooms.reduce((total, selectedRoom) => {
      const roomPrice = selectedRoom.room?.roomRate?.netAmount || 0;
      return total + roomPrice * selectedRoom.count;
    }, 0);
  }, [selectedRooms]);

  const detailMapHotel = useMemo(() => {
    const firstRoom = hotelMoreRooms?.rooms?.[0];
    const taxesAndFees = (firstRoom?.roomRate?.taxes || []).reduce(
      (sum: number, tax: any) => sum + (tax?.included ? 0 : Number(tax?.amount || 0)),
      0
    );

    return {
      hotelKey: params.hotelKey ?? "",
      propertyInfo: {
        hotelName: hotelDetail?.name || "Hotel",
        imageUrl: primaryImages?.[0]?.path || HotelImage,
        starRating: hotelDetail?.starRating || 0,
        latitude: hotelDetail?.latitude || "",
        longitude: hotelDetail?.longitude || "",
      },
      rooms: hotelMoreRooms?.rooms || [],
      totalPrice:
        firstRoom?.roomRate?.netAmount ||
        selectedRooms?.[0]?.room?.roomRate?.netAmount ||
        totalPrice ||
        0,
      taxesAndFees,
      reviewScore: hotelDetail?.reviewScore,
      reviewCount: hotelDetail?.reviewCount,
      locationScore: hotelDetail?.locationScore,
      beachDistance:
        nearbyInfo?.nearbyDistanceKm && nearbyInfo?.firstNearbyArea?.name
          ? `${nearbyInfo.nearbyDistanceKm} km from ${nearbyInfo.firstNearbyArea.name}`
          : "600 m from beach",
    };
  }, [
    hotelDetail,
    hotelMoreRooms?.rooms,
    nearbyInfo,
    params.hotelKey,
    primaryImages,
    selectedRooms,
    totalPrice,
  ]);

  const detailMarkerLabel = useMemo(() => {
    return getMarkerPriceLabel(detailMapHotel);
  }, [detailMapHotel]);

  const handleShowImages = useCallback(() => {
    setShowHotelDetailImages(true);
  }, []);

  const handleHideImages = useCallback(() => {
    setShowHotelDetailImages(false);
  }, []);

  const handleShowLocationMap = useCallback(() => {
    setShowLocationMap(true);
  }, []);

  const handleHideLocationMap = useCallback(() => {
    setShowLocationMap(false);
  }, []);

  const handleTabChange = useCallback((tab: HotelDetailTab) => {
    setActiveTab(tab);
  }, []);

  const handleRoomsChange = useCallback((rooms: any[]) => {
    setSelectedRooms(rooms);
  }, []);

  const handleRoomToolbarSearch = useCallback(
    async (nextBookingParams: HotelBookingParams) => {
      const normalizedBookingParams =
        normalizeHotelBookingParams(nextBookingParams) ?? undefined;

      if (!normalizedBookingParams) {
        return;
      }

      const starRatingsForStore =
        normalizedBookingParams.starRatings &&
        normalizedBookingParams.starRatings.length > 0
          ? normalizedBookingParams.starRatings
          : hotelSearchState?.starRatings &&
            hotelSearchState.starRatings.length > 0
          ? hotelSearchState.starRatings
          : (() => {
              const m =
                normalizedBookingParams.minStarRating ??
                hotelSearchState?.minStarRating ??
                0;
              return m > 0 ? [Math.floor(m)] : [];
            })();

      const nextStoreHotel = {
        country:
          normalizedBookingParams.country ??
          hotelSearchState?.country ??
          "",
        city:
          normalizedBookingParams.city ??
          hotelSearchState?.city ??
          "",
        checkIn:
          normalizedBookingParams.checkIn ??
          hotelSearchState?.checkIn ??
          "",
        checkOut:
          normalizedBookingParams.checkOut ??
          hotelSearchState?.checkOut ??
          "",
        travelerCountryOfResidence:
          normalizedBookingParams.travelerCountryOfResidence ??
          hotelSearchState?.travelerCountryOfResidence ??
          "",
        travelerNationality:
          normalizedBookingParams.travelerNationality ??
          hotelSearchState?.travelerNationality ??
          "",
        paxData:
          normalizedBookingParams.paxData ??
          hotelSearchState?.paxData ?? {
            adults: 1,
            children: 0,
            kids: 0,
            rooms: 1,
          },
        childAges:
          normalizedBookingParams.childAges ??
          hotelSearchState?.childAges ??
          [],
        starRatings: starRatingsForStore,
        minStarRating:
          starRatingsForStore.length > 0
            ? Math.min(...starRatingsForStore)
            : 0,
      };

      if (params.hotelKey) {
        const body: HotelSearchRequest = {
          country: nextStoreHotel.country,
          city: nextStoreHotel.city,
          checkIn: nextStoreHotel.checkIn,
          checkOut: nextStoreHotel.checkOut,
          rooms: convertPaxToRooms(
            nextStoreHotel.paxData,
            nextStoreHotel.childAges
          ),
          travelerCountryOfResidence:
            nextStoreHotel.travelerCountryOfResidence,
          travelerNationality: nextStoreHotel.travelerNationality,
          culture: "en",
          filters: {
            currency: "AED",
            minStarRating: nextStoreHotel.minStarRating ?? 0,
            ...(nextStoreHotel.starRatings &&
            nextStoreHotel.starRatings.length > 0
              ? { starRatings: nextStoreHotel.starRatings }
              : {}),
          },
        };

        try {
          const response = await searchHotelsAsync(body);
          const nextSearchKey = response?.commonData?.searchKey || "";

          if (nextSearchKey) {
            setHotelSearchState(nextStoreHotel);
            setResolvedSearchKey(nextSearchKey);
            setResolvedBookingParams({
              ...normalizedBookingParams,
              ...nextStoreHotel,
            });
            setSelectedRooms([]);
            await fetchHotelData(nextSearchKey);

            const queryParams = new URLSearchParams();
            queryParams.set("searchKey", nextSearchKey);
            queryParams.set(
              "bookingParams",
              serializeHotelBookingParams({
                ...normalizedBookingParams,
                ...nextStoreHotel,
              })
            );

            navigate(`${location.pathname}?${queryParams.toString()}`, {
              replace: true,
              state: {
                ...(location.state || {}),
                searchKey: nextSearchKey,
                bookingParams: {
                  ...normalizedBookingParams,
                  ...nextStoreHotel,
                },
              },
            });
            return;
          }
        } catch (error) {
          const err = extractErrorFromAxiosApiError(error);
          toast.error(err);
          return;
        }
      }

      const queryParams = new URLSearchParams(location.search);
      if (resolvedSearchKey) {
        queryParams.set("searchKey", resolvedSearchKey);
      }
      setResolvedBookingParams(normalizedBookingParams);
      queryParams.set(
        "bookingParams",
        serializeHotelBookingParams(normalizedBookingParams)
      );

      navigate(`${location.pathname}?${queryParams.toString()}`, {
        replace: true,
        state: {
          ...(location.state || {}),
          searchKey: resolvedSearchKey,
          bookingParams: normalizedBookingParams,
        },
      });
    },
    [
      hotelSearchState,
      params.hotelKey,
      searchHotelsAsync,
      setHotelSearchState,
      fetchHotelData,
      location.pathname,
      location.search,
      location.state,
      navigate,
      resolvedSearchKey,
    ]
  );


  const currency = useMemo(() => {
    if (selectedRooms.length > 0) {
      return selectedRooms[0]?.room?.roomRate?.currency || "AED";
    }
    return "AED";
  }, [selectedRooms]);

  const formatPrice = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const totalRoomsCount = useMemo(() => {
    return selectedRooms.reduce((total, selectedRoom) => {
      return total + selectedRoom.count;
    }, 0);
  }, [selectedRooms]);

  const numberOfRooms = useMemo(() => {
    if (!hotelMoreRooms?.rooms || !Array.isArray(hotelMoreRooms.rooms)) {
      return resolvedBookingParams?.paxData?.rooms ?? 1;
    }
    const maxRoomIndex = Math.max(
      ...hotelMoreRooms.rooms.map((room: any) => room.roomIndex || 1)
    );
    return maxRoomIndex > 0
      ? maxRoomIndex
      : resolvedBookingParams?.paxData?.rooms ?? 1;
  }, [hotelMoreRooms?.rooms, resolvedBookingParams?.paxData?.rooms]);

  useEffect(() => {
    const requestedRooms = resolvedBookingParams?.paxData?.rooms ?? 1;

    setSelectedRooms((prev) =>
      prev.filter((selected) => (selected?.room?.roomIndex ?? 1) <= requestedRooms)
    );
  }, [resolvedBookingParams?.paxData?.rooms]);

  const buildFavouritePayload = useCallback(
    (flag: boolean) => {
      const favouriteRooms =
        selectedRooms.length > 0
          ? selectedRooms.map((selected) => ({
              roomIndex: selected?.room?.roomIndex ?? 1,
              roomKey: selected?.room?.roomKey ?? "",
              roomId: selected?.room?.roomId ?? "",
              roomTypeName: selected?.room?.roomTypeName ?? "",
              roomTypeDesc:
                selected?.room?.roomTypeDesc ??
                selected?.room?.roomTypeName ??
                "",
              maxOccupancy: selected?.room?.maxOccupancy ?? -1,
              roomFacilities: selected?.room?.roomFacilities ?? [],
              ratePlan: {
                supplierCode: selected?.room?.ratePlan?.supplierCode ?? "",
                meal: selected?.room?.ratePlan?.meal ?? "",
                availableStatus:
                  selected?.room?.ratePlan?.availableStatus ?? "",
                cancelPolicyIndicator:
                  selected?.room?.ratePlan?.cancelPolicyIndicator ?? "",
                code: selected?.room?.ratePlan?.code ?? "",
                isPackage: selected?.room?.ratePlan?.isPackage ?? false,
                fixedCombo: selected?.room?.ratePlan?.fixedCombo ?? false,
                gstAssured: selected?.room?.ratePlan?.gstAssured ?? false,
                lastCancellationDate:
                  selected?.room?.ratePlan?.lastCancellationDate ?? "",
              },
              roomRate: {
                currency: selected?.room?.roomRate?.currency ?? "AED",
                netAmount: selected?.room?.roomRate?.netAmount ?? 0,
                rates: selected?.room?.roomRate?.rates ?? [],
                taxes: selected?.room?.roomRate?.taxes ?? [],
              },
              rateNotes: selected?.room?.rateNotes ?? "",
              financialInfo: {
                tmc: selected?.room?.financialInfo?.tmc ?? "",
                supplier: selected?.room?.financialInfo?.supplier ?? "",
              },
              isAllPaxInfoMandatory:
                selected?.room?.isAllPaxInfoMandatory ?? false,
            }))
          : (hotelMoreRooms?.rooms || []).slice(0, 1).map((room: any) => ({
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
                cancelPolicyIndicator:
                  room?.ratePlan?.cancelPolicyIndicator ?? "",
                code: room?.ratePlan?.code ?? "",
                isPackage: room?.ratePlan?.isPackage ?? false,
                fixedCombo: room?.ratePlan?.fixedCombo ?? false,
                gstAssured: room?.ratePlan?.gstAssured ?? false,
                lastCancellationDate:
                  room?.ratePlan?.lastCancellationDate ?? "",
              },
              roomRate: {
                currency: room?.roomRate?.currency ?? "AED",
                netAmount: room?.roomRate?.netAmount ?? 0,
                rates: room?.roomRate?.rates ?? [],
                taxes: room?.roomRate?.taxes ?? [],
              },
              rateNotes: room?.rateNotes ?? "",
              financialInfo: {
                tmc: room?.financialInfo?.tmc ?? "",
                supplier: room?.financialInfo?.supplier ?? "",
              },
              isAllPaxInfoMandatory: room?.isAllPaxInfoMandatory ?? false,
            }));

      const facilities =
        hotelDetail?.hotelFacilities
          ?.map((facility: any) =>
            typeof facility === "string" ? facility : facility?.name
          )
          ?.filter(Boolean) ?? [];

      return {
        hotelKey: params.hotelKey ?? "",
        propertyInfo: {
          providerHotelId:
            hotelDetail?.providerHotelId?.toString() ||
            hotelDetail?.hotelCode?.toString() ||
            hotelDetail?.code?.toString() ||
            "",
          hotelName: hotelDetail?.name || "",
          address: hotelDetail?.address || "",
          phoneNumber: hotelDetail?.phoneNumber || "",
          location:
            hotelDetail?.location ||
            hotelDetail?.city ||
            hotelDetail?.destination ||
            "",
          latitude: hotelDetail?.latitude?.toString() || "",
          longitude: hotelDetail?.longitude?.toString() || "",
          imageUrl: primaryImages?.[0]?.path || "",
          facilities,
          propertyType: hotelDetail?.propertyType || "",
          starRating: hotelDetail?.starRating?.toString() || "",
        },
        rooms: favouriteRooms,
        totalPrice:
          totalPrice > 0
            ? totalPrice
            : favouriteRooms.reduce(
                (sum: number, room: any) =>
                  sum + (room?.roomRate?.netAmount || 0),
                0
              ),
        searchKey: resolvedSearchKey,
        flag,
      };
    },
    [
      hotelDetail,
      hotelMoreRooms?.rooms,
      params.hotelKey,
      primaryImages,
      selectedRooms,
      totalPrice,
      resolvedSearchKey,
    ]
  );

  const handleToggleFavourite = useCallback(async () => {
    const previousState = isFavourite;
    const nextState = !previousState;

    setIsFavourite(nextState);

    try {
      const payload = buildFavouritePayload(nextState);
      await addHotelFavouriteAsync(payload);
      await refetchFavourites();

      toast.success(
        nextState
          ? "Hotel added to favourites"
          : "Hotel removed from favourites"
      );
    } catch (error: any) {
      setIsFavourite(previousState);
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err || "Failed to update favourites");
    }
  }, [
    isFavourite,
    buildFavouritePayload,
    addHotelFavouriteAsync,
    refetchFavourites,
  ]);

  const addressText = [
    hotelDetail?.address,
    hotelDetail?.city,
    hotelDetail?.postalCode,
    hotelDetail?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return !showHotelDetailImages ? (
    <div className="w-full py-4 lg:py-6">
      <div className="mx-auto w-full max-w-[90%] px-4 sm:px-6 lg:px-14 pb-36 lg:pb-0">
        <Loader
          show={
            isPending ||
            isHotelSearchPending ||
            isHotelMoreRoomsPending ||
            isAddingFavourite ||
            isGetFavouritesLoading
          }
          label={
            isHotelSearchPending
              ? "Please wait while we are updating room availability"
              : isAddingFavourite
              ? "Please wait while we are updating favourites"
              : isGetFavouritesLoading
              ? "Please wait while we are checking favourites"
              : "Please wait while we are fetching hotel details"
          }
        />

        <div className="hidden lg:grid grid-cols-12 gap-2 h-[35vh]">
          <>
            {dynamicImages[0] && (
              <div className="col-span-5 row-span-2 relative overflow-hidden rounded-2xl hover:opacity-90 transition-opacity">
                <img
                  src={dynamicImages[0].path}
                  alt={dynamicImages[0].description || "Hotel image 1"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {dynamicImages[1] && (
              <div className="col-span-3 relative overflow-hidden rounded-2xl hover:opacity-90 transition-opacity">
                <img
                  src={dynamicImages[1].path}
                  alt={dynamicImages[1].description || "Hotel image 2"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {dynamicImages[2] && (
              <div className="col-span-2 relative overflow-hidden rounded-2xl hover:opacity-90 transition-opacity">
                <img
                  src={dynamicImages[2].path}
                  alt={dynamicImages[2].description || "Hotel image 3"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {primaryImages.length !== 0 && (
              <div className="col-span-2 relative overflow-hidden rounded-2xl">
                <MapContainer
                  center={[coordinates.latitude, coordinates.longitude]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                  scrollWheelZoom={false}
                  attributionControl={false}
                >
                  <TileLayer
                    attribution={HOTEL_LEAFLET_TILE_ATTRIBUTION_ESRI}
                    url={HOTEL_LEAFLET_TILE_URL_ESRI_WORLD_STREET}
                  />
                  <Marker
                    position={[coordinates.latitude, coordinates.longitude]}
                    icon={createHotelMarkerIcon(detailMarkerLabel)}
                  >
                    <Tooltip
                      direction="right"
                      offset={[20, -10]}
                      opacity={1}
                      permanent={false}
                      sticky={true}
                      interactive={true}
                      className="hotel-map-custom-tooltip"
                    >
                      <HotelMapHoverCard hotel={detailMapHotel} />
                    </Tooltip>
                  </Marker>
                  <MapAutoFix
                    lat={coordinates.latitude}
                    lng={coordinates.longitude}
                  />
                </MapContainer>
              </div>
            )}

            {dynamicImages[3] && (
              <div className="col-span-3 relative overflow-hidden rounded-2xl hover:opacity-90 transition-opacity">
                <img
                  src={dynamicImages[3].path}
                  alt={dynamicImages[3].description || "Hotel image 4"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {dynamicImages[4] && (
              <div className="col-span-2 relative overflow-hidden rounded-2xl hover:opacity-90 transition-opacity">
                <img
                  src={dynamicImages[4].path}
                  alt={dynamicImages[4].description || "Hotel image 5"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {dynamicImages[5] && (
              <div
                className="col-span-2 relative overflow-hidden rounded-2xl cursor-pointer"
                onClick={handleShowImages}
              >
                <img
                  src={dynamicImages[5].path}
                  alt={dynamicImages[5].description || "Hotel image 6"}
                  className="w-full h-full object-cover blur-[2px]"
                />
                {primaryImages.length > 6 && (
                  <div className="absolute inset-0 bg-[#0A0C0F1A] bg-opacity-10 flex items-center justify-center">
                    <span className="text-[#FFFFFF] text-3xl font-bold">
                      +{primaryImages.length - 6}
                    </span>
                  </div>
                )}
              </div>
            )}

            {primaryImages.length === 0 && (
              <div className="col-span-12 relative overflow-hidden rounded-2xl">
                <MapContainer
                  center={[coordinates.latitude, coordinates.longitude]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                  scrollWheelZoom={false}
                  attributionControl={false}
                >
                  <TileLayer
                    attribution={HOTEL_LEAFLET_TILE_ATTRIBUTION_ESRI}
                    url={HOTEL_LEAFLET_TILE_URL_ESRI_WORLD_STREET}
                  />
                  <Marker
                    position={[coordinates.latitude, coordinates.longitude]}
                    icon={createHotelMarkerIcon(detailMarkerLabel)}
                  >
                    <Tooltip
                      direction="right"
                      offset={[20, -10]}
                      opacity={1}
                      permanent={false}
                      sticky={true}
                      interactive={true}
                      className="hotel-map-custom-tooltip"
                    >
                      <HotelMapHoverCard hotel={detailMapHotel} />
                    </Tooltip>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </>
        </div>

        <div className="lg:hidden space-y-2">
          {dynamicImages[0] && (
            <div className="w-full h-56 relative overflow-hidden rounded-2xl">
              <img
                src={dynamicImages[0].path}
                alt={dynamicImages[0].description || "Hotel image 1"}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {(dynamicImages[1] || dynamicImages[2]) && (
            <div className="grid grid-cols-2 gap-2">
              {dynamicImages[1] && (
                <div className="h-36 relative overflow-hidden rounded-2xl">
                  <img
                    src={dynamicImages[1].path}
                    alt={dynamicImages[1].description || "Hotel image 2"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {dynamicImages[2] && (
                <div className="h-36 relative overflow-hidden rounded-2xl">
                  <img
                    src={dynamicImages[2].path}
                    alt={dynamicImages[2].description || "Hotel image 3"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          <div className="w-full h-44 relative overflow-hidden rounded-2xl">
            <MapContainer
              center={[coordinates.latitude, coordinates.longitude]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              zoomControl={false}
              scrollWheelZoom={false}
              attributionControl={false}
            >
              <TileLayer
                attribution={HOTEL_LEAFLET_TILE_ATTRIBUTION_ESRI}
                url={HOTEL_LEAFLET_TILE_URL_ESRI_WORLD_STREET}
              />
              <Marker
                position={[coordinates.latitude, coordinates.longitude]}
                icon={createHotelMarkerIcon(detailMarkerLabel)}
              >
                <Tooltip
                  direction="right"
                  offset={[20, -10]}
                  opacity={1}
                  permanent={false}
                  sticky={true}
                  interactive={true}
                  className="hotel-map-custom-tooltip"
                >
                  <HotelMapHoverCard hotel={detailMapHotel} />
                </Tooltip>
              </Marker>
              <MapAutoFix lat={coordinates.latitude} lng={coordinates.longitude} />
            </MapContainer>
          </div>

          {(dynamicImages[3] || dynamicImages[4]) && (
            <div className="grid grid-cols-2 gap-2">
              {dynamicImages[3] && (
                <div className="h-32 relative overflow-hidden rounded-2xl">
                  <img
                    src={dynamicImages[3].path}
                    alt={dynamicImages[3].description || "Hotel image 4"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {dynamicImages[4] && (
                <div className="h-32 relative overflow-hidden rounded-2xl">
                  <img
                    src={dynamicImages[4].path}
                    alt={dynamicImages[4].description || "Hotel image 5"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {dynamicImages[5] && (
            <div
              className="w-full h-32 relative overflow-hidden rounded-2xl cursor-pointer"
              onClick={handleShowImages}
            >
              <img
                src={dynamicImages[5].path}
                alt={dynamicImages[5].description || "Hotel image 6"}
                className="w-full h-full object-cover blur-[2px]"
              />
              {primaryImages.length > 6 && (
                <div className="absolute inset-0 bg-[#0A0C0F1A] bg-opacity-10 flex items-center justify-center">
                  <span className="text-[#FFFFFF] text-3xl font-bold">
                    +{primaryImages.length - 6}
                  </span>
                </div>
              )}
            </div>
          )}

          {primaryImages.length === 0 && (
            <div className="w-full h-56 relative overflow-hidden rounded-2xl">
              <MapContainer
                center={[coordinates.latitude, coordinates.longitude]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                scrollWheelZoom={false}
                attributionControl={false}
              >
                <TileLayer
                  attribution={HOTEL_LEAFLET_TILE_ATTRIBUTION_ESRI}
                  url={HOTEL_LEAFLET_TILE_URL_ESRI_WORLD_STREET}
                />
                <Marker
                  position={[coordinates.latitude, coordinates.longitude]}
                  icon={createHotelMarkerIcon(detailMarkerLabel)}
                >
                  <Tooltip
                    direction="right"
                    offset={[20, -10]}
                    opacity={1}
                    permanent={false}
                    sticky={true}
                    interactive={true}
                    className="hotel-map-custom-tooltip"
                  >
                    <HotelMapHoverCard hotel={detailMapHotel} />
                  </Tooltip>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>

        <div className="mt-6 lg:mt-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
          <div className="flex-1">
            <h1 className="text-[22px] leading-[30px] lg:text-[28px] lg:leading-[34px] font-bold text-[#0A0C0F] mb-2">
              {hotelDetail?.name}
            </h1>

            <div className="flex items-start flex-wrap gap-x-2 gap-y-2 text-[#3D495C] text-sm mb-3">
              <div className="flex items-start gap-2 max-w-full min-w-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0 mt-[2px]"
                >
                  <path
                    d="M12 21C12 21 18 15.75 18 10.5C18 7.18629 15.3137 4.5 12 4.5C8.68629 4.5 6 7.18629 6 10.5C6 15.75 12 21 12 21Z"
                    stroke="#2351A3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="10.5"
                    r="2.25"
                    stroke="#2351A3"
                    strokeWidth="2"
                  />
                </svg>

                <span className="leading-6 break-words">{addressText}</span>
              </div>

              {(hotelDetail?.latitude || hotelDetail?.longitude) && (
                <>
                  <span className="text-[#7C8899] font-medium leading-6">-</span>
                  <button
                    type="button"
                    onClick={handleShowLocationMap}
                    className="text-[#2351A3] text-[15px] font-bold leading-6 hover:underline underline-offset-2"
                  >
                    Show on map
                  </button>
                </>
              )}

              {nearbyInfo.nearbyDistanceKm &&
                nearbyInfo.firstNearbyArea?.name && (
                  <>
                    <span className="text-[#7C8899] leading-6">•</span>
                    <span className="leading-6">
                      {nearbyInfo.nearbyDistanceKm} km from{" "}
                      {nearbyInfo.firstNearbyArea.name}
                    </span>
                  </>
                )}
            </div>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: starRatingCount }, (_, index) => (
                <img
                  src={FilledStar}
                  alt="icon"
                  key={index}
                  className="w-4 h-4"
                />
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button
              className="px-4 py-2 text-[#2351A3] text-sm font-medium hover:underline"
              onClick={() => setOpenShareModal(true)}
            >
              Share
            </button>

            <div className="border-l border-[#E4E4E7] h-8" />

            <button
              onClick={handleToggleFavourite}
              disabled={isAddingFavourite || isGetFavouritesLoading}
              className={`px-8 py-3 text-[#F2F2F3] font-semibold rounded-full text-sm shadow-sm transition-all ${
                isAddingFavourite || isGetFavouritesLoading
                  ? "bg-[#AEB8C5] cursor-not-allowed"
                  : isFavourite
                  ? "bg-[#EA0029] hover:opacity-95"
                  : "bg-[#2351A3] hover:opacity-95"
              }`}
            >
              {isAddingFavourite
                ? isFavourite
                  ? "Removing..."
                  : "Adding..."
                : isFavourite
                ? "Remove from favorites"
                : "Add to favorites"}
            </button>
          </div>
        </div>

        <div className="mt-4 lg:hidden flex flex-col gap-3">
          <button
            className="w-full rounded-lg border border-[#E4E4E7] px-4 py-2 text-[#2351A3] text-sm font-medium"
            onClick={() => setOpenShareModal(true)}
          >
            Share
          </button>

          <button
            onClick={handleToggleFavourite}
            disabled={isAddingFavourite || isGetFavouritesLoading}
            className={`w-full px-4 py-3 text-[#F2F2F3] font-semibold rounded-lg text-sm shadow-sm transition-all ${
              isAddingFavourite || isGetFavouritesLoading
                ? "bg-[#AEB8C5] cursor-not-allowed"
                : isFavourite
                ? "bg-[#EA0029] hover:opacity-95"
                : "bg-[#2351A3] hover:opacity-95"
            }`}
          >
            {isAddingFavourite
              ? isFavourite
                ? "Removing..."
                : "Adding..."
              : isFavourite
              ? "Remove from favorites"
              : "Add to favorites"}
          </button>
        </div>

        <div className="mt-6 w-full">
          <div className="flex justify-center">
            <div className="flex w-full items-end gap-2 overflow-x-auto pb-1 sm:gap-3 lg:w-auto lg:gap-[14px] lg:overflow-visible">
              {tabItems.map((tab) => {
                const selected = activeTab === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => handleTabChange(tab.value)}
                    className={[
                      "h-[44px] min-w-[96px] lg:min-w-[105px] rounded-t-[16px] rounded-b-none px-4 lg:px-6",
                      "flex items-center justify-center",
                      "text-[14px] leading-none",
                      "shrink-0",
                      "border-0 outline-none appearance-none",
                      "transition-all duration-200",
                      selected
                        ? "bg-[#43C6E2] font-medium text-[#F2F2F3]"
                        : "bg-[#F2F2F3] font-normal text-[#3D495C] hover:bg-[#ECECEF]",
                    ].join(" ")}
                    style={{
                      WebkitAppearance: "none",
                      appearance: "none",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto mt-0 h-[14px] w-full max-w-[1000px] hidden lg:block">
            <div className="h-[10px] w-full rounded-t-[16px] bg-[#D7EAF8] blur-[5px]" />
          </div>
        </div>

        {activeTab === "Overview" && (
          <HotelDetailOverviewSection hotelDetail={hotelDetail} />
        )}

        {activeTab === "Rooms" && (
          <HotelDetailRoomSection
            bookingParams={resolvedBookingParams}
            hotelDetail={hotelDetail}
            hotelMoreRooms={hotelMoreRooms}
            selectedRooms={selectedRooms}
            onRoomsChange={handleRoomsChange}
            onBookingParamsChange={handleRoomToolbarSearch}
            isSearching={isHotelSearchPending}
          />
        )}

        {activeTab === "Amenities" && (
          <HotelDetailAmenetiesSection
            hotelDetail={hotelDetail}
            onSeeRooms={() => handleTabChange("Rooms")}
          />
        )}

        {showLocationMap && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 px-4">
            <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden">
              <button
                type="button"
                onClick={handleHideLocationMap}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#0A0C0F] shadow hover:bg-white"
                aria-label="Close map"
              >
                ✕
              </button>

              <div className="px-4 lg:px-6 pt-5 lg:pt-6 pb-4 border-b border-[#E4E4E7]">
                <h3 className="text-xl font-bold text-[#0A0C0F]">
                  {hotelDetail?.name || "Hotel location"}
                </h3>
                <p className="mt-2 text-sm text-[#3D495C]">{addressText}</p>
              </div>

              <div className="h-[60vh] lg:h-[520px] w-full">
                <MapContainer
                  center={[coordinates.latitude, coordinates.longitude]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={true}
                  scrollWheelZoom={true}
                  attributionControl={false}
                >
                  <TileLayer
                    attribution={HOTEL_LEAFLET_TILE_ATTRIBUTION_ESRI}
                    url={HOTEL_LEAFLET_TILE_URL_ESRI_WORLD_STREET}
                  />

                  <Marker
                    position={[coordinates.latitude, coordinates.longitude]}
                    icon={createHotelMarkerIcon(detailMarkerLabel)}
                  >
                    <Tooltip
                      direction="right"
                      offset={[20, -10]}
                      opacity={1}
                      permanent={false}
                      sticky={true}
                      interactive={true}
                      className="hotel-map-custom-tooltip"
                    >
                      <HotelMapHoverCard hotel={detailMapHotel} />
                    </Tooltip>
                  </Marker>

                  <MapAutoFix
                    lat={coordinates.latitude}
                    lng={coordinates.longitude}
                  />
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        <div className="hidden lg:block fixed bottom-4 left-0 right-0 z-50">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0, 0, 0, 0.001)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          />

          <div className="relative max-w-5xl mx-auto px-4 py-6">
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4EE7] px-4 py-3">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-shrink-0 flex-1">
                  <p className="text-xs text-[#3D495C]">Your selection</p>
                  {selectedRooms.length > 0 ? (
                    <>
                      <p className="text-base font-medium text-[#0A0C0F]">
                        {totalRoomsCount} room
                        {totalRoomsCount > 1 ? "s" : ""} selected
                      </p>
                      <div className="mt-1 space-y-1">
                        <div className="text-base font-semibold text-[#0A0C0F] mt-2 pt-2 border-t border-[#E4E4E7]">
                          Total: {formatPrice(totalPrice, currency)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-base font-medium text-[#0A0C0F]">
                        No rooms selected
                      </p>
                      <button className="text-sm text-[#EA0029] mt-1 font-normal">
                        Select dates, travelers and rooms to see prices.
                      </button>
                    </>
                  )}
                </div>

                <Button
                  disabled={totalRoomsCount < numberOfRooms}
                  className={
                    totalRoomsCount >= numberOfRooms
                      ? "bg-[#2351A3] text-[#F2F2F3] px-10 py-3 rounded-lg font-semibold text-base"
                      : "bg-[#C2CAD6] text-[#F2F2F3] px-10 py-3 rounded-lg font-semibold text-base cursor-not-allowed"
                  }
                  overrideClasses
                  onClick={() => {
                    const { images, ...hotelDetailWithoutImages } =
                      hotelDetail ?? {};
                    const slicedImages = Array.isArray(images)
                      ? images.slice(0, 5)
                      : [];
                    navigate("/hotel-booking", {
                      state: {
                        hotelDetail: {
                          ...hotelDetailWithoutImages,
                          images: slicedImages,
                        },
                        searchKey:
                          resolvedSearchKey ||
                          new URLSearchParams(location.search).get("searchKey"),
                        bookingParams: resolvedBookingParams,
                        selectedRooms,
                        totalPrice,
                        currency,
                        hotelKey: params.hotelKey,
                      },
                    });
                  }}
                >
                  Continue to booking
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0, 0, 0, 0.001)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          />
          <div className="relative px-4 py-3">
            <div className="bg-[#FFFFFF] rounded-t-2xl border border-[#E4EE7] px-4 py-3">
              <p className="text-xs text-[#3D495C]">Your selection</p>
              {selectedRooms.length > 0 ? (
                <>
                  <p className="text-base font-medium text-[#0A0C0F]">
                    {totalRoomsCount} room
                    {totalRoomsCount > 1 ? "s" : ""} selected
                  </p>
                  <div className="text-base font-semibold text-[#0A0C0F] mt-2 pt-2 border-t border-[#E4E4E7]">
                    Total: {formatPrice(totalPrice, currency)}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-base font-medium text-[#0A0C0F]">
                    No rooms selected
                  </p>
                  <button className="text-sm text-[#EA0029] mt-1 font-normal">
                    Select dates, travelers and rooms to see prices.
                  </button>
                </>
              )}

              <Button
                disabled={totalRoomsCount < numberOfRooms}
                className={
                  totalRoomsCount >= numberOfRooms
                    ? "mt-3 w-full bg-[#2351A3] text-[#F2F2F3] px-6 py-3 rounded-lg font-semibold text-base"
                    : "mt-3 w-full bg-[#C2CAD6] text-[#F2F2F3] px-6 py-3 rounded-lg font-semibold text-base cursor-not-allowed"
                }
                overrideClasses
                onClick={() => {
                  const { images, ...hotelDetailWithoutImages } =
                    hotelDetail ?? {};
                  const slicedImages = Array.isArray(images)
                    ? images.slice(0, 5)
                    : [];
                  navigate("/hotel-booking", {
                    state: {
                      hotelDetail: {
                        ...hotelDetailWithoutImages,
                        images: slicedImages,
                      },
                      searchKey:
                        resolvedSearchKey ||
                        new URLSearchParams(location.search).get("searchKey"),
                      bookingParams: resolvedBookingParams,
                      selectedRooms,
                      totalPrice,
                      currency,
                      hotelKey: params.hotelKey,
                    },
                  });
                }}
              >
                Continue to booking
              </Button>
            </div>
          </div>
        </div>
      </div>

      {openShareModal && (
        <ShareTicketModal
          closeModal={() => setOpenShareModal(false)}
          mode="hotel"
          showPrint={false}
          shareUrl={buildHotelShareUrl(
            params.hotelKey ?? "",
            resolvedSearchKey,
            resolvedBookingParams ?? null
          )}
          title="Share this Hotel"
          description="Send this hotel to family and friends. Share the property details and location instantly."
          cardTitle={hotelDetail?.name || "Hotel details"}
          cardSubtitle={[
            hotelDetail?.address,
            hotelDetail?.city,
            hotelDetail?.country,
          ]
            .filter(Boolean)
            .join(", ")}
          passengerName={hotelDetail?.name || "Hotel details"}
        />
      )}
    </div>
  ) : (
    <HotelImages
      setShowHotelDetailImages={handleHideImages}
      images={primaryImages}
    />
  );
};

export default HotelDetailListing;