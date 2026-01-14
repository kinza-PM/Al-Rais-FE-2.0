import React, { useEffect, useMemo, useRef, useState } from "react";
import { Carousel } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";

import travelMain1 from "../../assets/images/travel_main_img.png";
import travelMain2 from "../../assets/images/travel_main_img2.png";
import travelPlane from "../../assets/images/travel_plane_image.png";

type Product = "flights" | "hotels" | "cars" | "packages";

type Props = {
  product: Product;
  onProductChange: (p: Product) => void;
};

const pillStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 14px",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 13,
  border: active ? "1px solid #2351A3" : "1px solid rgba(255,255,255,0.65)",
  background: active ? "#2351A3" : "rgba(255,255,255,0.92)",
  color: active ? "#fff" : "#111827",
  boxShadow: active ? "0 8px 20px rgba(2,6,23,0.18)" : "none",
});

const arrowStyle: React.CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 999,
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#CBD5E1",
};

const HeroCarousel: React.FC<Props> = ({ product, onProductChange }) => {
  const sliderRef = useRef<any>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const slides = useMemo(
    () => [
      { image: travelMain1 },
      { image: travelMain2 },
      { image: travelPlane },
    ],
    []
  );

  const handleProductClick = (p: Product) => {
    if (p === "cars" || p === "packages") {
      toast("Coming soon");
      return;
    }
    onProductChange(p);
  };

  return (
    <div className="w-full flex justify-center px-4 mt-8">
      <div
        className="relative w-full max-w-[1200px] overflow-hidden"
        style={{ borderRadius: 28 }}
      >
        <Carousel
          ref={sliderRef}
          dots={false}
          autoplay
          autoplaySpeed={6000}
          beforeChange={(_, next) => setActiveSlide(next)}
        >
          {slides.map((s, idx) => (
            <div key={idx}>
              <div
                className="relative"
                style={{ height: 420, width: "100%", overflow: "hidden" }}
              >
                <img
                  src={s.image}
                  alt={`hero-slide-${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    transform: activeSlide === idx ? "scale(1.02)" : "scale(1)",
                    transition: "transform 700ms ease",
                  }}
                />

                {/* Left red panel (approx) */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "58%",
                    background: "#B30017",
                    // Match Figma: diagonal wedge with rounded end
                    clipPath:
                      "polygon(0% 0%, 68% 0%, 88% 50%, 68% 100%, 0% 100%)",
                    borderTopLeftRadius: 28,
                    borderBottomLeftRadius: 28,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: 48,
                    top: 130,
                    zIndex: 2,
                    maxWidth: 520,
                    color: "white",
                    fontWeight: 700,
                    fontSize: 54,
                    lineHeight: "1.05",
                  }}
                >
                  <div>Experience</div>
                  <div>the true richness</div>
                  <div>of travel.</div>
                </div>

                {/* Top-right badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    zIndex: 3,
                    background: "rgba(255,255,255,0.96)",
                    borderRadius: 16,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    boxShadow: "0 10px 25px rgba(2,6,23,0.20)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      background: "#E11D48",
                    }}
                  />
                  <div style={{ lineHeight: 1.05 }}>
                    <div style={{ fontWeight: 800, color: "#111827" }}>
                      Japan.
                    </div>
                    <div style={{ fontSize: 13, color: "#374151" }}>
                      Endless Discovery.
                    </div>
                  </div>
                </div>

                {/* Arrows */}
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() => sliderRef.current?.prev?.()}
                  style={{
                    ...arrowStyle,
                    position: "absolute",
                    left: isNarrow ? 18 : -70,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 3,
                  }}
                >
                  <LeftOutlined style={{ fontSize: isNarrow ? 18 : 34 }} />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() => sliderRef.current?.next?.()}
                  style={{
                    ...arrowStyle,
                    position: "absolute",
                    right: isNarrow ? 18 : -70,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 3,
                  }}
                >
                  <RightOutlined style={{ fontSize: isNarrow ? 18 : 34 }} />
                </button>

                {/* Bottom product pills */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: 16,
                    transform: "translateX(-50%)",
                    zIndex: 3,
                    display: "flex",
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleProductClick("flights")}
                    style={pillStyle(product === "flights")}
                  >
                    FLIGHTS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProductClick("hotels")}
                    style={pillStyle(product === "hotels")}
                  >
                    HOTELS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProductClick("cars")}
                    style={pillStyle(product === "cars")}
                  >
                    CARS
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProductClick("packages")}
                    style={pillStyle(product === "packages")}
                  >
                    PACKAGES
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default HeroCarousel;

