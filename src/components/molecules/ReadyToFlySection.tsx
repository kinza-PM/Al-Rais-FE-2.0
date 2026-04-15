import React from "react";

// Image from public folder so it always loads (no bundler path issues)
const MAP_IMAGE_SRC = "/map1.png";

const ReadyToFlySection: React.FC = () => {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(90deg, rgb(83, 131, 218) 0%, rgb(35, 81, 163) 50%, rgb(8, 19, 38) 100%)",
      }}
    >
      <div
        className="relative mx-auto flex min-h-full w-full max-w-[1920px] flex-col items-center px-4 py-6 sm:px-6 sm:py-8 lg:min-h-[361.68px] lg:flex-row lg:items-center lg:px-0 lg:py-0"
      >
        {/* Left: text area — min-height 350.68px */}
        <div className="relative z-10 flex w-full flex-1 flex-col justify-center text-center lg:py-12 lg:text-left">
          <div
            className="lg:max-w-none lg:pl-[10rem] lg:pr-[51rem]"
          >
            <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl lg:max-w-[520px]">
              Ready to take a trip around the world with us?
            </h2>
            <p className="mt-3 mx-auto max-w-[420px] text-sm font-normal leading-relaxed text-white/90 sm:text-base lg:mx-0">
              Book your travel with our reliable, transparent platform that is
              committed to customer satisfaction.
            </p>
          </div>
          {/* <button
            type="button"
            className="mt-6 rounded-md bg-white px-6 py-2.5 text-sm font-medium text-[#2351A3] shadow-sm transition-opacity hover:opacity-95"
          >
            Book a flight
          </button> */}
        </div>

        {/* Right: map image — smaller size, right side, opacity 1 */}
        <div
          className="relative z-[1] mt-4 flex w-full justify-center overflow-hidden lg:absolute lg:bottom-0 lg:top-0 lg:right-[7rem] lg:mt-0 lg:flex-shrink-0 lg:items-center"
          style={{ width: undefined, height: undefined }}
        >
          <img
            src={MAP_IMAGE_SRC}
            alt=""
            className="h-auto w-full max-w-[190px] object-contain object-center sm:max-w-[240px] md:max-w-[300px] lg:h-full lg:w-full lg:max-w-none lg:object-left"
            style={{
              width: undefined,
              height: undefined,
              opacity: 1,
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default ReadyToFlySection;