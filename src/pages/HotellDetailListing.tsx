import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import FilledStar from "../assets/svgs/filled_star.svg";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../components";
import HotelDetailOverviewSection from "../components/molecules/HotelDetailOverviewSection";
import HotelDetailGuestReviewSection from "../components/molecules/HotelDetailGuestReviewSection";
import HotelDetailAmenetiesSection from "../components/molecules/HotelDetailAmenetiesSection";
import HotelDetailFaqSection from "../components/molecules/HotelDetailFaqSection";
import HotelDetailRulesSection from "../components/molecules/HotelDetailRulesSection";
// import HotellGridCard from "../components/atoms/HotellGridCard";
import HotelImages from "../components/molecules/HotelImages";
import HotelDetailRoomSection from "../components/molecules/HotelDetailRoomSection";
// import { useMasterListings } from "../hooks/masterListings/useMasterListings";
import { useHotelDetail, useHotelGetMoreRooms } from "../hooks/useHotelSearch";
import Loader from "../components/atoms/Loader";
import { extractErrorFromAxiosApiError } from "../utils/apiErrorHanlder";
import toast from "react-hot-toast";
import { useLocation, useParams, useNavigate } from "react-router-dom";

const tabs = [
  "Overview",
  "Rooms",
  "Guest reviews",
  "Ameneties",
  "FAQs",
  "Rules",
] as const;

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
    // multiple passes so layout + images settle
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
  const [hotelDetail, setHotelDetail] = useState<any>(null);
  const [hotelMoreRooms, setHotelMoreRooms] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");
  const [showHotelDetailImages, setShowHotelDetailImages] =
    useState<boolean>(false);
  const [selectedRooms, setSelectedRooms] = useState<any[]>([]);

  const { mutateAsync, isPending } = useHotelDetail();
  const {
    mutateAsync: fetchMoreRoomsAsync,
    isPending: isHotelMoreRoomsPending,
  } = useHotelGetMoreRooms();

  // const { passengers } = useMasterListings({
  //   include: ["passengers"],
  // });

  const init = async () => {
    const body = {
      hotelKey: params.hotelKey ?? "",
      searchKey: state.searchKey ?? "",
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
      // } else {
      //   const err = extractErrorFromAxiosApiError(roomsResult.reason);
      //   toast.error(err);
      // }
    } catch (unexpected) {
      console.log("unsxpected promised failed--------------", unexpected);
      // toast.error("Unexpected error");
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

  const handleTabChange = useCallback((tab: (typeof tabs)[number]) => {
    setActiveTab(tab);
  }, []);

  const handleRoomsChange = useCallback((rooms: any[]) => {
    setSelectedRooms(rooms);
  }, []);

  // Calculate total price from selected rooms
  const totalPrice = useMemo(() => {
    return selectedRooms.reduce((total, selectedRoom) => {
      const roomPrice = selectedRoom.room?.roomRate?.netAmount || 0;
      return total + roomPrice * selectedRoom.count;
    }, 0);
  }, [selectedRooms]);

  // Get currency from first selected room or default
  const currency = useMemo(() => {
    if (selectedRooms.length > 0) {
      return selectedRooms[0]?.room?.roomRate?.currency || "AED";
    }
    return "AED";
  }, [selectedRooms]);

  // Format price helper
  const formatPrice = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  // Get total rooms count
  const totalRoomsCount = useMemo(() => {
    return selectedRooms.reduce((total, selectedRoom) => {
      return total + selectedRoom.count;
    }, 0);
  }, [selectedRooms]);

  const numberOfRooms = useMemo(() => {
    if (!hotelMoreRooms?.rooms || !Array.isArray(hotelMoreRooms.rooms)) {
      return 1; // Default to 1 room
    }
    const maxRoomIndex = Math.max(
      ...hotelMoreRooms.rooms.map((room: any) => room.roomIndex || 1),
    );
    return maxRoomIndex > 0 ? maxRoomIndex : 1;
  }, [hotelMoreRooms?.rooms]);

  return !showHotelDetailImages ? (
    <div className="w-full px-16 py-6">
      <Loader
        show={isPending || isHotelMoreRoomsPending}
        label="Please wait while we are fetching hotel details"
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
                ></Marker>
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
                ></Marker>
              </MapContainer>
            </div>
          )}
        </>
      </div>

      {/* TITLE SECTION/ADD TO FAVORITES */}
      <div className="mt-10 flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-base font-bold text-[#0A0C0F] mb-1">
            {hotelDetail?.name}
          </h1>

          <div className="flex items-center gap-1 text-[#3D495C] text-xs mb-3">
            <svg
              width="14"
              height="13"
              viewBox="0 0 14 13"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.5 4.94949V9.49949C6.5 9.6321 6.55268 9.75928 6.64645 9.85304C6.74021 9.94681 6.86739 9.99949 7 9.99949C7.13261 9.99949 7.25979 9.94681 7.35355 9.85304C7.44732 9.75928 7.5 9.6321 7.5 9.49949V4.94949C8.10702 4.82558 8.64641 4.4807 9.0136 3.9817C9.38078 3.48269 9.54961 2.86513 9.48734 2.24873C9.42507 1.63233 9.13614 1.061 8.67658 0.645522C8.21701 0.23004 7.61954 0 7 0C6.38046 0 5.78299 0.23004 5.32342 0.645522C4.86385 1.061 4.57493 1.63233 4.51266 2.24873C4.45039 2.86513 4.61921 3.48269 4.9864 3.9817C5.35359 4.4807 5.89298 4.82558 6.5 4.94949ZM7 0.99949C7.29667 0.99949 7.58668 1.08746 7.83335 1.25229C8.08003 1.41711 8.27229 1.65138 8.38582 1.92546C8.49935 2.19955 8.52906 2.50115 8.47118 2.79213C8.4133 3.0831 8.27044 3.35037 8.06066 3.56015C7.85088 3.76993 7.58361 3.91279 7.29264 3.97067C7.00166 4.02855 6.70006 3.99884 6.42597 3.88531C6.15189 3.77178 5.91762 3.57952 5.7528 3.33285C5.58797 3.08617 5.5 2.79616 5.5 2.49949C5.5 2.10167 5.65804 1.72013 5.93934 1.43883C6.22064 1.15753 6.60218 0.99949 7 0.99949ZM14 9.49949C14 11.4482 10.3931 12.4995 7 12.4995C3.60687 12.4995 0 11.4482 0 9.49949C0 9.01574 0.238125 8.30386 1.375 7.66136C2.14125 7.22761 3.195 6.89449 4.42312 6.69761C4.48809 6.68736 4.55444 6.68999 4.61838 6.70537C4.68232 6.72076 4.74261 6.74858 4.7958 6.78726C4.84899 6.82594 4.89405 6.87472 4.92838 6.93082C4.96272 6.98691 4.98568 7.04921 4.99594 7.11418C5.0062 7.17914 5.00356 7.24549 4.98818 7.30943C4.9728 7.37338 4.94497 7.43367 4.90629 7.48686C4.86761 7.54005 4.81883 7.5851 4.76274 7.61944C4.70664 7.65378 4.64434 7.67673 4.57937 7.68699C3.48312 7.86324 2.51687 8.16387 1.86562 8.53386C1.31562 8.84324 1 9.19574 1 9.49949C1 10.3345 3.2825 11.4995 7 11.4995C10.7175 11.4995 13 10.3345 13 9.49949C13 9.19574 12.6844 8.84324 12.1344 8.53136C11.4806 8.16136 10.5169 7.86074 9.42062 7.68449C9.35428 7.67582 9.29035 7.65393 9.23263 7.62011C9.1749 7.58628 9.12455 7.54122 9.08455 7.48758C9.04456 7.43394 9.01573 7.37283 8.99979 7.30785C8.98385 7.24287 8.98111 7.17535 8.99173 7.10929C9.00236 7.04323 9.02614 6.97998 9.06165 6.92328C9.09717 6.86658 9.1437 6.81758 9.1985 6.77919C9.2533 6.7408 9.31525 6.7138 9.38067 6.69979C9.44609 6.68578 9.51366 6.68504 9.57938 6.69761C10.8075 6.89449 11.8612 7.22761 12.6275 7.66136C13.7619 8.30386 14 9.01574 14 9.49949Z"
                fill="#1E1E22"
              />
            </svg>

            <span>
              {hotelDetail?.address}
              {hotelDetail?.city ? `, ${hotelDetail.city}` : ""}
              {hotelDetail?.postalCode ? `, ${hotelDetail.postalCode}` : ""}
              {hotelDetail?.country ? `, ${hotelDetail.country}` : ""}
            </span>
            {nearbyInfo.nearbyDistanceKm &&
              nearbyInfo.firstNearbyArea?.name && (
                <>
                  <span>•</span>
                  <span>
                    {nearbyInfo.nearbyDistanceKm} km from{" "}
                    {nearbyInfo.firstNearbyArea.name}
                  </span>
                </>
              )}
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: starRatingCount }, (_, index) => (
              <img src={FilledStar} alt="icon" key={index} />
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <button className="px-6 py-2 text-[#5383DA] text-base font-medium">
            Share
          </button>
          <div className="border-l border-[#E4E4E7] h-8 mr-6 -ml-1"></div>
          <button className="px-10 py-3 bg-[#2351A3] text-[#F2F2F3] font-semibold rounded-lg text-base">
            Add to favorites
          </button>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="mt-8 w-full max-w-4xl mx-auto">
        <div
          role="tablist"
          aria-label="Profile sections"
          className="flex w-full items-center rounded-2xl ring-1 ring-[#C2CAD6] bg-white p-1 shadow-sm"
        >
          {tabs.map((t) => {
            const selected = activeTab === t;
            return (
              <Button
                key={t}
                type="button"
                aria-selected={selected}
                onClick={() => handleTabChange(t)}
                className={[
                  "flex-1 rounded-xl px-6 py-2 text-sm max-[625px]:px-3 max-[625px]:py-2 max-[625px]:text-[13px]",
                  selected
                    ? "bg-[#2351A3] text-white shadow-sm"
                    : "text-[#3D495C]",
                ].join(" ")}
                overrideClasses
              >
                {t}
              </Button>
            );
          })}
        </div>
      </div>

      {/* OVERVIEW SECTION */}
      {activeTab === "Overview" && (
        <HotelDetailOverviewSection hotelDetail={hotelDetail} />
      )}

      {/* ROOM SECTION */}
      {activeTab === "Rooms" && (
        <HotelDetailRoomSection
          // passengers={passengers}
          // hotelDetail={hotelDetail}
          hotelMoreRooms={hotelMoreRooms}
          onRoomsChange={handleRoomsChange}
        />
      )}

      {/* GUEST REVIEWS SECTION */}
      {activeTab === "Guest reviews" && <HotelDetailGuestReviewSection />}

      {/* AMENETIES SECTION */}
      {activeTab === "Ameneties" && (
        // <HotelDetailAmenetiesSection />
        <HotelDetailAmenetiesSection hotelDetail={hotelDetail} />
      )}

      {/* FAQ SECTION */}
      {activeTab === "FAQs" && <HotelDetailFaqSection />}

      {/* RULES SECTION */}
      {activeTab === "Rules" && <HotelDetailRulesSection />}

      {/* <div className="mx-auto mt-12 mb-4">
        <h4 className="text-[#0A0C0F] text-base font-bold">
          Similar properties
        </h4>
        <div className="grid grid-cols-5 gap-4 mt-6">
          {Array.from({ length: 5 }).map((_, index) => {
            return <HotellGridCard index={index} key={index} />;
          })}
        </div>
      </div> */}

      <div className="fixed bottom-4 left-0 right-0 z-50">
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(0, 0, 0, 0.001)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        ></div>

        <div className="relative max-w-5xl mx-auto px-4 py-6">
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E4E4E7] px-4 py-3">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-shrink-0 flex-1">
                <p className="text-xs text-[#3D495C]">Your selection</p>
                {selectedRooms.length > 0 ? (
                  <>
                    <p className="text-base font-medium text-[#0A0C0F]">
                      {totalRoomsCount} room{totalRoomsCount > 1 ? "s" : ""}{" "}
                      selected
                    </p>
                    <div className="mt-1 space-y-1">
                      {/* {selectedRooms.map((selectedRoom, index) => (
                        <div
                          key={selectedRoom.roomKey || index}
                          className="text-sm text-[#3D495C]"
                        >
                          <span className="font-medium">
                            {selectedRoom.count}x{" "}
                            {selectedRoom.room?.roomTypeName ||
                              "Room"}{" "}
                            - {selectedRoom.room?.ratePlan?.meal || ""}
                          </span>
                          <span className="ml-2">
                            {formatPrice(
                              (selectedRoom.room?.roomRate?.netAmount || 0) *
                                selectedRoom.count,
                              selectedRoom.room?.roomRate?.currency || "AED"
                            )}
                          </span>
                        </div>
                      ))} */}
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
                disabled={selectedRooms.length < numberOfRooms}
                // disabled={selectedRooms.length === 0}
                className={
                  selectedRooms.length >= numberOfRooms
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
                      searchKey: state.searchKey,
                      bookingParams: state.bookingParams,
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
  ) : (
    <HotelImages
      setShowHotelDetailImages={handleHideImages}
      images={primaryImages}
    />
  );
};

export default HotelDetailListing;
