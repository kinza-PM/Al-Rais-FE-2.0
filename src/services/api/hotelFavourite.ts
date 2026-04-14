import { api, toApiError } from "../axios";

export type FavouritePropertyInfo = {
  providerHotelId: string;
  hotelName: string;
  address: string;
  phoneNumber: string;
  location: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
  facilities: string[];
  propertyType: string;
  starRating: string;
};

export type FavouriteRoomRate = {
  currency: string;
  netAmount: number;
  rates: {
    name: string;
    amount: number;
    from: string;
    rateIndex: string;
    to: string;
  }[];
};

export type FavouriteRatePlan = {
  supplierCode: string;
  meal: string;
  availableStatus: string;
  cancelPolicyIndicator: string;
  code: string;
  isPackage: boolean;
  fixedCombo: boolean;
  gstAssured: boolean;
  lastCancellationDate: string;
};

export type FavouriteRoom = {
  roomIndex: number;
  roomKey: string;
  roomId: string;
  roomTypeName: string;
  roomTypeDesc: string;
  maxOccupancy: number;
  roomFacilities: any[];
  ratePlan: FavouriteRatePlan;
  roomRate: FavouriteRoomRate;
  rateNotes: string;
  financialInfo: {
    tmc: string;
    supplier: string;
  };
  isAllPaxInfoMandatory: boolean;
};

export type AddHotelFavouriteRequest = {
  hotelKey: string;
  propertyInfo: FavouritePropertyInfo;
  rooms: FavouriteRoom[];
  totalPrice: number;
  searchKey: string;
  city?: string;
  flag: boolean;
};

export type GetHotelFavouriteItem = {
  hotelKey: string;
  propertyInfo: FavouritePropertyInfo;
  rooms: FavouriteRoom[];
  totalPrice: number;
  searchKey: string;
};

export async function postAddHotelFavouriteData<TResp = any>(
  body: AddHotelFavouriteRequest
): Promise<TResp> {
  const source = "postAddHotelFavouriteData";
  try {
    return await api.post<TResp>("/addHotelFavourites", body);
  } catch (err) {
    throw toApiError(source, err);
  }
}

export async function getHotelFavouritesData<TResp = GetHotelFavouriteItem[]>(
  city?: string
) {
  const source = "getHotelFavouritesData";
  try {
    return await api.get<TResp>("/getHotelFavourites", city ? { city } : undefined);
  } catch (err) {
    throw toApiError(source, err);
  }
}