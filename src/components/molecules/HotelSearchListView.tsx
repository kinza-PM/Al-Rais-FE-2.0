import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHotelStore } from "../../store/UseHotelStore";
import Loader from "../atoms/Loader";
import toast from "react-hot-toast";
import {
  useAddHotelFavourite,
  useGetHotelFavourites,
} from "../../hooks/useHotelSearch";
import { extractErrorFromAxiosApiError } from "../../utils/apiErrorHanlder";
import ShareTicketModal from "../atoms/ShareTicketModal";
import { useProgressiveList } from "../../hooks/useProgressiveList";
import HotelListCard from "./HotelListCard";

type HotelSearchListViewProps = {
  hotels: Array<any>;
  listResetKey?: number;
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
    params.set("bookingParams", JSON.stringify(bookingParams));
  }

  const queryString = params.toString();

  return `${window.location.origin}/hotel-detail/${hotelKey}${queryString ? `?${queryString}` : ""
    }`;
};

const HotelSearchListView: React.FC<HotelSearchListViewProps> = React.memo(
  ({ hotels, listResetKey = 0 }) => {
    const navigate = useNavigate();
    const { hotel: bookingParams } = useHotelStore();

    const [openShareModal, setOpenShareModal] = useState(false);
    const [selectedShareHotel, setSelectedShareHotel] = useState<any>(null);

    const {
      mutateAsync: addHotelFavouriteAsync,
      isPending: isAddFavouritePending,
    } = useAddHotelFavourite();

    const {
      data: favouriteHotelsResponse,
      isLoading: isGetFavouritesLoading,
      refetch: refetchFavourites,
    } = useGetHotelFavourites(hotels.length > 0);

    const { visible, sentinelRef, hasMore } = useProgressiveList(
      hotels,
      24,
      listResetKey,
    );

    const [favorites, setFavorites] = useState<Record<string, boolean>>({});

    const favouriteItems = useMemo(() => {
      const payload = (favouriteHotelsResponse as any)?.data ?? favouriteHotelsResponse;
      if (Array.isArray(payload)) return payload;
      if (payload && typeof payload === "object") {
        return Object.values(payload).flatMap((items: any) =>
          Array.isArray(items) ? items : []
        );
      }
      return [];
    }, [favouriteHotelsResponse]);

    useEffect(() => {
      const next: Record<string, boolean> = {};

      favouriteItems.forEach((item: any) => {
        if (item?.hotelKey) {
          next[item.hotelKey] = true;
        }
      });

      setFavorites(next);
    }, [favouriteItems]);

    const buildFavouritePayload = useCallback((hotel: any, flag: boolean) => {
      const rooms =
        Array.isArray(hotel?.rooms) && hotel.rooms.length > 0
          ? hotel.rooms.map((room: any) => ({
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
          }))
          : [];

      const rawFacilities = hotel?.propertyInfo?.facilities || [];
      const facilities = rawFacilities
        .map((f: any) => (typeof f === "string" ? f : f?.name))
        .filter(Boolean);

      const totalPrice =
        Number(hotel?.totalPrice) ||
        rooms.reduce(
          (sum: number, room: any) => sum + (room?.roomRate?.netAmount || 0),
          0
        );

      return {
        hotelKey: hotel?.hotelKey ?? "",
        propertyInfo: {
          providerHotelId:
            hotel?.propertyInfo?.providerHotelId?.toString() ||
            hotel?.propertyInfo?.hotelCode?.toString() ||
            "",
          hotelName: hotel?.propertyInfo?.hotelName ?? "",
          address: hotel?.propertyInfo?.address ?? "",
          phoneNumber: hotel?.propertyInfo?.phoneNumber ?? "",
          location: hotel?.propertyInfo?.location ?? "",
          latitude: hotel?.propertyInfo?.latitude?.toString() ?? "",
          longitude: hotel?.propertyInfo?.longitude?.toString() ?? "",
          imageUrl: hotel?.propertyInfo?.imageUrl ?? "",
          facilities,
          propertyType: hotel?.propertyInfo?.propertyType ?? "",
          starRating: hotel?.propertyInfo?.starRating?.toString() ?? "",
        },
        rooms,
        totalPrice,
        searchKey: hotel?.searchKey ?? "",
        city: bookingParams?.city || hotel?.propertyInfo?.location || "",
        flag,
      };
    }, [bookingParams?.city]);

    const handleToggleFavourite = useCallback(
      async (hotel: any) => {
        const hotelKey = hotel?.hotelKey;
        if (!hotelKey) return;

        const currentlyFavourite = !!favorites[hotelKey];
        const nextFlag = !currentlyFavourite;

        const payload = buildFavouritePayload(hotel, nextFlag);

        setFavorites((prev) => ({
          ...prev,
          [hotelKey]: nextFlag,
        }));

        try {
          await addHotelFavouriteAsync(payload);

          toast.success(
            nextFlag
              ? "Hotel added to favourites"
              : "Hotel removed from favourites"
          );

          await refetchFavourites();
        } catch (error) {
          setFavorites((prev) => ({
            ...prev,
            [hotelKey]: currentlyFavourite,
          }));

          const err = extractErrorFromAxiosApiError(error);
          toast.error(err || "Failed to update favourite");
        }
      },
      [
        favorites,
        buildFavouritePayload,
        addHotelFavouriteAsync,
        refetchFavourites,
      ]
    );

    const handleShareClick = useCallback((hotel: any) => {
      setSelectedShareHotel(hotel);
      setOpenShareModal(true);
    }, []);

    const handleCheckAvailability = useCallback(
      (hotel: any) => {
        const hotelKey = hotel?.hotelKey ?? "";
        const searchKey = hotel?.searchKey ?? "";

        if (!hotelKey) return;

        const detailUrl = buildHotelShareUrl(
          hotelKey,
          searchKey,
          bookingParams ?? null
        );
        const url = new URL(detailUrl);
        navigate(`${url.pathname}${url.search}`, {
          state: {
            searchKey,
            bookingParams: bookingParams ?? undefined,
          },
        });
      },
      [navigate, bookingParams]
    );

    if (!hotels || hotels.length === 0) {
      return (
        <>
          <Loader
            show={
              isAddFavouritePending ||
              (isGetFavouritesLoading && favouriteHotelsResponse == null)
            }
            label={
              isGetFavouritesLoading
                ? "Loading favourites..."
                : "Updating favourites..."
            }
          />
          <div className="py-16 flex flex-col items-center text-center">
            <p className="mt-2 text-[14px] text-[#0F172A]">No hotels found</p>
          </div>
        </>
      );
    }

    return (
      <>
        <Loader
          show={
            isAddFavouritePending ||
            (isGetFavouritesLoading && favouriteHotelsResponse == null)
          }
          label={
            isGetFavouritesLoading
              ? "Loading favourites..."
              : "Updating favourites..."
          }
        />

        <div className="min-h-screen">
          <div className="w-full">
            {visible.map((hotel, index) => {
              const isFavourite = !!favorites[hotel.hotelKey];

              return (
                <HotelListCard
                  key={hotel.hotelKey || index}
                  hotel={hotel}
                  isFavourite={isFavourite}
                  isAddFavouritePending={isAddFavouritePending}
                  onToggleFavourite={handleToggleFavourite}
                  onShare={handleShareClick}
                  onCheckAvailability={handleCheckAvailability}
                />
              );
            })}
            {hasMore ? (
              <div
                ref={sentinelRef}
                className="h-10 w-full shrink-0"
                aria-hidden
              />
            ) : null}
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
              bookingParams ?? null
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
  }
);

HotelSearchListView.displayName = "HotelSearchListView";

export default HotelSearchListView;