// import React from "react";
// import AboutBg from "../assets/images/About-us-image-bg.png";
// import ContentImage from "../assets/images/About-us-secondimage.jpg";
// import ReadyToFlySection from "../components/molecules/ReadyToFlySection";

// const AboutPage: React.FC = () => {
//   return (
//     <div className="w-full">
//       {/* Hero Section */}
//       <section
//         aria-label="About hero"
//         className="relative w-full"
//         style={{ height: 438 }}
//       >
//         <div
//           className="absolute inset-0 bg-cover bg-center"
//           style={{
//             backgroundImage: `url(${AboutBg})`,
//             width: "100%",
//             height: "100%",
//           }}
//         />

//         {/* Overlay with blur effect */}
//         <div
//           className="absolute inset-0 flex items-center justify-center"
//           style={{
//             backdropFilter: "blur(4px)",
//             backgroundColor: "rgba(0, 0, 0, 0.2)",
//           }}
//         >
//           <div className="mx-auto px-4 text-center" style={{ maxWidth: 1100 }}>
//             <h1
//               className="text-white"
//               style={{
//                 fontFamily: "Inter, sans-serif",
//                 fontWeight: 600,
//                 fontSize: 38,
//                 lineHeight: 1.2,
//                 marginBottom: 16,
//                 maxWidth: 826,
//                 marginLeft: "auto",
//                 marginRight: "auto",
//               }}
//             >
//               Making the World Feel a Little Smaller, and Your Dreams a Lot Bigger.
//             </h1>

//             <p
//               className="text-white/90 mx-auto"
//               style={{
//                 fontFamily: "Inter, sans-serif",
//                 fontWeight: 400,
//                 fontSize: 15,
//                 lineHeight: 1.6,
//                 maxWidth: 690,
//               }}
//             >
//               We don't just book trips; we craft stories. Whether it's a quick
//               flight home or a month-long escape, we handle the details so you
//               can handle the memories.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Second Section - Two main sections side by side with flex */}
//       <section className="w-full py-16 md:py-24">
//         <div className="max-w-[1200px] mx-auto px-6">
//           {/* Main div with display flex */}
//           <div className="flex md:flex-row items-center gap-12 md:gap-16">
            
//             {/* First Section - Text Content */}
//             <div className="w-full md:w-1/2">
//               <h2
//                 style={{
//                   fontFamily: "Inter, sans-serif",
//                   fontWeight: 500,
//                   fontSize: 42,
//                   lineHeight: 1.2,
//                   color: "#1A1E26",
//                   marginBottom: 24,
//                 }}
//               >
//                 Planning travel shouldn't feel like a second job.
//               </h2>

//               <p
//                 style={{
//                   fontFamily: "Inter, sans-serif",
//                   fontWeight: 400,
//                   fontSize: 16,
//                   lineHeight: 1.75,
//                   color: "#4A4E57",
//                   margin: 0,
//                   maxWidth: 500,
//                 }}
//               >
//                 Navigating endless tabs for flights, hotels, and cars is exhausting.
//                 We've built a seamless ecosystem. One platform, four essential
//                 services, and zero stress. We've vetted the hotels, negotiated
//                 the car rates, and found the best routes—all you have to do is pack.
//               </p>
              
//               {/* Decorative line */}
//               <div className="mt-8 w-16 h-1 bg-blue-600 rounded-full"></div>
//             </div>

//             {/* Second Section - Image */}
//             <div className="w-full md:w-1/2 flex justify-center md:justify-end">
//               <div className="relative">
//                 <img
//                   src={ContentImage}
//                   alt="Travel planning made easy"
//                   className="w-full max-w-[520px] h-auto object-cover rounded-lg"
//                   style={{
//                     boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
//                   }}
//                 />
//                 {/* Decorative element */}
//                 <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-full -z-10"></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Ready to Fly Section */}
//       <ReadyToFlySection />
//     </div>
//   );
// };

// export default AboutPage;
import React from "react";
import AboutBg from "../assets/images/About-us-image-bg.png";
import ContentImage from "../assets/images/About-us-secondimage.jpg";
import FlightsIcon from "../assets/images/Flights.png";
import HotelsIcon from "../assets/images/Hotels.png";
import CarIcon from "../assets/images/Car.png";
import PackagesIcon from "../assets/images/Packages.png";
import ReadyToFlySection from "../components/molecules/ReadyToFlySection";

