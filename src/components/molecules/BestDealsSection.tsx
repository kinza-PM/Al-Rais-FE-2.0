import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Modal, message } from "antd";
import { useAuth } from "../../features/auth/hooks/useAuth";

import CardImage1 from "../../assets/images/card-images (1).jpg";
import CardImage2 from "../../assets/images/card-images (2).jpg";
import CardImage3 from "../../assets/images/card-images (3).jpg";
import CardImage4 from "../../assets/images/card-images (4).jpg";

type Deal = {
  id: string;
  name: string;
  image: string;
  price: number;
  hotelNights: number;
};

const ALL_DEALS: Deal[] = [
  {
    id: "1",
    name: "Switzerland",
    image: CardImage1,
    price: 98,
    hotelNights: 4,
  },
  {
    id: "2",
    name: "France",
    image: CardImage2,
    price: 157,
    hotelNights: 2,
  },
  {
    id: "3",
    name: "England",
    image: CardImage3,
    price: 132,
    hotelNights: 2,
  },
  {
    id: "4",
    name: "Dubai",
    image: CardImage4,
    price: 189,
    hotelNights: 4,
  },
];

const PRICE_FILTERS: { maxPrice: number; label: string }[] = [
  { maxPrice: 199, label: "Below $199" },
  { maxPrice: 399, label: "Below $399" },
  { maxPrice: 699, label: "Below $699" },
  { maxPrice: 999, label: "Below $999" },
];

const DealCard: React.FC<{ d: Deal }> = ({ d }) => {
  const { isAuthenticated } = useAuth();
  const [successVisible, setSuccessVisible] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);

  const handleBookNow = () => {
    if (isAuthenticated) setSuccessVisible(true);
    else setLoginVisible(true);
  };

  const handleLoginRedirect = () => {
    message.info("Redirecting to login...");
    window.location.href = "/auth";
  };

  return (
    <article className="relative h-[410px] w-full max-w-[348px] overflow-hidden rounded-[16px] shadow-[0_8px_24px_rgba(8,19,38,0.08)]">
      <img
        src={d.image}
        alt={d.name}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        className="absolute inset-x-0 bottom-0 flex h-[162px] flex-col px-5 pb-4 pt-3 text-white"
        style={{
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          background: "#00000033",
          WebkitBackdropFilter: "blur(10px)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex min-h-0 flex-1 gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold leading-tight tracking-tight text-white sm:text-[19px]">
              {d.name}
            </h3>
            <p className="mt-1.5 text-[13px] font-normal leading-snug text-white/95">
              Round-trip flights
            </p>
            <p className="text-[13px] font-normal leading-snug text-white/95">
              {d.hotelNights} nights hotels
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-medium leading-tight text-white/90">
              Starting from
            </p>
            <p className="mt-0.5 text-[22px] font-bold leading-none tracking-tight text-white">
              ${d.price}
            </p>
          </div>
        </div>

        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={handleBookNow}
            className="inline-flex h-[47px] w-[160px] shrink-0 items-center justify-center gap-[10px] rounded-[8px] bg-[#FFFFFF] px-10 py-[14px] text-[14px] font-semibold leading-none text-[#2351A3] shadow-sm transition-colors hover:bg-[#F8FAFC] active:bg-[#EEF2F7]"
          >
            Book now
          </button>
        </div>
      </div>

      <Modal
        open={successVisible}
        onOk={() => setSuccessVisible(false)}
        onCancel={() => setSuccessVisible(false)}
        okText="Great!"
        title="Booking Successful"
      >
        <p>Your trip has been booked successfully!</p>
      </Modal>

      <Modal
        open={loginVisible}
        onOk={handleLoginRedirect}
        onCancel={() => setLoginVisible(false)}
        okText="Login"
        cancelText="Cancel"
        title="Login Required"
      >
        <p>Please login to book your trip.</p>
      </Modal>
    </article>
  );
};

const BestDealsSection: React.FC = () => {
  const [maxPrice, setMaxPrice] = useState(199);

  const visibleDeals = useMemo(
    () => ALL_DEALS.filter((d) => d.price <= maxPrice),
    [maxPrice],
  );

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
      <div className="text-center sm:text-left">
        <p className="text-sm font-medium text-[#3D495C]">Best deals</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#081326] sm:text-4xl md:text-[40px] md:leading-[1.15]">
          No one can beat these prices
        </h2>
      </div>

      <div className="best-deals-filters-row mt-8 flex flex-wrap justify-center gap-2 sm:mt-10 sm:justify-start">
        {PRICE_FILTERS.map((tab) => {
          const active = maxPrice === tab.maxPrice;
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setMaxPrice(tab.maxPrice)}
              className={`h-10 min-w-[104px] rounded-full px-4 text-xs font-semibold transition-colors sm:h-11 sm:min-w-[118px] sm:px-5 sm:text-[13px] ${
                active
                  ? "bg-[#2351A3] text-white shadow-[0_6px_18px_rgba(2,6,23,0.18)]"
                  : "border border-[#D1D9E6] bg-white text-[#081326] hover:border-[#2351A3]/40 hover:bg-[#F8FAFC]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:justify-items-start">
        {visibleDeals.map((d) => (
          <DealCard key={d.id} d={d} />
        ))}
      </div>

      {visibleDeals.length === 0 && (
        <p className="mt-8 text-center text-sm text-[#3D495C]">
          No deals match this range. Try a higher price filter.
        </p>
      )}

      <div className="mt-10 flex justify-center sm:mt-12">
        <Link
          to="/search_flight"
          className="inline-flex h-12 w-full max-w-[520px] items-center justify-center rounded-[12px] bg-[#081326] text-sm font-semibold text-white transition-colors hover:bg-[#0f2744] sm:text-[15px]"
        >
          Explore more deals
        </Link>
      </div>
    </div>
  );
};

export default BestDealsSection;
