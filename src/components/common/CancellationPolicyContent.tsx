import React from "react";

const CancellationPolicyContent: React.FC = () => {
  return (
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
        Refund & Cancellation Policy
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
        We understand that plans change. Whether it's a sudden shift in schedule
        or an unexpected event, here is a clear breakdown of how refunds are
        processed on our platform.
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
          1. Flights
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
          Refund eligibility for flights is determined by the airline's fare
          rules and the type of ticket purchased.
        </p>
        <ul style={{ marginTop: 8, marginLeft: 20 }}>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>Refundable Tickets:</span> Can be
            cancelled for a full or partial refund (minus any processing fees).
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>Non-Refundable Tickets:</span>{" "}
            Generally do not qualify for a cash refund. However, you may be
            eligible for an Airlines Credit to be used for future travel.
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>24-Hour Grace Period:</span> For
            most flights booked at least 7 days before departure, you may cancel
            within 24 hours of booking for a full refund.
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
          2. Hotels
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
          Hotel refund policies vary by the specific room rate selected at the
          time of booking:
        </p>
        <ul style={{ marginTop: 8, marginLeft: 20 }}>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>Free Cancellation:</span> You can
            cancel up until the hotel's specified deadline (e.g., 24 or 48 hours
            before check-in) for a full refund.
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>
              Non-Refundable/Advanced Purchase:
            </span>{" "}
            These bookings are offered at a discounted rate and do not qualify
            for a refund if cancelled.
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>Partial Refunds:</span> Some
            properties may charge a "one-night penalty" if cancelled outside of
            the free window.
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
          Refund Processing Timelines
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
          Once a refund is initiated, the time it takes to see the funds depends
          on your payment method:
        </p>
        <ul style={{ marginTop: 8, marginLeft: 20 }}>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>Credit/Debit Card:</span> 5 – 10
            Business Days
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>
              Digital Wallets (PayPal/Apple Pay):
            </span>{" "}
            3 – 5 Business Days
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>
              Platform Credits/Gift Cards:
            </span>{" "}
            Instant (within 24 hours)
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
          How to Request a Refund?
        </h2>
        <ul style={{ marginTop: 8, marginLeft: 20, listStyleType: "decimal" }}>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            Navigate to <span style={{ fontWeight: 600 }}>My Bookings</span> and
            select the booking you wish to cancel.
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            Review the{" "}
            <span style={{ fontWeight: 600 }}>Cancellation Policy</span>{" "}
            displayed on the booking summary.
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            Click <span style={{ fontWeight: 600 }}>Cancel Booking</span>. If
            eligible, the system will automatically calculate your refund
            amount.
          </li>
          <li
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              lineHeight: "24px",
              color: "#3D495C",
              marginBottom: 8,
            }}
          >
            Confirm cancellation. You will receive a confirmation email
            immediately.
          </li>
        </ul>
        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "#FEF3C7",
            borderRadius: 8,
            borderLeft: "4px solid #F59E0B",
          }}
        >
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 14,
              lineHeight: "24px",
              color: "#92400E",
              margin: 0,
            }}
          >
            <span style={{ fontWeight: 700 }}>Travel Insurance Tip:</span> If
            you purchased travel insurance through us, you may be able to claim
            a full refund for "non-refundable" bookings under specific covered
            reasons (like medical emergencies).
          </p>
        </div>
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
          Exceptional Circumstances
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
          In the event of major flight disruptions, natural disasters, or
          airline insolvency, we work directly with our partners to advocate for
          your refund. In these cases, processing times may be extended due to
          high volume.
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
          If you have any questions about payments, check FAQs or please contact
          us at:
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
          Email:{" "}
          <span
            className="cursor-pointer hover:text-[#2351A3] hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = "mailto:contact@al-rais.com";
            }}
          >
            contact@al-rais.com
          </span>
        </p>
      </div>
    </div>
  );
};

export default CancellationPolicyContent;
