import Button from "../atoms/Button";

const HotelDetailGuestReviewSection = () => {
  const cardGuestReviews = [
    {
      name: "Staff",
    },
    {
      name: "Facilities",
    },
    {
      name: "Cleanliness",
    },
    {
      name: "Comfort",
    },
    {
      name: "Value for money",
    },
    {
      name: "Location",
    },
    {
      name: "Free Wi-Fi",
    },
  ];
  return (
    <div className="mt-6">
      <h4 className="text-[#0A0C0F] text-base font-bold">Guest reviews</h4>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#A7C0EC] text-[#2351A3] font-semibold text-sm px-6 py-3 rounded-[50px]">
            9.1
          </div>
          <div className="text-left">
            <div className="text-[#00B868] font-semibold text-sm mb-0.5">
              Excellent
            </div>
            <div className="text-sm text-[#3D495C]">283 guest reviews</div>
          </div>
        </div>
        <Button
          type="button"
          overrideClasses
          className="bg-[#2351A3] text-[#F2F2F3] text-sm font-semibold px-8 py-3 border-none rounded-lg"
        >
          Read all reviews
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-5">
        {cardGuestReviews.map((review, index) => {
          return (
            <div
              className="w-full bg-[#FFFFFF] border border-[#E4E4E7] rounded-2xl px-6 py-5"
              key={index}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0A0C0F] font-semibold text-base">
                  <UserProfileSvgIcon />
                  {review.name}
                </div>
                <span className="text-[#0A0C0F] text-base">9.2</span>
              </div>

              <div className="mt-4 h-2 w-full bg-[#F2F2F3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2351A3] rounded-full"
                  style={{ width: `${(9.2 / 10) * 95}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <h6 className="text-[#0A0C0F] text-sm font-semibold">
          Select topics to read related reviews
        </h6>
        <div className="mt-3 flex items-center gap-2">
          <Button
            type="button"
            overrideClasses
            className="bg-none border border-[#5383DA] rounded-full px-5 py-2 flex items-center gap-1 text-[13px] text-[#3D495C]"
          >
            <AddSvgIcon />
            Breakfast
          </Button>
          <Button
            type="button"
            overrideClasses
            className="bg-none border border-[#5383DA] rounded-full px-5 py-2 flex items-center gap-2 text-[13px] text-[#3D495C]"
          >
            <AddSvgIcon />
            Room
          </Button>
          <Button
            type="button"
            overrideClasses
            className="bg-none border border-[#5383DA] rounded-full px-5 py-2 flex items-center gap-2 text-[13px] text-[#3D495C]"
          >
            <AddSvgIcon />
            Location
          </Button>
          <Button
            type="button"
            overrideClasses
            className="bg-none border border-[#5383DA] rounded-full px-5 py-2 flex items-center gap-2 text-[13px] text-[#3D495C]"
          >
            <AddSvgIcon />
            Clean
          </Button>
          <Button
            type="button"
            overrideClasses
            className="bg-none border border-[#5383DA] rounded-full px-5 py-2 flex items-center gap-2 text-[13px] text-[#3D495C]"
          >
            <AddSvgIcon />
            Dinner
          </Button>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => {
          return (
            <div
              className="w-full bg-[#FFFFFF] border border-[#E4E4E7] rounded-2xl p-4"
              key={index}
            >
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#D9D9D9] flex-shrink-0" />

                <div>
                  <h4 className="text-[#0A0C0F] font-semibold text-sm">
                    Person name
                  </h4>
                  <p className="text-[#3D495C] text-sm mt-0.5">Location</p>
                </div>
              </div>

              <p className="mt-4 text-[#3D495C] text-sm">
                I recently stayed at The Nishat Hotel and it was an amazing
                experience. The staff were incredibly welcoming and attentive,
                ensuring all my needs were met. The room was spacious and
                beautifully decorated, offering a stunning view of the ocean.
                The amenities were top-notch, especially the pool area, which
                was perfect for relaxing after a day of exploring. I also
                enjoyed the complimentary breakfast, which had a great variety
                of options. Overall, I highly recommend The Nishat Hotel for
                anyone looking for a relaxing getaway!
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HotelDetailGuestReviewSection;

const UserProfileSvgIcon = () => {
  return (
    <svg
      width="20"
      height="19"
      viewBox="0 0 20 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.4082 17.6276C17.9803 15.1591 15.78 13.3891 13.2122 12.5501C14.4824 11.7939 15.4692 10.6417 16.0212 9.27048C16.5731 7.89922 16.6597 6.38468 16.2676 4.95945C15.8755 3.53422 15.0264 2.27711 13.8506 1.38117C12.6749 0.485228 11.2376 0 9.75941 0C8.28122 0 6.84391 0.485228 5.66818 1.38117C4.49246 2.27711 3.64334 3.53422 3.25123 4.95945C2.85911 6.38468 2.94569 7.89922 3.49765 9.27048C4.04961 10.6417 5.03644 11.7939 6.3066 12.5501C3.73878 13.3882 1.53847 15.1582 0.110659 17.6276C0.0582987 17.7129 0.0235684 17.8079 0.00851736 17.9069C-0.00653367 18.006 -0.00160057 18.107 0.0230256 18.2041C0.0476518 18.3011 0.0914723 18.3923 0.151901 18.4722C0.212331 18.552 0.288144 18.619 0.37487 18.6691C0.461595 18.7192 0.557476 18.7514 0.656854 18.7638C0.756232 18.7763 0.857095 18.7687 0.953492 18.7415C1.04989 18.7143 1.13987 18.6681 1.21812 18.6056C1.29637 18.5431 1.3613 18.4656 1.4091 18.3776C3.17535 15.3251 6.29722 13.5026 9.75941 13.5026C13.2216 13.5026 16.3435 15.3251 18.1097 18.3776C18.1575 18.4656 18.2225 18.5431 18.3007 18.6056C18.379 18.6681 18.4689 18.7143 18.5653 18.7415C18.6617 18.7687 18.7626 18.7763 18.862 18.7638C18.9613 18.7514 19.0572 18.7192 19.1439 18.6691C19.2307 18.619 19.3065 18.552 19.3669 18.4722C19.4273 18.3923 19.4712 18.3011 19.4958 18.2041C19.5204 18.107 19.5254 18.006 19.5103 17.9069C19.4952 17.8079 19.4605 17.7129 19.4082 17.6276ZM4.50941 6.75255C4.50941 5.7142 4.81732 4.69917 5.39419 3.83581C5.97107 2.97245 6.79101 2.29954 7.75032 1.90218C8.70963 1.50482 9.76523 1.40086 10.7836 1.60343C11.802 1.806 12.7375 2.30601 13.4717 3.04024C14.2059 3.77447 14.706 4.70993 14.9085 5.72833C15.1111 6.74673 15.0071 7.80233 14.6098 8.76164C14.2124 9.72095 13.5395 10.5409 12.6762 11.1178C11.8128 11.6946 10.7978 12.0026 9.75941 12.0026C8.36748 12.0011 7.03299 11.4475 6.04874 10.4632C5.0645 9.47897 4.5109 8.14448 4.50941 6.75255Z"
        fill="#1E1E22"
      />
    </svg>
  );
};

const AddSvgIcon = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 7.5C15 7.66576 14.9342 7.82473 14.8169 7.94194C14.6997 8.05915 14.5408 8.125 14.375 8.125H8.125V14.375C8.125 14.5408 8.05915 14.6997 7.94194 14.8169C7.82473 14.9342 7.66576 15 7.5 15C7.33424 15 7.17527 14.9342 7.05806 14.8169C6.94085 14.6997 6.875 14.5408 6.875 14.375V8.125H0.625C0.45924 8.125 0.300269 8.05915 0.183058 7.94194C0.0658481 7.82473 0 7.66576 0 7.5C0 7.33424 0.0658481 7.17527 0.183058 7.05806C0.300269 6.94085 0.45924 6.875 0.625 6.875H6.875V0.625C6.875 0.45924 6.94085 0.300269 7.05806 0.183058C7.17527 0.0658481 7.33424 0 7.5 0C7.66576 0 7.82473 0.0658481 7.94194 0.183058C8.05915 0.300269 8.125 0.45924 8.125 0.625V6.875H14.375C14.5408 6.875 14.6997 6.94085 14.8169 7.05806C14.9342 7.17527 15 7.33424 15 7.5Z"
        fill="#2351A3"
      />
    </svg>
  );
};