const AboutPage: React.FC = () => {
  const services = [
    {
      id: 1,
      title: "Flights",
      icon: FlightsIcon,
      description: "Real-time tracking and the best fares from 500+ airlines.",
    },
    {
      id: 2,
      title: "Hotels",
      icon: HotelsIcon,
      description: "Curated stays with exclusive deals from 2M+ properties.",
    },
    {
      id: 3,
      title: "Car Rentals",
      icon: CarIcon,
      description: "Flexible rentals with transparent pricing and zero hidden fees.",
    },
    {
      id: 4,
      title: "Packages",
      icon: PackagesIcon,
      description: "Custom bundles that save up to 30% on your complete trip.",
    },
  ];

  const trustStats = [
    {
      id: 1,
      value: "500k+",
      label: "Happy Travelers",
    },
    {
      id: 2,
      value: "150+",
      label: "Countries Reached",
    },
    {
      id: 3,
      value: "24/7",
      label: "Human Support (No annoying bots)",
    },
    {
      id: 4,
      value: "100%",
      label: "Secure Payments",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section
        aria-label="About hero"
        className="relative w-full"
        style={{ height: 438 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${AboutBg})`,
            width: "100%",
            height: "100%",
          }}
        />

        {/* Overlay with blur effect */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <div className="mx-auto px-4 text-center" style={{ maxWidth: 1100 }}>
            <h1
              className="text-white"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: 38,
                lineHeight: 1.2,
                marginBottom: 16,
                maxWidth: 826,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Making the World Feel a Little Smaller, and Your Dreams a Lot Bigger.
            </h1>

            <p
              className="text-white/90 mx-auto"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: 15,
                lineHeight: 1.6,
                maxWidth: 690,
              }}
            >
              We don't just book trips; we craft stories. Whether it's a quick
              flight home or a month-long escape, we handle the details so you
              can handle the memories.
            </p>
          </div>
        </div>
      </section>

      {/* Second Section - Text and Image side by side */}
      <section className="w-full py-16 md:py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Main div with display flex */}
          <div className="flex md:flex-row items-center gap-12 md:gap-16">
            
            {/* First Section - Text Content */}
            <div className="w-full md:w-1/2">
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 42,
                  lineHeight: 1.2,
                  color: "#1A1E26",
                  marginBottom: 24,
                }}
              >
                Planning travel shouldn't feel like a second job.
              </h2>

              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: 1.75,
                  color: "#4A4E57",
                  margin: 0,
                  maxWidth: 500,
                }}
              >
                Navigating endless tabs for flights, hotels, and cars is exhausting.
                We've built a seamless ecosystem. One platform, four essential
                services, and zero stress. We've vetted the hotels, negotiated
                the car rates, and found the best routes—all you have to do is pack.
              </p>
              
              {/* Decorative line */}
              <div className="mt-8 w-16 h-1 bg-blue-600 rounded-full"></div>
            </div>

            {/* Second Section - Image */}
            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
              <div className="relative">
                <img
                  src={ContentImage}
                  alt="Travel planning made easy"
                  className="w-full max-w-[520px] h-auto object-cover rounded-lg"
                  style={{
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
                  }}
                />
                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-full -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Core Services Section */}
      <section className="w-full py-16 md:py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: 22,
                lineHeight: "100%",
                color: "#6B7280",
                marginBottom: 16,
              }}
            >
              Our Core Services
            </p>
            
            <h2
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 42,
                lineHeight: "100%",
                color: "#1A1E26",
              }}
            >
              What we offer
            </h2>
          </div>

          {/* Services Cards - Single Row with Flex */}
          <div className="flex flex-wrap justify-center lg:flex-nowrap gap-4 xl:gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-col p-5 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                style={{
                  width: 270,
                  height: 160,
                  flexShrink: 0,
                }}
              >
                {/* Icon */}
                <div className="mb-3">
                  <img
                    src={service.icon}
                    alt={service.title}
                    className="w-8 h-8 object-contain"
                  />
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 17,
                    lineHeight: "22px",
                    color: "#1A1E26",
                    marginBottom: 6,
                  }}
                >
                  {service.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: "20px",
                    color: "#6B7280",
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust Us Section - Updated with labels at the end of each card */}
      <section 
        className="w-full py-20"
        style={{
          background: "linear-gradient(90deg, #D2F4FE 0%, #FFFFFF 100%)",
          minHeight: 547,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex lg:flex-row gap-16 lg:gap-24">
            {/* Left Column - Text Content */}
            <div className="w-full lg:w-1/2">
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 22,
                  lineHeight: "100%",
                  color: "#4A4E57",
                  marginBottom: 16,
                }}
              >
                Why trust us?
              </p>
              
              <h2
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 42,
                  lineHeight: "100%",
                  color: "#1A1E26",
                  marginBottom: 49,
                  maxWidth: 399,
                }}
              >
                The numbers speak for themselves.
              </h2>

              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: "25px",
                  color: "#4A4E57",
                  maxWidth: 428,
                  marginBottom: 32,
                }}
              >
                Al-Rais has been in the business for the last 15 years. During that time, we have built trust which is represented by the numbers and data.
              </p>
            </div>

            {/* Right Column - Stats Cards with value and label side by side */}
            <div className="w-full lg:w-1/2">
              <div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                style={{
                  maxWidth: 872,
                }}
              >
                {trustStats.map((stat) => (
                  <div
                    key={stat.id}
                    className="bg-white rounded-2xl p-6"
                    style={{
                      border: "1.5px solid #E4E4E7",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      height: 72,
                    }}
                  >
                    {/* Value and Label in a row with space between */}
                    <div className="flex justify-between items-center h-full">
                      {/* Value on the left */}
                      <h3
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          fontSize: 26,
                          lineHeight: "100%",
                          color: "#2351A3",
                          margin: 0,
                        }}
                      >
                        {stat.value}
                      </h3>
                      
                      {/* Label on the right */}
                      <p
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 400,
                          fontSize: 14,
                          lineHeight: "25px",
                          color: "#6B7280",
                          margin: 0,
                          textAlign: "right",
                          maxWidth: "60%",
                        }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Fly Section */}
      <ReadyToFlySection />
    </div>
  );
};

export default AboutPage;