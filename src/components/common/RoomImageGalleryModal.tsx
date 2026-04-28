import { useEffect, useMemo, useState } from "react";
import { Modal } from "antd";

type RoomImageGalleryModalProps = {
  open: boolean;
  images: string[];
  initialIndex?: number;
  roomTitle?: string;
  onClose: () => void;
};

export default function RoomImageGalleryModal({
  open,
  images,
  initialIndex = 0,
  roomTitle = "Room images",
  onClose,
}: RoomImageGalleryModalProps) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  useEffect(() => {
    if (!open) return;
    const boundedIndex =
      initialIndex >= 0 && initialIndex < safeImages.length ? initialIndex : 0;
    setSelectedIndex(boundedIndex);
  }, [open, initialIndex, safeImages.length]);

  const selectedImage = safeImages[selectedIndex] || safeImages[0] || "";

  return (
    <Modal
      title={roomTitle}
      open={open}
      onCancel={onClose}
      footer={null}
      width={960}
      centered
      destroyOnClose
      styles={{
        body: { padding: 20 },
        header: { padding: "16px 20px", borderBottom: "1px solid #E5E7EB" },
      }}
    >
      <div className="flex flex-col gap-4 flex-row lg:flex-row">
        <div className="flex max-h-[420px] gap-3 overflow-x-auto lg:max-h-[540px] lg:w-[180px] lg:flex-none lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
          {safeImages.map((image, index) => {
            const selected = index === selectedIndex;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl border transition-colors lg:h-[96px] lg:w-full ${
                  selected ? "border-[#2351A3]" : "border-[#E4E4E7]"
                }`}
              >
                <img
                  src={image}
                  alt={`${roomTitle} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {selected ? (
                  <span className="absolute inset-0 ring-2 ring-inset ring-[#2351A3]" />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex min-h-[260px] flex-1 items-center justify-center overflow-hidden rounded-2xl bg-[#F8FAFC] lg:min-h-[540px] lg:min-w-0">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={roomTitle}
              className="h-full max-h-[540px] w-full object-contain"
            />
          ) : (
            <span className="text-sm text-[#64748B]">No images available</span>
          )}
        </div>
      </div>
    </Modal>
  );
}
