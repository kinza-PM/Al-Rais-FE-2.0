// import React from "react";

// import emiratesIcon from "../../assets/images/emirates.png";
// import qatarIcon from "../../assets/images/qatar.png";
// import airlineIcon3 from "../../assets/images/airline_icon_3.png";
// import flydubaiIcon from "../../assets/images/flydubai_icon.jpeg";
// import pkAirlineIcon from "../../assets/images/pakistan_international_airlines_icon.jpeg";
// import airlineIcon6 from "../../assets/images/airline_icon_6.jpeg";
// import lufthansaIcon from "../../assets/images/lufthansa_cityline_icon.jpeg";
// import virginAtlanticIcon from "../../assets/images/virgin_atlantic_icon.jpeg";
// import americanAirlineIcon from "../../assets/images/american_airlines_icon.jpeg";
// import swissAirlinesIcon from "../../assets/images/swiss_international_airlines_icon.jpeg";
// import sasAirlinesIcon from "../../assets/images/sas_-_scandinavian_airlines_icon.jpeg";

// const PARTNERS = [
//   { src: emiratesIcon, alt: "Emirates" },
//   { src: qatarIcon, alt: "Qatar Airways" },
//   { src: airlineIcon3, alt: "Airline partner" },
//   { src: flydubaiIcon, alt: "Flydubai" },
//   { src: pkAirlineIcon, alt: "Pakistan International Airlines" },
//   { src: airlineIcon6, alt: "Airline partner" },
//   { src: lufthansaIcon, alt: "Lufthansa" },
//   { src: virginAtlanticIcon, alt: "Virgin Atlantic" },
//   { src: americanAirlineIcon, alt: "American Airlines" },
//   { src: swissAirlinesIcon, alt: "Swiss International" },
//   { src: sasAirlinesIcon, alt: "SAS Scandinavian" },
// ];

// const PartnersSection: React.FC = () => {
//   return (
//     <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAFA] to-white py-16 sm:py-20">
//       {/* Subtle grid texture */}
//       <div
//         className="pointer-events-none absolute inset-0 opacity-[0.02]"
//         style={{
//           backgroundImage: `linear-gradient(#0A0C0F 1px, transparent 1px),
//             linear-gradient(90deg, #0A0C0F 1px, transparent 1px)`,
//           backgroundSize: "32px 32px",
//         }}
//       />

//       <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
//         {/* Heading */}
//         <div className="text-center">
//           <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#2351A3] sm:text-sm">
//             Trusted worldwide
//           </p>
//           <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#0A0C0F] sm:text-3xl lg:text-[32px]">
//             We are partnered up with the best
//           </h2>
//           <p className="mx-auto mt-2 max-w-xl text-sm text-[#3D495C]/90 sm:text-base">
//             Fly with confidence alongside leading airlines
//           </p>
//         </div>

//         {/* Continuous infinite marquee — no pause, never stops */}
//         <div className="mt-10 sm:mt-12 overflow-hidden">
//           <div
//             className="flex w-max animate-partners-marquee gap-6 px-2"
//             aria-label="Our airline partners"
//           >
//             {/* Duplicate set for seamless loop */}
//             {[...PARTNERS, ...PARTNERS].map((partner, i) => (
//               <div
//                 key={`${partner.alt}-${i}`}
//                 className="group flex shrink-0 items-center justify-center"
//                 title={partner.alt}
//               >
//                 <div
//                   className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-white p-3 shadow-[0_4px_20px_rgba(10,12,15,0.08)] ring-1 ring-[#E4E4E7]/90 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_32px_rgba(35,81,163,0.12)] hover:ring-2 hover:ring-[#2351A3]/25 sm:h-[96px] sm:w-[96px] sm:rounded-3xl sm:p-4"
//                   style={{
//                     background: "linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)",
//                   }}
//                 >
//                   <img
//                     src={partner.src}
//                     alt={partner.alt}
//                     className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12"
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Footer line */}
//         <p className="mt-8 text-center text-sm font-medium text-[#3D495C]/70">
//           and many more…
//         </p>
//       </div>
//     </section>
//   );
// };

// export default PartnersSection;
