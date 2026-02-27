import React, { useState } from "react";
import ReadyToFlySection from "../components/molecules/ReadyToFlySection";

const FAQPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      id: 1,
      question: "How do I book a flight with Al Rais Travel?",
      answer: "You can book a flight by visiting our Flights page, entering your travel details (destination, dates, number of passengers), and clicking 'Search'. From there, you can compare available options, select your preferred flight, and proceed to checkout. You'll need to provide passenger information and complete the payment to confirm your booking.",
      category: "Flights"
    },
    {
      id: 2,
      question: "What is your cancellation policy for hotel bookings?",
      answer: "Hotel cancellation policies vary depending on the rate you selected at booking. Free cancellation options typically allow you to cancel up to 24-48 hours before check-in for a full refund. Non-refundable rates are offered at a discount but cannot be cancelled or modified. You can always view the specific cancellation policy for your booking in the 'My Bookings' section.",
      category: "Hotels"
    },
    {
      id: 3,
      question: "Can I modify my flight booking after purchase?",
      answer: "Yes, most flight bookings can be modified, but changes are subject to the airline's fare rules. Some tickets allow free changes, while others may charge a modification fee plus any fare difference. To request a change, go to 'My Bookings', select your flight, and click 'Modify Booking'. You'll see available options and any associated costs before confirming.",
      category: "Flights"
    },
    {
      id: 4,
      question: "How do I earn and redeem loyalty points?",
      answer: "Al Rais Rewards members earn points on every booking made through our platform. You earn 5 points for every $1 spent on flights and 3 points for every $1 spent on hotels. Points can be redeemed for discounts on future bookings, seat upgrades, or even free nights at select hotels. Simply sign in to your account to view your points balance and redeem at checkout.",
      category: "Rewards"
    },
    {
      id: 5,
      question: "What documents do I need for international travel?",
      answer: "For international travel, you'll need a valid passport (with at least 6 months validity beyond your return date), and depending on your destination, you may need a visa. Some countries also require proof of return tickets, sufficient funds, and travel insurance. We recommend checking the entry requirements for your specific destination at least 2 weeks before departure.",
      category: "Travel Tips"
    },
    {
      id: 6,
      question: "Do you offer travel insurance?",
      answer: "Yes, we offer comprehensive travel insurance plans during the checkout process. Our insurance covers trip cancellation, medical emergencies, lost baggage, and flight delays. You can choose from basic, standard, or premium coverage based on your needs. We recommend purchasing insurance for all international trips to protect your investment.",
      category: "Insurance"
    },
    {
      id: 7,
      question: "How do I contact customer support in an emergency?",
      answer: "For emergencies during your trip, we offer 24/7 emergency support. Call our emergency hotline at +1 (555) 123-9999 (available 24/7). For non-urgent matters, you can email us at support@al-rais.com or use the live chat feature on our website during business hours (8 AM - 10 PM daily).",
      category: "Support"
    },
    {
      id: 8,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers for certain regions. All payments are processed securely through our encrypted payment gateway. We also offer buy now, pay later options through our partners in select countries.",
      category: "Payments"
    },
  ];

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      <section className="w-full py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[578px] mx-auto">
              <h1
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 42,
                  lineHeight: "100%",
                  color: "#1A1E26",
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                Frequently Asked Questions
              </h1>

              {/* Search Box */}
              <div style={{ marginBottom: 40, display: "flex", justifyContent: "center" }}>
                <input
                  type="text"
                  placeholder="Search FAQs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "576px",
                    height: "50px",
                    padding: "0 16px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    background: "#FFFFFF",
                    border: "1.5px solid #E4E4E7",
                    borderRadius: "16px",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#2351A3"}
                  onBlur={(e) => e.target.style.borderColor = "#E4E4E7"}
                />
              </div>

              {/* FAQ Items with Smooth Animation */}
              <div style={{ marginBottom: 40 }}>
                {filteredFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    style={{
                      marginBottom: 12,
                    }}
                  >
                    {/* FAQ Question Container */}
                    <div
                      style={{
                        width: "576px",
                        background: "#FFFFFF",
                        border: "1.5px solid #E4E4E7",
                        borderRadius: expandedId === faq.id ? "16px 16px 0 0" : "16px",
                        overflow: "hidden",
                        transition: "border-radius 0.3s ease",
                      }}
                    >
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === faq.id ? null : faq.id)
                        }
                        style={{
                          width: "100%",
                          height: "50px",
                          padding: "0 16px",
                          background: "#FFFFFF",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          fontSize: 14,
                          color: "#1A1E26",
                          textAlign: "left",
                        }}
                      >
                        <span>{faq.question}</span>
                        
                        {/* Arrow with exact specifications */}
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "transform 0.3s ease",
                            transform: expandedId === faq.id ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        >
                          <svg
                            width="14"
                            height="8"
                            viewBox="0 0 14 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 1L7 7L13 1"
                              stroke="#0A0C0F"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </button>

                      {/* Expanded Answer with Smooth Animation */}
                      <div
                        style={{
                          maxHeight: expandedId === faq.id ? "500px" : "0",
                          opacity: expandedId === faq.id ? 1 : 0,
                          overflow: "hidden",
                          transition: "max-height 0.5s ease-in-out, opacity 0.3s ease-in-out",
                          background: "#FFFFFF",
                        }}
                      >
                        <div
                          style={{
                            padding: "16px",
                            borderTop: expandedId === faq.id ? "1.5px solid #E4E4E7" : "none",
                            fontFamily: "Inter, sans-serif",
                            fontSize: 14,
                            lineHeight: "24px",
                            color: "#3D495C",
                          }}
                        >
                          {/* Category Tag */}
                          <span
                            style={{
                              display: "inline-block",
                              padding: "4px 8px",
                              background: "#F2F2F3",
                              borderRadius: "4px",
                              fontSize: 12,
                              color: "#6B7280",
                              marginBottom: 8,
                            }}
                          >
                            {faq.category}
                          </span>
                          <p style={{ margin: 0 }}>{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Us Section */}
              <div style={{ marginBottom: 32, textAlign: "center" }}>
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#1A1E26",
                    marginBottom: 12,
                  }}
                >
                  Contact Us:
                </h2>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    color: "#3D495C",
                    marginBottom: 8,
                  }}
                >
                  Didn't find what you were looking for? please contact us at:
                </p>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    color: "#2351A3",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={() => window.location.href = "mailto:contact@al-rais.com"}
                >
                  contact@al-rais.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReadyToFlySection />
    </div>
  );
};

export default FAQPage;