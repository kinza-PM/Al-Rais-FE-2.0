import { useState } from "react";
import { Modal } from "antd";

type SavedTraveler = {
  id: string;
  firstName: string;
  lastName: string;
  isYou: boolean;
  passport: string;
  expiry: string;
  initials: string;
  bgColor: string;
};

const mockTravelers: SavedTraveler[] = [
  {
    id: "1",
    firstName: "Zeeshan",
    lastName: "Ahmad",
    isYou: true,
    passport: "A12345678",
    expiry: "12-Dec-2029",
    initials: "ZA",
    bgColor: "bg-[#A7C0EC] text-[#1A3C7A]", // approx colors from image
  },
  {
    id: "2",
    firstName: "Fatima",
    lastName: "Zeeshan",
    isYou: false,
    passport: "B87654321",
    expiry: "27-Aug-2029",
    initials: "FZ",
    bgColor: "bg-[#85FFCA] text-[#00522E]",
  },
  {
    id: "3",
    firstName: "Khalid",
    lastName: "Ahmad",
    isYou: false,
    passport: "C65854321",
    expiry: "08-Mar-2029",
    initials: "KA",
    bgColor: "bg-[#DEDEFF] text-[#140052]",
  },
  {
    id: "4",
    firstName: "Ayesha",
    lastName: "Khalid",
    isYou: false,
    passport: "D12345678",
    expiry: "10-Jan-2030",
    initials: "AK",
    bgColor: "bg-[#A7C0EC] text-[#1A3C7A]",
  },
];

