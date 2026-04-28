import { useState } from "react";
import Button from "../atoms/Button";

const HotelDetailFaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    {
      question: "Do they serve breakfast?",
      answer:
        "Yes, we serve a complimentary breakfast daily from 7:00 AM to 10:30 AM. Our breakfast includes a variety of options including continental and hot dishes.",
    },
    {
      question: "What time does lunch start?",
      answer:
        "Lunch service begins at 12:00 PM and continues until 3:00 PM. We offer an extensive lunch menu with various cuisines.",
    },
    {
      question: "Is there a special menu for dinner?",
      answer:
        "Yes, we have a special dinner menu available from 6:00 PM to 11:00 PM featuring seasonal dishes and chef's specials.",
    },
    {
      question: "Do they offer vegetarian options?",
      answer:
        "Absolutely! We have a wide range of vegetarian dishes across all our menus, clearly marked for your convenience.",
    },
    {
      question: "Can I make a reservation online?",
      answer:
        "Yes, you can make reservations online through our website or mobile app. We recommend booking in advance, especially for weekends.",
    },
    {
      question: "Are there gluten-free dishes available?",
      answer:
        "Yes, we offer several gluten-free options. Please inform our staff about any dietary restrictions and we'll be happy to accommodate.",
    },
    {
      question: "What is the signature dish of the restaurant?",
      answer:
        "Our signature dish is the Pan-Seared Sea Bass with truffle risotto, which has won multiple awards and is highly recommended by our guests.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-6">
      <h4 className="text-[#0A0C0F] text-base font-bold">
        Other people are asking
      </h4>
      <div className="max-w-6xl mx-auto mt-8">
        <div className="space-y-1">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-[#E4E4E7] rounded-2xl overflow-hidden bg-[#FFFFFF]"
            >
              <Button
                onClick={() => toggleAccordion(index)}
                className="w-full px-4 py-4 flex items-center justify-between text-left"
                overrideClasses
              >
                <span className="text-sm text-[#0A0C0F]">
                  {faq.question}
                </span>
                <ChevronDown />
              </Button>

              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-4 pb-4 pt-2 text-sm text-[#0A0C0F] leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button className="bg-[#2351A3] text-[#F2F2F3] text-sm font-semibold px-8 py-3 border-none rounded-lg">
            See 20 more questions
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelDetailFaqSection;

const ChevronDown = () => {
  return (
    <svg
      width="14"
      height="8"
      viewBox="0 0 14 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.5675 1.06754L7.31754 7.31754C7.25949 7.37565 7.19056 7.42175 7.11469 7.4532C7.03881 7.48465 6.95748 7.50084 6.87535 7.50084C6.79321 7.50084 6.71188 7.48465 6.63601 7.4532C6.56014 7.42175 6.49121 7.37565 6.43316 7.31754L0.18316 1.06754C0.0658846 0.95026 0 0.7912 0 0.625347C0 0.459495 0.0658846 0.300435 0.18316 0.18316C0.300435 0.0658843 0.459495 0 0.625347 0C0.7912 0 0.95026 0.0658843 1.06753 0.18316L6.87535 5.99175L12.6832 0.18316C12.7412 0.125091 12.8102 0.0790281 12.886 0.0476015C12.9619 0.0161748 13.0432 0 13.1253 0C13.2075 0 13.2888 0.0161748 13.3647 0.0476015C13.4405 0.0790281 13.5095 0.125091 13.5675 0.18316C13.6256 0.241229 13.6717 0.310167 13.7031 0.386037C13.7345 0.461908 13.7507 0.543226 13.7507 0.625347C13.7507 0.707469 13.7345 0.788787 13.7031 0.864658C13.6717 0.940528 13.6256 1.00947 13.5675 1.06754Z"
        fill="#3D495C"
      />
    </svg>
  );
};
