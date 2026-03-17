import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import FilledStar from "../assets/svgs/filled_star.svg";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../components";
import HotelDetailOverviewSection from "../components/molecules/HotelDetailOverviewSection";
import HotelDetailAmenetiesSection from "../components/molecules/HotelDetailAmenetiesSection";
import HotelImages from "../components/molecules/HotelImages";
import HotelDetailRoomSection from "../components/molecules/HotelDetailRoomSection";
import ShareTicketModal from "../components/atoms/ShareTicketModal";
import {
  useHotelDetail,
  useHotelGetMoreRooms,
  useAddHotelFavourite,
  useGetHotelFavourites,
} from "../hooks/useHotelSearch";
import Loader from "../components/atoms/Loader";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";
import toast from "react-hot-toast";
import { useLocation, useParams, useNavigate } from "react-router-dom";

const tabs = ["Overview", "Rooms", "Ameneties"] as const;

type LocationState = {
  searchKey?: string;
  bookingParams?: {
    checkIn?: string;
    checkOut?: string;
    paxData?: {
      adults?: number;
      children?: number;
      kids?: number;
      rooms?: number;
    };
    [key: string]: any;
  };
};

const redIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [20, 30],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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

  const [openShareModal, setOpenShareModal] = useState(false);
  const [hotelDetail, setHotelDetail] = useState<any>(null);
  const [hotelMoreRooms, setHotelMoreRooms] = useState<any>(null);
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>("Overview");
  const [showHotelDetailImages, setShowHotelDetailImages] =
    useState<boolean>(false);
  const [showLocationMap, setShowLocationMap] = useState<boolean>(false);
  const [selectedRooms, setSelectedRooms] = useState<any[]>([]);
  const [resolvedBookingParams, setResolvedBookingParams] = useState<
    LocationState["bookingParams"] | undefined
  >(state.bookingParams);
  const [isFavourite, setIsFavourite] = useState(false);

  const { mutateAsync, isPending } = useHotelDetail();
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
      (item: any) => item?.hotelKey === currentHotelKey,
    );

    setIsFavourite(exists);
  }, [favouriteItems, params.hotelKey]);

  const init = async () => {
    const searchParams = new URLSearchParams(location.search);
    const searchKeyFromUrl = searchParams.get("searchKey") ?? "";
    const bookingParamsFromUrl = searchParams.get("bookingParams");

    const resolvedSearchKey = state.searchKey || searchKeyFromUrl;
    const resolvedBookingParams =
      state.bookingParams ||
      (bookingParamsFromUrl
        ? JSON.parse(decodeURIComponent(bookingParamsFromUrl))
        : undefined);

    setResolvedBookingParams(resolvedBookingParams);

    const body = {
      hotelKey: params.hotelKey ?? "",
      searchKey: resolvedSearchKey,
      culture: "en",
    };

    try {
      const results = await Promise.allSettled([
        mutateAsync(body),
        fetchMoreRoomsAsync(body),
      ]);

      const [detailResult, roomsResult] = results;

      if (detailResult.status === "fulfilled") {
        setHotelDetail(detailResult.value?.data?.[0]);
      } else {
        const err = extractErrorFromAxiosApiError(detailResult.reason);
        toast.error(err);
      }

      if (roomsResult.status === "fulfilled") {
        setHotelMoreRooms(roomsResult.value?.data?.[0]);
      }
    } catch (unexpected) {
      console.log("unexpected promised failed--------------", unexpected);
    }
  };

  useEffect(() => {
    init();
  }, [params.hotelKey, state.searchKey]);

  const primaryImages = useMemo(
    () => hotelDetail?.images || [],
    [hotelDetail?.images],
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
    [hotelDetail?.latitude, hotelDetail?.longitude],
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
            : 0,
        ),
      ),
    [hotelDetail?.starRating],
  );

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

  const handleTabChange = useCallback((tab: (typeof tabs)[number]) => {
    setActiveTab(tab);
  }, []);

  const handleRoomsChange = useCallback((rooms: any[]) => {
    setSelectedRooms(rooms);
  }, []);

  const totalPrice = useMemo(() => {
    return selectedRooms.reduce((total, selectedRoom) => {
      const roomPrice = selectedRoom.room?.roomRate?.netAmount || 0;
      return total + roomPrice * selectedRoom.count;
    }, 0);
  }, [selectedRooms]);

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
      return 1;
    }
    const maxRoomIndex = Math.max(
      ...hotelMoreRooms.rooms.map((room: any) => room.roomIndex || 1),
    );
    return maxRoomIndex > 0 ? maxRoomIndex : 1;
  }, [hotelMoreRooms?.rooms]);

  const buildFavouritePayload = useCallback(
    (flag: boolean) => {
      const searchParams = new URLSearchParams(location.search);
      const resolvedSearchKey =
        state.searchKey || searchParams.get("searchKey") || "";

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
            typeof facility === "string" ? facility : facility?.name,
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
                0,
              ),
        searchKey: resolvedSearchKey,
        flag,
      };
    },
    [
      hotelDetail,
      hotelMoreRooms?.rooms,
      location.search,
      params.hotelKey,
      primaryImages,
      selectedRooms,
      state.searchKey,
      totalPrice,
    ],
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
          : "Hotel removed from favourites",
      );
    } catch (error: any) {
      setIsFavourite(previousState);
      const err = extractErrorFromAxiosApiError(error);
      toast.error(err || "Failed to update favourites");
    }
  }, [isFavourite, buildFavouritePayload, addHotelFavouriteAsync, refetchFavourites]);

  const addressText = [
    hotelDetail?.address,
    hotelDetail?.city,
    hotelDetail?.postalCode,
    hotelDetail?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return !showHotelDetailImages ? (
    <div className="w-full py-6">
      <div className="mx-auto w-full max-w-[1240px] px-6 lg:px-16">
        <Loader
          show={
            isPending ||
            isHotelMoreRoomsPending ||
            isAddingFavourite ||
            isGetFavouritesLoading
          }
          label={
            isAddingFavourite
              ? "Please wait while we are updating favourites"
              : isGetFavouritesLoading
                ? "Please wait while we are checking favourites"
                : "Please wait while we are fetching hotel details"
          }
        />

        <div className="grid grid-cols-12 gap-2 h-[35vh]">
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
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[coordinates.latitude, coordinates.longitude]}
                    icon={redIcon}
                  />
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
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[coordinates.latitude, coordinates.longitude]}
                    icon={redIcon}
                  />
                </MapContainer>
              </div>
            )}
          </>
        </div>

        <div className="mt-8 flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-[28px] leading-[34px] font-bold text-[#0A0C0F] mb-2">
              {hotelDetail?.name}
            </h1>

            <div className="flex items-start flex-wrap gap-x-2 gap-y-2 text-[#3D495C] text-sm mb-3">
              <div className="flex items-start gap-2 max-w-full">
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

                <span className="leading-6">{addressText}</span>
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

          <div className="flex items-center gap-4">
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

        <div className="mt-6 w-full">
          <div className="flex justify-center">
            <div className="flex items-center gap-6">
              {tabs.map((t) => {
                const selected = activeTab === t;

                return (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => handleTabChange(t)}
                    className={[
                      "w-[240px] h-[64px] rounded-[18px]",
                      "flex items-center justify-center",
                      "text-[18px] font-semibold leading-none",
                      "border-0 outline-none appearance-none",
                      "transition-all duration-200",
                      selected
                        ? "text-white bg-[linear-gradient(180deg,#36CFE3_0%,#19A7C4_100%)] shadow-[0_14px_24px_rgba(44,193,219,0.32)]"
                        : "text-[#24324A] bg-[#EEF3F9] hover:bg-[#E7EEF7]",
                    ].join(" ")}
                    style={{
                      WebkitAppearance: "none",
                      appearance: "none",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 w-full">
            <div className="mx-auto h-[10px] w-[92%] rounded-full bg-[#C9DAF8] blur-[1px]" />
            <div className="mx-auto -mt-[10px] h-[3px] w-[92%] rounded-full bg-[#9EB8EE]" />
          </div>
        </div>

        {activeTab === "Overview" && (
          <HotelDetailOverviewSection hotelDetail={hotelDetail} />
        )}

        {activeTab === "Rooms" && (
          <HotelDetailRoomSection
            hotelMoreRooms={hotelMoreRooms}
            selectedRooms={selectedRooms}
            onRoomsChange={handleRoomsChange}
          />
        )}

        {activeTab === "Ameneties" && (
          <HotelDetailAmenetiesSection
            hotelDetail={hotelDetail}
            onSeeRooms={() => handleTabChange("Rooms")}
          />
        )}

        {showLocationMap && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 px-4">
            <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden">
              <button
                type="button"
                onClick={handleHideLocationMap}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#0A0C0F] shadow hover:bg-white"
                aria-label="Close map"
              >
                ✕
              </button>

              <div className="px-6 pt-6 pb-4 border-b border-[#E4E4E7]">
                <h3 className="text-xl font-bold text-[#0A0C0F]">
                  {hotelDetail?.name || "Hotel location"}
                </h3>
                <p className="mt-2 text-sm text-[#3D495C]">{addressText}</p>
              </div>

              <div className="h-[500px] w-full">
                <MapContainer
                  center={[coordinates.latitude, coordinates.longitude]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={true}
                  scrollWheelZoom={true}
                  attributionControl={false}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[coordinates.latitude, coordinates.longitude]}
                    icon={redIcon}
                  />
                  <MapAutoFix
                    lat={coordinates.latitude}
                    lng={coordinates.longitude}
                  />
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        <div className="fixed bottom-4 left-0 right-0 z-50">
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0, 0, 0, 0.001)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          />

          <div className="relative max-w-5xl mx-auto px-4 py-6">
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E7] px-4 py-3">
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
                          state.searchKey ||
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
      </div>

      {openShareModal && (
        <ShareTicketModal
          closeModal={() => setOpenShareModal(false)}
          mode="hotel"
          showPrint={false}
          shareUrl={`${window.location.origin}/hotel-detail/${params.hotelKey}${location.search || ""}`}
          title="Share this Hotel"
          description="Send this hotel to family and friends. Share the property details and location instantly."
          cardTitle={hotelDetail?.name || "Hotel details"}
          cardSubtitle={[hotelDetail?.address, hotelDetail?.city, hotelDetail?.country]
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