export default function SavedTravelersSection() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["1", "2"]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayTravelers =
    mockTravelers.length > 3 ? mockTravelers.slice(0, 3) : mockTravelers;
  const showViewAll = mockTravelers.length > 3;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const modalOverlayStyles = {
    backgroundColor: "rgba(10, 12, 15, 0.55)",
    backdropFilter: "blur(12px) saturate(1.4)",
    WebkitBackdropFilter: "blur(12px) saturate(1.4)",
  };

  const TravelerCard = ({
    traveler,
    isSelected,
    onToggle,
  }: {
    traveler: SavedTraveler;
    isSelected: boolean;
    onToggle: () => void;
  }) => (
    <div
      onClick={onToggle}
      className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition-colors ${isSelected
        ? "border-[#5383DA] bg-white"
        : "border-[#E4E4E7] bg-white hover:bg-gray-50"
        }`}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-[8px] border ${isSelected
            ? "border-[#21439D] bg-[#21439D]"
            : "border-[#C2CAD6] bg-transparent"
            }`}
        >
          {isSelected && (
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${traveler.bgColor}`}
      >
        {traveler.initials}
      </div>

      {/* Info */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-base font-semibold text-[#0A0C0F]">
            {traveler.firstName} {traveler.lastName}
          </span>
          {/* {traveler.isYou && (
            <span className="rounded-full bg-[#AEC2EA] px-2 py-0.5 text-[10px] font-semibold text-[#1E3A8A]">
              YOU
            </span>
          )} */}
        </div>
        <span className="truncate text-xs text-[#3D495C]">
          Passport: {traveler.passport} • Expiry: {traveler.expiry}
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-4 rounded-[16px] border border-[#E4E4E7] bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="mt-1 text-[#21439D]">
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.6251 16.877C10.6251 17.0428 10.5593 17.2017 10.442 17.3189C10.3248 17.4361 10.1659 17.502 10.0001 17.502H3.7501C3.58434 17.502 3.42537 17.4361 3.30816 17.3189C3.19095 17.2017 3.1251 17.0428 3.1251 16.877C3.1251 16.7112 3.19095 16.5523 3.30816 16.4351C3.42537 16.3178 3.58434 16.252 3.7501 16.252H10.0001C10.1659 16.252 10.3248 16.3178 10.442 16.4351C10.5593 16.5523 10.6251 16.7112 10.6251 16.877ZM13.7501 6.877C13.7528 7.9189 13.5174 8.94766 13.0619 9.88474C12.6065 10.8218 11.9429 11.6425 11.122 12.284C10.9685 12.4017 10.8439 12.5529 10.7578 12.7261C10.6717 12.8993 10.6263 13.0898 10.6251 13.2832V13.752C10.6251 14.0835 10.4934 14.4015 10.259 14.6359C10.0246 14.8703 9.70662 15.002 9.3751 15.002H4.3751C4.04358 15.002 3.72564 14.8703 3.49122 14.6359C3.2568 14.4015 3.1251 14.0835 3.1251 13.752V13.2832C3.12497 13.0921 3.08103 12.9036 2.99666 12.7322C2.91228 12.5607 2.78972 12.4109 2.63838 12.2942C1.81948 11.6564 1.15639 10.8407 0.699304 9.9088C0.24222 8.9769 0.00312013 7.95323 0.000102226 6.91528C-0.0202103 3.19184 2.98916 0.091058 6.70948 0.00199546C7.62616 -0.0200946 8.53799 0.141412 9.39132 0.477009C10.2446 0.812607 11.0222 1.31551 11.6783 1.95613C12.3343 2.59674 12.8556 3.36213 13.2114 4.20722C13.5672 5.05232 13.7504 5.96005 13.7501 6.877ZM11.2415 6.14731C11.0794 5.24207 10.6439 4.40822 9.99357 3.75801C9.34323 3.1078 8.50928 2.67246 7.60401 2.51059C7.52306 2.49694 7.44022 2.49938 7.36021 2.51775C7.2802 2.53612 7.2046 2.57007 7.13771 2.61766C7.07082 2.66525 7.01396 2.72555 6.97038 2.79511C6.9268 2.86467 6.89734 2.94214 6.8837 3.02309C6.87005 3.10404 6.87248 3.18688 6.89085 3.26689C6.90922 3.34689 6.94317 3.4225 6.99076 3.48939C7.03835 3.55628 7.09865 3.61313 7.16822 3.65672C7.23778 3.7003 7.31525 3.72976 7.3962 3.7434C8.69073 3.96137 9.78917 5.05981 10.0087 6.35668C10.0334 6.50225 10.1089 6.63436 10.2217 6.72959C10.3345 6.82483 10.4775 6.87705 10.6251 6.877C10.6604 6.87678 10.6957 6.87391 10.7306 6.8684C10.8939 6.84051 11.0395 6.74888 11.1354 6.61365C11.2312 6.47843 11.2694 6.31068 11.2415 6.14731Z" fill="#2351A3" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-medium text-[#2351A3]">
              Use your pre-saved travelers information
            </h3>
            <p className="mt-0.5 text-xs text-[#3D495C]">
              Fill the forms faster with pre-saved travelers information. You can
              manage travelers in your profile page.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {displayTravelers.map((traveler) => (
            <TravelerCard
              key={traveler.id}
              traveler={traveler}
              isSelected={selectedIds.includes(traveler.id)}
              onToggle={() => toggleSelection(traveler.id)}
            />
          ))}

          {/* View All Button */}
          {showViewAll && (
            <div className="flex items-center justify-center pt-2 md:pt-0">
              <button
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg auth-bg-btn px-8 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#1E3A8A]"
              >
                View All Travelers
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        closable={false}
        open={isModalOpen}
        footer={null}
        centered
        maskClosable
        onCancel={() => setIsModalOpen(false)}
        closeIcon={<></>}
        styles={{
          mask: modalOverlayStyles,
          body: { padding: 0 },
          content: {
            padding: 0,
            background: "transparent",
            boxShadow: "none",
          },
          wrapper: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <div className="relative z-10 w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-xl">
          {/* Modal Icon and Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 flex text-[#21439D]">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.6667 5.33325H28V7.99992H14.6667V5.33325ZM14.6667 10.6666H22.6667V13.3333H14.6667V10.6666ZM14.6667 18.6666H28V21.3333H14.6667V18.6666ZM14.6667 23.9999H22.6667V26.6666H14.6667V23.9999ZM4 5.33325H12V13.3333H4V5.33325ZM6.66667 7.99992V10.6666H9.33333V7.99992H6.66667ZM4 18.6666H12V26.6666H4V18.6666ZM6.66667 21.3333V23.9999H9.33333V21.3333H6.66667Z" fill="#2351A3" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#0A0C0F] mb-2">
              Automatically Fill the Details
            </h2>
            <p className="text-center text-base text-[#3D495C]">
              Select travelers to fill in the form automatically.
            </p>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#0A0C0F]">
              Saved Travelers:
            </h3>
            <span className="text-base text-[#3D495C]">
              {selectedIds.length}/{mockTravelers.length} Selected
            </span>
          </div>

          {/* Scrollable list */}
          <div className="flex max-h-[300px] flex-col gap-3 overflow-y-auto pr-1">
            {mockTravelers.map((traveler) => (
              <TravelerCard
                key={traveler.id}
                traveler={traveler}
                isSelected={selectedIds.includes(traveler.id)}
                onToggle={() => toggleSelection(traveler.id)}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full max-w-[320px] rounded-full auth-bg-btn py-3 text-base font-semibold text-[#F2F2F3] transition-all hover:opacity-90"
            >
              Proceed with selection
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full max-w-[320px] rounded-full border-2 border-[#2351A3] py-3 text-base font-semibold text-[#2351A3] transition-all hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
