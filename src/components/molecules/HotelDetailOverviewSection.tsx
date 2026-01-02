import IndoorSwimmingPool from "../../assets/svgs/indoor-swimming.svg";
import HotelWifi from "../../assets/svgs/hotel-wifi.svg";
import AirportShuttle from "../../assets/svgs/airport-shuttle.svg";
import HotelParking from "../../assets/svgs/parking.svg";
import FamilyRooms from "../../assets/svgs/family-rooms.svg";
import Fitness from "../../assets/svgs/fitness.svg";
import Restaurant from "../../assets/svgs/restaurant.svg";
import RoomService from "../../assets/svgs/room-service.svg";
import TeaCoffeeMaker from "../../assets/svgs/tea-coffee-maker.svg";
import HotelBreakfast from "../../assets/svgs/hotel-breakfast.svg";

const HotelDetailOverviewSection = () => {
  const hotelFacilities = [
    {
      icon: IndoorSwimmingPool,
      name: "Indoor swimming pool",
    },
    {
      icon: HotelWifi,
      name: "Free Wifi",
    },
    {
      icon: AirportShuttle,
      name: "Airport shuttle (free)",
    },
    {
      icon: HotelParking,
      name: "Free Parking",
    },
    {
      icon: FamilyRooms,
      name: "Family Rooms",
    },
    {
      icon: Fitness,
      name: "Fitness center",
    },
    {
      icon: Restaurant,
      name: "Restaurant",
    },
    {
      icon: RoomService,
      name: "Room service",
    },
    {
      icon: TeaCoffeeMaker,
      name: "Tea/Coffee maker in all rooms",
    },
    {
      icon: HotelBreakfast,
      name: "Very good breakfast",
    },
  ];
  return (
    <div className="mt-6 grid grid-cols-2 gap-x-40">
      <div>
        <h4 className="text-[#0A0C0F] text-base font-bold">
          Get the celebrity treatment with world-class service at The Nishat
          Hotel Johar Town
        </h4>
        <p className="text-[#3D495C] text-sm mt-3">
          Featuring free WiFi, The Nishat Hotel, Johar Town is city within a
          city which features Pakistan biggest "Emporium Mall" and the most
          spacious banquet halls, The Nishat Banquets. Guests can enjoy the
          on-site restaurant. Free private parking is available on site. Every
          room at this hotel is air conditioned and comes with a flat-screen TV.
          Some rooms include a seating area to relax in after a busy day. Every
          room is fitted with a private bathroom. For your comfort, you will
          find bathrobes and slippers. There is free shuttle service at the
          property. Wagah Border is 21 mi from The Nishat Hotel Johar Town,
          while Walton Airport is 5 mi from the property. Allama Iqbal Airport
          is 9.3 mi away. <br />
          Couples in particular like the location – they rated it{" "}
          <span className="font-bold">9.2</span> for a two-person trip.
        </p>
      </div>
      <div>
        <h5 className="text-[#0A0C0F] text-base font-medium">
          Most popular facilies
        </h5>
        <div className="text-[#3D495C] text-sm mt-4 flex flex-wrap items-center gap-5">
          {hotelFacilities.map((facility, index) => {
            return (
              <div className="flex items-center gap-2" key={index}>
                <img src={facility.icon} alt="icon" />
                {facility.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HotelDetailOverviewSection;
