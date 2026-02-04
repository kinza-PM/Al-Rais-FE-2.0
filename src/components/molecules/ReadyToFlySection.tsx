import React from "react";

const SECTION_HEIGHT = 361.68;
const TEXT_AREA_MIN_HEIGHT = 350.68;
const MAP_WIDTH = 420;
const MAP_HEIGHT = 380;

// Image from public folder so it always loads (no bundler path issues)
const MAP_IMAGE_SRC = "/map1.png";

const ReadyToFlySection: React.FC = () => {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        minHeight: SECTION_HEIGHT,
        background:
          "linear-gradient(90deg, rgb(83, 131, 218) 0%, rgb(35, 81, 163) 50%, rgb(8, 19, 38) 100%)",
      }}
    >
      <div
        className="relative mx-auto flex min-h-full w-full max-w-[1920px] items-center"
        style={{ minHeight: SECTION_HEIGHT }}
      >
        {/* Left: text area — min-height 350.68px */}
        <div
          className="relative z-10 flex flex-1 flex-col justify-center px-8 py-12 sm:pr-16 md:pr-20 lg:pr-[51rem]"
          style={{ minHeight: TEXT_AREA_MIN_HEIGHT }}
        >
          <h2 className="text-left text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
            Ready to take a trip around the world with us?
          </h2>
          <p className="mt-3 max-w-[420px] text-left text-sm font-normal leading-relaxed text-white/90 sm:text-base">
            Book your travel with our reliable, transparent platform that is
            committed to customer satisfaction.
          </p>
          {/* <button
            type="button"
            className="mt-6 rounded-md bg-white px-6 py-2.5 text-sm font-medium text-[#2351A3] shadow-sm transition-opacity hover:opacity-95"
          >
            Book a flight
          </button> */}
        </div>

        {/* Right: map image — smaller size, right side, opacity 1 */}
        <div
          className="absolute right-4 bottom-0 top-0 z-[1] flex flex-shrink-0 items-center overflow-hidden sm:right-6 md:right-[7rem]"
          style={{
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
          }}
        >
          <img
            src={MAP_IMAGE_SRC}
            alt=""
            className="h-full w-full object-contain object-left"
            style={{
              width: MAP_WIDTH,
              height: MAP_HEIGHT,
              opacity: 1,
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default ReadyToFlySection;
