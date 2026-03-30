import React from "react";
import {
  SIGHTSEEING_FIGMA_INCLUSION_ROWS,
  type SightseeingInclusionCell,
} from "./sightseeingDetailCopy";

const COL_LABEL = 191;
const COL_PKG = 170.25;
const TABLE_W = COL_LABEL + COL_PKG * 4;

/** Proportional widths — fills parent with no horizontal scroll */
const PCT_LABEL = `${(COL_LABEL / TABLE_W) * 100}%`;
const PCT_PKG = `${(COL_PKG / TABLE_W) * 100}%`;

const cellBorder =
  "border-b border-r border-[#E4E4E7] border-t-0 border-l-0 box-border";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <path
        d="M10 3L4.5 8.5L2 6"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InclusionGlyph({ cell }: { cell: SightseeingInclusionCell }) {
  if (cell === "yes") {
    return (
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#22C55E] shadow-sm ring-1 ring-black/5">
        <CheckIcon />
      </span>
    );
  }

  const xMark = (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EF4444] text-[15px] font-bold leading-none text-white shadow-sm ring-1 ring-black/5">
      ×
    </span>
  );

  if (cell === "addon") {
    return (
      <div className="flex flex-col items-center justify-center gap-[5px] py-0.5">
        {xMark}
        <span className="text-center text-[11px] font-normal leading-tight text-[#94A3B8]">
          (Add-on)
        </span>
      </div>
    );
  }

  return xMark;
}

/** Figma proportions (191 / 170.25×4); fluid width, no scrollbars. */
export function SightseeingInclusionsTable() {
  return (
    <div className="w-full max-w-full">
      <h2 className="mb-4 text-[20px] font-bold leading-tight tracking-tight text-[#0A0C0F]">
        Inclusions
      </h2>
      <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <table className="w-full table-fixed border-collapse text-[13px] text-[#374151]">
          <colgroup>
            <col style={{ width: PCT_LABEL }} />
            <col style={{ width: PCT_PKG }} />
            <col style={{ width: PCT_PKG }} />
            <col style={{ width: PCT_PKG }} />
            <col style={{ width: PCT_PKG }} />
          </colgroup>
          <thead>
            <tr>
              <th
                scope="col"
                className={`${cellBorder} bg-white py-[15px] pl-4 pr-2 text-left align-middle font-semibold tracking-tight text-[#0A0C0F]`}
              />
              <th
                scope="col"
                className={`${cellBorder} bg-white px-1.5 py-[15px] text-center align-middle text-[12px] font-semibold tracking-tight text-[#0A0C0F] sm:px-2 sm:text-[13px]`}
              >
                Basic
              </th>
              <th
                scope="col"
                className={`${cellBorder} bg-[#F2F2F3] px-1.5 py-[15px] text-center align-middle text-[12px] font-semibold tracking-tight text-[#0A0C0F] sm:px-2 sm:text-[13px]`}
              >
                Standard
              </th>
              <th
                scope="col"
                className={`${cellBorder} bg-white px-1.5 py-[15px] text-center align-middle text-[12px] font-semibold tracking-tight text-[#0A0C0F] sm:px-2 sm:text-[13px]`}
              >
                Silver
              </th>
              <th
                scope="col"
                className={`${cellBorder} bg-[#F2F2F3] px-1.5 py-[15px] text-center align-middle text-[12px] font-semibold tracking-tight text-[#0A0C0F] sm:px-2 sm:text-[13px]`}
              >
                Gold
              </th>
            </tr>
          </thead>
          <tbody>
            {SIGHTSEEING_FIGMA_INCLUSION_ROWS.map((row) => (
              <tr key={row.label}>
                <th
                  scope="row"
                  className={`${cellBorder} bg-white py-[13px] pl-4 pr-2 text-left align-middle text-[12px] font-normal leading-snug text-[#374151] sm:pt-px sm:pb-0 sm:text-[13px]`}
                >
                  {row.label}
                </th>
                <td
                  className={`${cellBorder} bg-white px-1.5 py-[13px] text-center align-middle sm:px-2 sm:py-0`}
                >
                  <div className="flex min-h-[48px] items-center justify-center gap-[5px] sm:min-h-[50px]">
                    <InclusionGlyph cell={row.basic} />
                  </div>
                </td>
                <td
                  className={`${cellBorder} bg-[#F2F2F3] px-1.5 py-[13px] text-center align-middle sm:px-2 sm:py-0`}
                >
                  <div className="flex min-h-[48px] items-center justify-center gap-[5px] sm:min-h-[50px]">
                    <InclusionGlyph cell={row.standard} />
                  </div>
                </td>
                <td
                  className={`${cellBorder} bg-white px-1.5 py-[13px] text-center align-middle sm:px-2 sm:py-0`}
                >
                  <div className="flex min-h-[48px] items-center justify-center gap-[5px] sm:min-h-[50px]">
                    <InclusionGlyph cell={row.silver} />
                  </div>
                </td>
                <td
                  className={`${cellBorder} bg-[#F2F2F3] px-1.5 py-[13px] text-center align-middle sm:px-2 sm:py-0`}
                >
                  <div className="flex min-h-[48px] items-center justify-center gap-[5px] sm:min-h-[50px]">
                    <InclusionGlyph cell={row.gold} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
