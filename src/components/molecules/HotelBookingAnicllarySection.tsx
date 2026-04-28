import { useState } from "react";
import Button from "../atoms/Button";
import CustomToggle from "../common/CustomToggle";
import SearchableDropdown from "../common/SearchableDropdown";
import InfoPrimary from "../../assets/svgs/info-primary.svg";

type HotelBookingAnicllarySectionProps = {};

export default function HotelBookingAnicllarySection({}: HotelBookingAnicllarySectionProps) {
  const [airportShuttle, setAirportShuttle] = useState(false);
  const [carRental, setCarRental] = useState(false);
  const [bed, setBed] = useState(false);
  const [crib, setCrib] = useState(false);
  return (
    <div>
      <div className="mt-5 rounded-2xl border border-[#E4E4E7] bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
          <h3 className="text-[15px] font-medium text-[#0A0C0F]">
            Enhance your trip
          </h3>
          <Button
            overrideClasses
            className="text-[15px] font-medium text-[#5383DA] hover:underline"
          >
            Clear selection
          </Button>
        </div>
        <div>
          {/* Airport shuttle */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-xl bg-[#A7C0EC] flex items-center justify-center flex-shrink-0">
                <AirportShuttleIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-[#0A0C0F]">
                  Airport shuttle (Free)
                </h4>
                <p className="text-xs text-[#3D495C] leading-relaxed">
                  Request a free shuttle. We'll tell your accommodations you're
                  interested so they can provide details.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 ml-4">
              <div className="w-[180px]"></div>
              <CustomToggle
                checked={airportShuttle}
                onChange={() => setAirportShuttle((v) => !v)}
              />
            </div>
          </div>

          {/* Rent a car */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-xl bg-[#A7C0EC] flex items-center justify-center flex-shrink-0">
                <CarIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-[#0A0C0F]">
                  Rent a car (10% off)
                </h4>
                <p className="text-xs text-[#3D495C] leading-relaxed">
                  Save 10% on all rental cars when you book with us – we'll add
                  car rental options to your booking confirmation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 ml-4">
              <div className="text-left w-[180px]">
                <div className="text-xs text-[#3D495C]">Total cost</div>
                <div className="text-sm font-bold text-[#0A0C0F]">
                  Calculated at checkout
                </div>
              </div>
              <CustomToggle
                checked={carRental}
                onChange={() => setCarRental((v) => !v)}
              />
            </div>
          </div>

          {/* Bed */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-xl bg-[#A7C0EC] flex items-center justify-center flex-shrink-0">
                <BedIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-[#0A0C0F]">Bed</h4>
                <p className="text-xs text-[#3D495C] leading-relaxed">
                  Get an extra bed –{" "}
                  <span className="text-[#5383DA] cursor-pointer hover:underline font-semibold">
                    View policy
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 ml-4">
              <div className="text-left w-[180px]">
                <div className="text-xs text-[#3D495C]">Total cost</div>
                <div className="text-sm font-bold text-[#0A0C0F]">
                  $8<span className="text-[#3D495C]">/per night</span>
                </div>
              </div>
              <CustomToggle checked={bed} onChange={() => setBed((v) => !v)} />
            </div>
          </div>

          {/* Crib */}
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-xl bg-[#A7C0EC] flex items-center justify-center flex-shrink-0">
                <BedIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-[#0A0C0F]">Crib</h4>
                <p className="text-xs text-[#3D495C] leading-relaxed">
                  Get an extra crib –{" "}
                  <span className="text-[#5383DA] cursor-pointer hover:underline font-semibold">
                    View policy
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 ml-4">
              <div className="text-left w-[180px]">
                <div className="text-xs text-[#3D495C]">Total cost</div>
                <div className="text-sm font-bold text-[#0A0C0F]">
                  $8<span className="text-[#3D495C]">/per night</span>
                </div>
              </div>
              <CustomToggle
                checked={crib}
                onChange={() => setCrib((v) => !v)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#E4E4E7] bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
          <h3 className="text-[15px] font-medium text-[#0A0C0F]">
            Special requests (optional)
          </h3>
        </div>

        <div className="px-4 py-4 flex-1">
          <label className="block text-xs text-[#3D495C] mb-1">
            Please write your requests in English.
          </label>

          <div className="rounded-2xl border border-[#C2CAD6] p-3 h-full bg-white">
            <textarea
              placeholder="Write something..."
              aria-label="Special requests"
              className="w-full h-full min-h-[120px] resize-none bg-transparent placeholder:text-[#CBD5E1] placeholder:text-sm placeholder:text-[#C2CAD6] text-sm text-[#0A0C0F] outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[#E4E4E7] bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E4E7]">
          <h3 className="text-[15px] font-medium text-[#0A0C0F]">
            Your arrival time
          </h3>
        </div>

        <div className="px-4 py-4 flex-1">
          <div className="relative w-full">
            <SearchableDropdown
              label="Add your estimated arrival time"
              placeholder="Please select a time"
              value="0"
              options={[{ id: "1", value: "1", label: "Please select a time" }]}
              onChange={(value) => console.log(value)}
              widthClass="w-full"
              className="h-11 w-full rounded-2xl border border-[#C2CAD6] px-3 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 text-[#3D495C] text-sm mt-5">
            <img src={InfoPrimary} alt="icon" />
            Your room will be ready for check-in between 2:00 PM and 12:00 AM
          </div>
          <div className="flex items-center gap-2 text-[#3D495C] text-sm mt-2">
            <img src={InfoPrimary} alt="icon" />
            24-hour front desk – help whenever you need it!
          </div>
        </div>
      </div>
    </div>
  );
}

const AirportShuttleIcon = () => {
  return (
    <svg
      width="30"
      height="24"
      viewBox="0 0 30 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 0H8C6.93913 0 5.92172 0.421427 5.17157 1.17157C4.42143 1.92172 4 2.93913 4 4V22C4 22.5304 4.21071 23.0391 4.58579 23.4142C4.96086 23.7893 5.46957 24 6 24H9C9.53043 24 10.0391 23.7893 10.4142 23.4142C10.7893 23.0391 11 22.5304 11 22V20H19V22C19 22.5304 19.2107 23.0391 19.5858 23.4142C19.9609 23.7893 20.4696 24 21 24H24C24.5304 24 25.0391 23.7893 25.4142 23.4142C25.7893 23.0391 26 22.5304 26 22V4C26 2.93913 25.5786 1.92172 24.8284 1.17157C24.0783 0.421427 23.0609 0 22 0ZM6 18V11H24V18H6ZM6 6H24V9H6V6ZM8 2H22C22.5304 2 23.0391 2.21071 23.4142 2.58579C23.7893 2.96086 24 3.46957 24 4H6C6 3.46957 6.21071 2.96086 6.58579 2.58579C6.96086 2.21071 7.46957 2 8 2ZM9 22H6V20H9V22ZM21 22V20H24V22H21ZM12 14.5C12 14.7967 11.912 15.0867 11.7472 15.3334C11.5824 15.58 11.3481 15.7723 11.074 15.8858C10.7999 15.9993 10.4983 16.0291 10.2074 15.9712C9.91639 15.9133 9.64912 15.7704 9.43934 15.5607C9.22956 15.3509 9.0867 15.0836 9.02882 14.7926C8.97094 14.5017 9.00065 14.2001 9.11418 13.926C9.22771 13.6519 9.41997 13.4176 9.66665 13.2528C9.91332 13.088 10.2033 13 10.5 13C10.8978 13 11.2794 13.158 11.5607 13.4393C11.842 13.7206 12 14.1022 12 14.5ZM21 14.5C21 14.7967 20.912 15.0867 20.7472 15.3334C20.5824 15.58 20.3481 15.7723 20.074 15.8858C19.7999 15.9993 19.4983 16.0291 19.2074 15.9712C18.9164 15.9133 18.6491 15.7704 18.4393 15.5607C18.2296 15.3509 18.0867 15.0836 18.0288 14.7926C17.9709 14.5017 18.0007 14.2001 18.1142 13.926C18.2277 13.6519 18.42 13.4176 18.6666 13.2528C18.9133 13.088 19.2033 13 19.5 13C19.8978 13 20.2794 13.158 20.5607 13.4393C20.842 13.7206 21 14.1022 21 14.5ZM30 6V9C30 9.26522 29.8946 9.51957 29.7071 9.70711C29.5196 9.89464 29.2652 10 29 10C28.7348 10 28.4804 9.89464 28.2929 9.70711C28.1054 9.51957 28 9.26522 28 9V6C28 5.73478 28.1054 5.48043 28.2929 5.29289C28.4804 5.10536 28.7348 5 29 5C29.2652 5 29.5196 5.10536 29.7071 5.29289C29.8946 5.48043 30 5.73478 30 6ZM2 6V9C2 9.26522 1.89464 9.51957 1.70711 9.70711C1.51957 9.89464 1.26522 10 1 10C0.734784 10 0.48043 9.89464 0.292893 9.70711C0.105357 9.51957 0 9.26522 0 9V6C0 5.73478 0.105357 5.48043 0.292893 5.29289C0.48043 5.10536 0.734784 5 1 5C1.26522 5 1.51957 5.10536 1.70711 5.29289C1.89464 5.48043 2 5.73478 2 6Z"
        fill="#1A3C7A"
      />
    </svg>
  );
};

const CarIcon = () => {
  return (
    <svg
      width="32"
      height="18"
      viewBox="0 0 32 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M30 6.00001H26.4137L21 0.58626C20.815 0.399735 20.5947 0.251852 20.352 0.151209C20.1093 0.0505665 19.849 -0.000829299 19.5863 1.01186e-05H5.535C5.20649 0.000618348 4.88319 0.0821371 4.59367 0.237362C4.30415 0.392588 4.05732 0.61674 3.875 0.89001L0.1675 6.44501C0.0585648 6.60964 0.000326072 6.80261 0 7.00001L0 13C0 13.5304 0.210714 14.0392 0.585786 14.4142C0.960859 14.7893 1.46957 15 2 15H4.125C4.3453 15.8604 4.8457 16.623 5.54731 17.1676C6.24892 17.7122 7.11183 18.0079 8 18.0079C8.88817 18.0079 9.75108 17.7122 10.4527 17.1676C11.1543 16.623 11.6547 15.8604 11.875 15H20.125C20.3453 15.8604 20.8457 16.623 21.5473 17.1676C22.2489 17.7122 23.1118 18.0079 24 18.0079C24.8882 18.0079 25.7511 17.7122 26.4527 17.1676C27.1543 16.623 27.6547 15.8604 27.875 15H30C30.5304 15 31.0391 14.7893 31.4142 14.4142C31.7893 14.0392 32 13.5304 32 13V8.00001C32 7.46958 31.7893 6.96087 31.4142 6.5858C31.0391 6.21072 30.5304 6.00001 30 6.00001ZM5.535 2.00001H19.5863L23.5863 6.00001H2.875L5.535 2.00001ZM8 16C7.60444 16 7.21776 15.8827 6.88886 15.6629C6.55996 15.4432 6.30362 15.1308 6.15224 14.7654C6.00087 14.3999 5.96126 13.9978 6.03843 13.6098C6.1156 13.2219 6.30608 12.8655 6.58579 12.5858C6.86549 12.3061 7.22186 12.1156 7.60982 12.0384C7.99778 11.9613 8.39991 12.0009 8.76537 12.1523C9.13082 12.3036 9.44318 12.56 9.66294 12.8889C9.8827 13.2178 10 13.6044 10 14C10 14.5304 9.78929 15.0392 9.41421 15.4142C9.03914 15.7893 8.53043 16 8 16ZM24 16C23.6044 16 23.2178 15.8827 22.8889 15.6629C22.56 15.4432 22.3036 15.1308 22.1522 14.7654C22.0009 14.3999 21.9613 13.9978 22.0384 13.6098C22.1156 13.2219 22.3061 12.8655 22.5858 12.5858C22.8655 12.3061 23.2219 12.1156 23.6098 12.0384C23.9978 11.9613 24.3999 12.0009 24.7654 12.1523C25.1308 12.3036 25.4432 12.56 25.6629 12.8889C25.8827 13.2178 26 13.6044 26 14C26 14.5304 25.7893 15.0392 25.4142 15.4142C25.0391 15.7893 24.5304 16 24 16ZM30 13H27.875C27.6547 12.1396 27.1543 11.377 26.4527 10.8324C25.7511 10.2878 24.8882 9.99217 24 9.99217C23.1118 9.99217 22.2489 10.2878 21.5473 10.8324C20.8457 11.377 20.3453 12.1396 20.125 13H11.875C11.6547 12.1396 11.1543 11.377 10.4527 10.8324C9.75108 10.2878 8.88817 9.99217 8 9.99217C7.11183 9.99217 6.24892 10.2878 5.54731 10.8324C4.8457 11.377 4.3453 12.1396 4.125 13H2V8.00001H30V13Z"
        fill="#1A3C7A"
      />
    </svg>
  );
};

const BedIcon = () => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M27 9H4V6C4 5.73478 3.89464 5.48043 3.70711 5.29289C3.51957 5.10536 3.26522 5 3 5C2.73478 5 2.48043 5.10536 2.29289 5.29289C2.10536 5.48043 2 5.73478 2 6V26C2 26.2652 2.10536 26.5196 2.29289 26.7071C2.48043 26.8946 2.73478 27 3 27C3.26522 27 3.51957 26.8946 3.70711 26.7071C3.89464 26.5196 4 26.2652 4 26V22H30V26C30 26.2652 30.1054 26.5196 30.2929 26.7071C30.4804 26.8946 30.7348 27 31 27C31.2652 27 31.5196 26.8946 31.7071 26.7071C31.8946 26.5196 32 26.2652 32 26V14C32 12.6739 31.4732 11.4021 30.5355 10.4645C29.5979 9.52678 28.3261 9 27 9ZM4 11H13V20H4V11ZM15 20V11H27C27.7956 11 28.5587 11.3161 29.1213 11.8787C29.6839 12.4413 30 13.2044 30 14V20H15Z"
        fill="#1A3C7A"
      />
    </svg>
  );
};
