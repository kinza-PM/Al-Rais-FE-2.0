import React, { useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

type OutletCtx = {
  setHideHeader?: (v: boolean) => void;
};

type HotelImagesProps = {
  setShowHotelDetailImages: (val: boolean) => void;
  images?: Array<{ path: string; description?: string }>;
};

const layoutSpans = [
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
];

const HotelImages: React.FC<HotelImagesProps> = ({
  setShowHotelDetailImages,
  images,
}) => {
  const { setHideHeader } = useOutletContext() as OutletCtx;

  useEffect(() => {
    setHideHeader?.(true);
    return () => {
      setHideHeader?.(false);
    };
  }, [setHideHeader]);

  const computedImages = useMemo(
    () =>
      (images ?? []).map((img, index) => ({
        url: img.path,
        description: img.description,
        span: layoutSpans[index % layoutSpans.length],
      })),
    [images]
  );

  return (
    <div className="bg-[#FFFFFF]">
      <header className="bg-[#FFFFFF] border-b border-[#E4E4E7] sticky top-0 z-10 px-16 py-3">
        <div className="flex items-center gap-4">
          <button
            className="bg-[#F2F2F3] rounded-full p-3"
            onClick={() => setShowHotelDetailImages(false)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.5 10C17.5 10.1658 17.4342 10.3247 17.3169 10.4419C17.1997 10.5592 17.0408 10.625 16.875 10.625H4.6336L9.19219 15.1828C9.25026 15.2409 9.29632 15.3098 9.32775 15.3857C9.35918 15.4616 9.37535 15.5429 9.37535 15.625C9.37535 15.7071 9.35918 15.7884 9.32775 15.8643C9.29632 15.9402 9.25026 16.0091 9.19219 16.0672C9.13412 16.1253 9.06518 16.1713 8.98931 16.2027C8.91344 16.2342 8.83213 16.2503 8.75 16.2503C8.66788 16.2503 8.58656 16.2342 8.51069 16.2027C8.43482 16.1713 8.36588 16.1253 8.30782 16.0672L2.68282 10.4422C2.62471 10.3841 2.57861 10.3152 2.54715 10.2393C2.5157 10.1635 2.49951 10.0821 2.49951 10C2.49951 9.91787 2.5157 9.83654 2.54715 9.76066C2.57861 9.68479 2.62471 9.61586 2.68282 9.55781L8.30782 3.93281C8.42509 3.81554 8.58415 3.74965 8.75 3.74965C8.91586 3.74965 9.07492 3.81554 9.19219 3.93281C9.30947 4.05009 9.37535 4.20915 9.37535 4.375C9.37535 4.54085 9.30947 4.69991 9.19219 4.81719L4.6336 9.375H16.875C17.0408 9.375 17.1997 9.44085 17.3169 9.55806C17.4342 9.67527 17.5 9.83424 17.5 10Z"
                fill="#0A0C0F"
              />
            </svg>
          </button>
          <span className="text-base font-medium text-[#0A0C0F]">
            Back to property
          </span>
        </div>
      </header>

      <div className="pl-16 py-4">
        <div className="grid grid-cols-4 gap-6">
          <div
            className="col-span-3 grid grid-cols-4 auto-rows-[190px] gap-3 mt-4"
            style={{ gridAutoFlow: "dense" }}
          >
            {computedImages.map((img, index) => (
              <div
                key={index}
                className={`${img.span} overflow-hidden rounded-2xl cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <img
                  src={img.url}
                  alt={`Hotel image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="col-span-1 border-l border-[#E4E4E7] pl-3 -mt-6 pt-2">
            {/* <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#A7C0EC] text-[#2351A3] font-semibold text-base px-6 py-3 rounded-[50px]">
                  9.1
                </div>
                <div className="text-left">
                  <div className="text-[#00B868] font-semibold text-sm mb-0.5">
                    Excellent
                  </div>
                  <div className="text-sm text-[#3D495C]">
                    283 guest reviews
                  </div>
                </div>
              </div>

              <div className="border-b border-[#E4E4E7] h-px -ml-3"></div>

              <div className="space-y-4 mt-3 mr-10">
                {[1, 2, 3].map((_, index) => (
                  <div
                    key={index}
                    className="border border-[#E4E4E7] rounded-2xl px-3 py-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-[#D9D9D9] rounded-full flex-shrink-0"></div>
                      <div className="text-sm">
                        <div className="font-semibold text-[#0A0C0F]">
                          Person name
                        </div>
                        <div className="text-[#3D495C]">Location</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      I recently stayed at The Nishat Hotel and it was an
                      amazing experience! The staff were incredibly welcoming
                      and attentive, ensuring all my needs were met. The room
                      was spacious and beautifully decorated, offering a
                      stunning view of the ocean. The amenities were top-notch,
                      especially the pool area, which was perfect for relaxing
                      after a day of exploring. I also enjoyed the complimentary
                      breakfast, which had a great variety of options. Overall,
                      I highly recommend The Nishat Hotel for anyone looking for
                      a relaxing getaway!
                    </p>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(HotelImages);
