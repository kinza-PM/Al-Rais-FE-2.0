import React from "react";

import emiratesIcon from "../../assets/images/emirates.png";
import qatarIcon from "../../assets/images/qatar.png";
import airlineIcon3 from "../../assets/images/airline_icon_3.png";
import flydubaiIcon from "../../assets/images/flydubai_icon.jpeg";
import pkAirlineIcon from "../../assets/images/pakistan_international_airlines_icon.jpeg";
import airlineIcon6 from "../../assets/images/airline_icon_6.jpeg";
import lufthansa_cityline_icon from "../../assets/images/lufthansa_cityline_icon.jpeg";
import virginAtlanticIcon from "../../assets/images/virgin_atlantic_icon.jpeg";
import americanAirlineIcon from "../../assets/images/american_airlines_icon.jpeg";
import swiss_international_airlines_icon from "../../assets/images/swiss_international_airlines_icon.jpeg";
import sas_airlines_icon from "../../assets/images/sas_-_scandinavian_airlines_icon.jpeg";

const PartnersSection: React.FC = () => {
  return (
    <section className="bg-[#FFFFFF]">
      <div className="w-full max-w-[1040px] !mt-20 m-auto">
        <h5 className="text-[26px] text-center text-[rgba(10, 12, 15, 1)] mt-20 mb-1">
          We are partnered up with the best
        </h5>

        <div className="flex justify-center items-center mt-10 gap-x-4">
          <img src={emiratesIcon} alt="" className="w-[62px] h-[62px]" />
          <img src={qatarIcon} alt="" className="w-[62px] h-[62px]" />
          <img src={airlineIcon3} alt="" className="w-[62px] h-[62px]" />
          <img src={flydubaiIcon} alt="" className="w-[62px] h-[62px]" />
          <img src={pkAirlineIcon} alt="" className="w-[62px] h-[62px]" />
          <img src={airlineIcon6} alt="" className="w-[62px] h-[62px]" />
          <img
            src={lufthansa_cityline_icon}
            alt=""
            className="w-[62px] h-[62px]"
          />
          <img src={virginAtlanticIcon} alt="" className="w-[62px] h-[62px]" />
          <img src={americanAirlineIcon} alt="" className="w-[62px] h-[62px]" />
          <img
            src={swiss_international_airlines_icon}
            alt=""
            className="w-[62px] h-[62px]"
          />
          <img src={sas_airlines_icon} alt="" className="w-[62px] h-[62px]" />
        </div>

        <div className="text-center mt-10">
          <a href="#" className="text-[12px] text-[#3D495C] opacity-80">
            and many more...
          </a>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
