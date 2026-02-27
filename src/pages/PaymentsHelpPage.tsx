import React from "react";
import ReadyToFlySection from "../components/molecules/ReadyToFlySection";

const PaymentsHelpPage: React.FC = () => {
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
                Payments Help
              </h1>

              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  lineHeight: "100%",
                  color: "#1A1E26",
                  marginBottom: 32,
                  textAlign: "left",
                }}
              >
                Last Updated: 25 - Feb - 2026
              </p>

              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "24px",
                  color: "#3D495C",
                  marginBottom: 32,
                }}
              >
                Whether you're booking a quick domestic flight or a luxury getaway, we want your checkout experience to be as smooth as your travels. Here is everything you need to know about paying for your next adventure.
              </p>

              <div style={{ marginBottom: 32 }}>
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#1A1E26",
                    marginBottom: 12,
                  }}
                >
                  Supported Payment Methods
                </h2>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: "24px",
                    color: "#3D495C",
                    marginBottom: 12,
                  }}
                >
                  We accept a wide variety of payment options to ensure flexibility, no matter where you are in the world:
                </p>
                <ul style={{ marginLeft: 20 }}>
                  <li style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3D495C", marginBottom: 8 }}>
                    <strong>Credit & Debit Cards:</strong> Visa, Mastercard, American Express, and Discover.
                  </li>
                  <li style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3D495C", marginBottom: 8 }}>
                    <strong>Digital Wallets:</strong> Apple Pay, Google Pay, and PayPal.
                  </li>
                  <li style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3D495C", marginBottom: 8 }}>
                    <strong>Buy Now, Pay Later:</strong> Options like Klarna or Affirm (available on select bookings).
                  </li>
                  <li style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3D495C", marginBottom: 8 }}>
                    <strong>Platform Credits:</strong> Use your earned rewards or gift cards at checkout.
                  </li>
                </ul>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#1A1E26",
                    marginBottom: 12,
                  }}
                >
                  When Will I Be Charged?
                </h2>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: "24px",
                    color: "#3D495C",
                    marginBottom: 12,
                  }}
                >
                  The timing of your payment depends on the type of booking you choose:
                </p>
                <ul style={{ marginLeft: 20 }}>
                  <li style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3D495C", marginBottom: 8 }}>
                    <strong>Flights:</strong> Usually charged in full at the time of booking.
                  </li>
                  <li style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3D495C", marginBottom: 8 }}>
                    <strong>Prepaid Hotels:</strong> Charged at the time of booking (often at a lower rate).
                  </li>
                  <li style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3D495C", marginBottom: 8 }}>
                    <strong>Pay at Property:</strong> Your card holds the booking, but you pay the hotel directly upon arrival.
                  </li>
                </ul>
              </div>

              <div style={{ marginBottom: 32 }}>
                <h2
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#1A1E26",
                    marginBottom: 12,
                  }}
                >
                  Managing Your Invoices
                </h2>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: "24px",
                    color: "#3D495C",
                    marginBottom: 12,
                  }}
                >
                  Need a receipt for an expense report? You can access your invoices 24/7:
                </p>
                <ol style={{ marginLeft: 20 }}>
                  <li style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3D495C", marginBottom: 8 }}>
                    Log into My Bookings.
                  </li>
                  <li style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3D495C", marginBottom: 8 }}>
                    Select the specific booking.
                  </li>
                  <li style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#3D495C", marginBottom: 8 }}>
                    Click Download Invoice/Receipt in the "Payment Details" section.
                  </li>
                </ol>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: "24px",
                    color: "#3D495C",
                    marginTop: 12,
                  }}
                >
                  <strong>Note:</strong> For "Pay at Property" hotel bookings, your final invoice must be collected directly from the hotel front desk at checkout.
                </p>
              </div>

              <div style={{ marginBottom: 32 }}>
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
                    lineHeight: "24px",
                    color: "#3D495C",
                  }}
                >
                  If you have any questions about payments, check FAQs or please contact us at:
                </p>
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    color: "#3D495C",
                    marginTop: 8,
                  }}
                >
                  Email: contact@al-rais.com
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

export default PaymentsHelpPage;
