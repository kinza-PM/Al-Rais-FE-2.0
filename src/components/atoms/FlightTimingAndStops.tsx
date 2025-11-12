// import React, { useState } from "react";
import "../../assets/css/travel.css";
import { formatTime, formatDate } from "../../utils/helpers";

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
    raw?: {
      journey?: Array<{
        flightSegments?: Array<{
          duration?: string;
          layoverTime?: string;
          departureAirportCode?: string;
          departureDateTime?: string;
          arrivalDateTime?: string;
        }>;
      }>;
    };
  };
};

const FlightTimingAndStops: React.FC<FlightTimingAndStopsProps> = ({
  passSome,
}) => {
  // Get flight segments from raw data
  const flightSegments = passSome?.raw?.journey?.[0]?.flightSegments ?? [];
  const hasMultipleSegments = Array.isArray(flightSegments) && flightSegments.length > 1;
  
  // Get first and last segments for start/end times
  const firstSegment = Array.isArray(flightSegments) && flightSegments.length > 0 ? flightSegments[0] : null;
  const lastSegment = Array.isArray(flightSegments) && flightSegments.length > 0 ? flightSegments[flightSegments.length - 1] : null;
  
  // Extract start time/date from first segment, end time/date from last segment
  const startTime = firstSegment?.departureDateTime ? formatTime(firstSegment.departureDateTime) : passSome?.flight_detail?.start_time ?? '';
  const startDate = firstSegment?.departureDateTime ? formatDate(firstSegment.departureDateTime) : passSome?.flight_detail?.start_date ?? '';
  const endTime = lastSegment?.arrivalDateTime ? formatTime(lastSegment.arrivalDateTime) : passSome?.flight_detail?.end_time ?? '';
  const endDate = lastSegment?.arrivalDateTime ? formatDate(lastSegment.arrivalDateTime) : passSome?.flight_detail?.end_date ?? '';
  
  // For multiple segments, extract durations and layover info
  const secondSegment = hasMultipleSegments ? flightSegments[1] : null;
  const firstDuration = firstSegment?.duration ?? '';
  const secondDuration = secondSegment?.duration ?? '';
  const layoverTime = secondSegment?.layoverTime ?? '';
  const stopAirport = secondSegment?.departureAirportCode ?? '';

  return (
    <div className="">
      <div className="flightTiming">
        <div className="startTime">
          <h5>{startTime}</h5>
          <p>{startDate}</p>
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
            ) : hasMultipleSegments ? (
              <>
                <span className="mb-5">{firstDuration}</span>
                <div className="stopsDetail">
                  <span>{layoverTime}</span>
                  <div className="stopPoint stopDots"></div>
                  <span>{stopAirport}</span>
                </div>
                <span className="mb-5">{secondDuration}</span>
              </>
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
          <h5>{endTime}</h5>
          <p>{endDate}</p>
        </div>
      </div>
    </div>
  );
};

export default FlightTimingAndStops;
