// import React, { useState } from "react";
import "../../assets/css/travel.css";

type FlightTimingAndStopsProps = {
  passSome?: {
    flight_detail?: {
      start_time?: string;
      start_date?: string;
      end_time?: string;
      end_date?: string;
      duration?: string;
    };
    stop?: { stayTime: string; name: string }[];
  };
};

const FlightTimingAndStops: React.FC<FlightTimingAndStopsProps> = ({
  passSome,
}) => {
  return (
    <div className="">
      {/* {passSome?.map((item: any, index: number) => ( */}
      <div className="flightTiming">
        <div className="startTime">
          <h5>{passSome?.flight_detail?.start_time}</h5>
          <p>{passSome?.flight_detail?.start_date}</p>
        </div>
        <div className="FlightDirection">
          <div className="visualGuid">
            <div className="stopPoint"></div>

            {passSome?.stop?.length ? (
              passSome?.stop?.map((stopStayTime: any, stopIndex: number) => (
                <div className="stopsDetail" key={stopIndex}>
                  <span>{stopStayTime?.stayTime}</span>
                  <div className="stopPoint stopDots"></div>
                  <span>{stopStayTime?.name}</span>
                </div>
              ))
            ) : (
              <div className="stopsDetail">
                <span>{passSome?.flight_detail?.duration}</span>
                <div className=""></div>
                <span>Direct</span>
              </div>
            )}
            <div className="stopPoint"></div>
          </div>
        </div>
        <div className="EndTime">
          <h5>{passSome?.flight_detail?.end_time}</h5>
          <p>{passSome?.flight_detail?.end_date}</p>
        </div>
      </div>
      {/* ))} */}
    </div>
  );
};

export default FlightTimingAndStops;
