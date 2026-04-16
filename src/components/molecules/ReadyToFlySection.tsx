import React, { useEffect, useRef, useState } from "react";

const MAP_IMAGE_SRC = "/map1.png";

const ReadyToFlySection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(90deg, rgb(83, 131, 218) 0%, rgb(35, 81, 163) 50%, rgb(8, 19, 38) 100%)",
      }}
    >
      <div className="relative mx-auto flex min-h-[280px] w-full max-w-[1920px] flex-col items-center px-4 py-8 sm:px-8 sm:py-10 lg:min-h-[361px] lg:flex-row lg:items-center lg:py-0 lg:pl-[10rem] lg:pr-0">

        {/* Left: text — slides in from left */}
        <div
          className={[
            "relative z-10 flex w-full flex-1 flex-col justify-center text-center lg:text-left",
            "transition-all duration-700 ease-out",
            visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10",
          ].join(" ")}
        >
          <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl lg:max-w-[480px]">
            Ready to take a trip around the world with us?
          </h2>
          <p
            className={[
              "mx-auto mt-3 max-w-[420px] text-sm font-normal leading-relaxed text-white/90 sm:text-base lg:mx-0",
              "transition-all duration-700 ease-out",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
            ].join(" ")}
            style={{ transitionDelay: visible ? "180ms" : "0ms" }}
          >
            Book your travel with our reliable, transparent platform that is
            committed to customer satisfaction.
          </p>
        </div>

        {/* Right: world-map image — slides in from right + subtle float loop */}
        <div
          className={[
            "relative z-[1] mt-6 flex w-full shrink-0 justify-center lg:mt-0 lg:w-[52%] lg:justify-end",
            "transition-all duration-700 ease-out",
            visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10",
          ].join(" ")}
          style={{ transitionDelay: visible ? "120ms" : "0ms" }}
        >
          <img
            src={MAP_IMAGE_SRC}
            alt="World map with flight route"
            className={[
              "h-auto w-full max-w-[320px] object-contain sm:max-w-[400px] md:max-w-[460px] lg:max-w-none lg:w-full",
              // gentle float animation once visible
              visible ? "animate-[mapFloat_5s_ease-in-out_infinite]" : "",
            ].join(" ")}
          />
        </div>
      </div>
    </section>
  );
};

export default ReadyToFlySection;
