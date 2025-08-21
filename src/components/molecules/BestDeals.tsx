import React, { useState } from "react";
import dubai from "../../assets/images/dubai.png";
import england from "../../assets/images/england.png";
import france from "../../assets/images/france.png";
import switzerland from "../../assets/images/switzerland.png";

type TripType = "below$199" | "below$399" | "below$699" | "below$999";

const BestDeals: React.FC = () => {
  const [trip, setTrip] = useState<TripType>("below$199");

  return (
    <section className="bg-[#FFFFFF]">
      <div className="w-full max-w-[1040px] !mt-20 m-auto">
        <h6 className="text-[12px] opacity-80">Best deals</h6>
        <h5 className="text-[40px] text-[rgba(10, 12, 15, 1)] mt-1 mb-1">
          No one can beat these prices
        </h5>
        {/* Trip type segmented control (outer border only, no inner dividers) */}
        <div className="flex mt-0 mb-7">
          <div className="flex items-center bg-white rounded-xl ring-1 ring-[#D9E2EF] p-1">
            {(
              ["below$199", "below$399", "below$699", "below$999"] as TripType[]
            ).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTrip(t)}
                className={`px-6 py-2 text-[14px] rounded-xl ${
                  trip === t ? "bg-[#2351A3] text-white" : "text-[#3A4350]"
                }`}
              >
                {t === "below$199"
                  ? "Below $199"
                  : t === "below$399"
                  ? "Below $399"
                  : t === "below$699"
                  ? "Below $699"
                  : "Below $999"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full grid md:grid-cols-4 gap-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xl:gap-x-8">
              <div className="relative group">
                <a key={""} href={""} className="group">
                  <img
                    alt={"product.imageAlt"}
                    src={switzerland}
                    className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-100 xl:aspect-7/8"
                  />
                  <div
                    className="absolute bottom-0 right-0 text-center  backdrop-blur-[0.6px] bg-black/20 w-[100%] rounded-b-[8px] transition-all duration-300 ease-in-out opacity-100 translate-y-0
                    group-hover:opacity-0 group-hover:translate-y-4"
                  >
                    <div className="flex justify-between items-center px-2 py-2">
                      <div className="text-left">
                        <p className="text-white text-[12px]">Switzerland</p>
                        <p className="text-white text-[10px] opacity-80">
                          Round-trip flights
                        </p>
                        <p className="text-white text-[10px] opacity-80">
                          4 nights hotels
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-[10px] opacity-80">
                          Starting from
                        </p>
                        <p className="text-white text-[14px]">$98</p>
                      </div>
                    </div>
                    <div className="flex justify-center mt-1 mb-3">
                      <button className="h-8 px-6 rounded-md bg-[#FFFFFF] text-[#2351A3] text-[12px] font-medium shadow-sm">
                        Book now
                      </button>
                    </div>
                  </div>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xl:gap-x-8">
              <div className="relative group">
                <a key={""} href={""} className="group">
                  <img
                    alt={"product.imageAlt"}
                    src={france}
                    className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-100 xl:aspect-7/8"
                  />
                  <div
                    className="absolute bottom-0 right-0 text-center backdrop-blur-[0.6px] bg-black/20 w-[100%] rounded-b-[8px] transition-all duration-300 ease-in-out opacity-100 translate-y-0
                    group-hover:opacity-0 group-hover:translate-y-4"
                  >
                    <div className="flex justify-between items-center px-2 py-2">
                      <div className="text-left">
                        <p className="text-white text-[12px]">France</p>
                        <p className="text-white text-[10px] opacity-80">
                          Round-trip flights
                        </p>
                        <p className="text-white text-[10px] opacity-80">
                          2 nights hotels
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-[10px] opacity-80">
                          Starting from
                        </p>
                        <p className="text-white text-[14px]">$157</p>
                      </div>
                    </div>
                    <div className="flex justify-center mt-1 mb-3">
                      <button className="h-8 px-6 rounded-md bg-[#FFFFFF] text-[#2351A3] text-[12px] font-medium shadow-sm">
                        Book now
                      </button>
                    </div>
                  </div>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xl:gap-x-8">
              <div className="relative group">
                <a key={""} href={""} className="group">
                  <img
                    alt={"product.imageAlt"}
                    src={england}
                    className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-100 xl:aspect-7/8"
                  />
                  <div
                    className="absolute bottom-0 right-0 text-center  backdrop-blur-[0.6px] bg-black/20 w-[100%] rounded-b-[8px] transition-all duration-300 ease-in-out opacity-100 translate-y-0
                    group-hover:opacity-0 group-hover:translate-y-4"
                  >
                    <div className="flex justify-between items-center px-2 py-2">
                      <div className="text-left">
                        <p className="text-white text-[12px]">England</p>
                        <p className="text-white text-[10px] opacity-80">
                          Round-trip flights
                        </p>
                        <p className="text-white text-[10px] opacity-80">
                          2 nights hotels
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-[10px] opacity-80">
                          Starting from
                        </p>
                        <p className="text-white text-[14px]">$132</p>
                      </div>
                    </div>
                    <div className="flex justify-center mt-1 mb-3">
                      <button className="h-8 px-6 rounded-md bg-[#FFFFFF] text-[#2351A3] text-[12px] font-medium shadow-sm">
                        Book now
                      </button>
                    </div>
                  </div>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xl:gap-x-8">
              <div className="relative group">
                <a key={""} href={""} className="group">
                  <img
                    alt={"product.imageAlt"}
                    src={dubai}
                    className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-100 xl:aspect-7/8"
                  />
                  <div
                    className="absolute bottom-0 right-0  backdrop-blur-[0.6px] bg-black/20 w-[100%] rounded-b-[8px] transition-all duration-300 ease-in-out opacity-100 translate-y-0
                    group-hover:opacity-0 group-hover:translate-y-4"
                  >
                    <div className="flex justify-between items-center px-2 py-2">
                      <div className="text-left">
                        <p className="text-white text-[12px]">Dubai</p>
                        <p className="text-white text-[10px] opacity-80">
                          Round-trip flights
                        </p>
                        <p className="text-white text-[10px] opacity-80">
                          4 nights hotels
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-[10px] opacity-80">
                          Starting from
                        </p>
                        <p className="text-white text-[14px]">$189</p>
                      </div>
                    </div>
                    <div className="flex justify-center mt-1 mb-3">
                      <button className="h-8 px-6 rounded-md bg-[#FFFFFF] text-[#2351A3] text-[12px] font-medium shadow-sm">
                        Book now
                      </button>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-12">
          <button className="h-10 px-8 rounded-md bg-[#2351A3] text-white text-[14px] font-medium shadow-sm">
            Explore flights and hotels
          </button>
        </div>
      </div>
    </section>
  );
};

export default BestDeals;
