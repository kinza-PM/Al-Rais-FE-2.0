// import React, { useState } from "react";
import "../../assets/css/travel.css";
import {
  formatTime,
  formatDate,
  formatFlightDurationLabel,
} from "../../utils/helpers";

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
          departureTerminal?: string;
          arrivalAirportCode?: string;
          arrivalTerminal?: string;
          departureDateTime?: string;
          arrivalDateTime?: string;
        }>;
      }>;
    };
  };
  /** Figma search listing: airport caps + duration above bar; light blue track */
  listingStyle?: boolean;
};

/** e.g. "Terminal 3 Int." for timeline caps (Figma) */
function listingTerminalPhrase(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (!s) return "Int.";
  if (/^terminal\s+/i.test(s)) return `${s} Int.`;
  if (/^T\d+$/i.test(s)) return `Terminal ${s.slice(1)} Int.`;
  if (/^\d+$/.test(s)) return `Terminal ${s} Int.`;
  if (/^[A-Z]$/i.test(s) && s.length === 1) {
    const map: Record<string, string> = {
      M: "Main Int.",
      A: "Terminal A Int.",
      B: "Terminal B Int.",
      C: "Terminal C Int.",
      D: "Terminal D Int.",
    };
    return map[s.toUpperCase()] ?? `${s} Int.`;
  }
  return `${s} Int.`;
}

const FlightTimingAndStops: React.FC<FlightTimingAndStopsProps> = ({
  passSome,
  listingStyle = false,
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

  const rawDuration =
    firstSegment?.duration ?? passSome?.flight_detail?.duration ?? "";
  const durationLabel = formatFlightDurationLabel(rawDuration);
  const durationCenterText =
    durationLabel ||
    rawDuration ||
    formatFlightDurationLabel(firstDuration) ||
    firstDuration;

  const depCode = String(
    firstSegment?.departureAirportCode ?? "",
  ).toUpperCase();
  const arrCode = String(
    lastSegment?.arrivalAirportCode ?? "",
  ).toUpperCase();
  const depAirLabel =
    depCode &&
    `${depCode} (${listingTerminalPhrase(firstSegment?.departureTerminal)})`;
  const arrAirLabel =
    arrCode &&
    `${arrCode} (${listingTerminalPhrase(lastSegment?.arrivalTerminal)})`;

  const showListingAirportStrip =
    listingStyle &&
    !passSome?.stop?.length &&
    depAirLabel &&
    arrAirLabel;

  return (
    <div
      className={
        listingStyle ? "flightTimingWrap flightTimingWrap--listing" : ""
      }
    >
      {showListingAirportStrip ? (
        <div className="ow-listing-airport-strip" aria-hidden={false}>
          <span className="ow-listing-airport-strip__dep">{depAirLabel}</span>
          <span className="ow-listing-airport-strip__dur">
            {durationCenterText}
          </span>
          <span className="ow-listing-airport-strip__arr">{arrAirLabel}</span>
        </div>
      ) : null}

      <div className={listingStyle ? "flightTiming flightTiming--listing" : "flightTiming"}>
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
                <span className="mb-5">
                  {formatFlightDurationLabel(firstDuration) || firstDuration}
                </span>
                <div className="stopsDetail">
                  <span>{layoverTime}</span>
                  <div className="stopPoint stopDots"></div>
                  <span>{stopAirport}</span>
                </div>
                <span className="mb-5">
                  {formatFlightDurationLabel(secondDuration) || secondDuration}
                </span>
              </>
            ) : (
              <div className="stopsDetail">
                {listingStyle ? null : (
                  <span>{durationLabel || rawDuration}</span>
                )}
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
