import { useMemo } from "react";
import CardCollapseToggle from "../common/CardCollapseToggle";
import { formatMoney } from "../../utils/helpers";
import { aggregateHotelTaxesFromSelectedRooms } from "../../utils/hotelBookingHelper";

type TaxItem = {
  name?: string;
  amount?: number;
  included?: boolean;
};

type SelectedRoomEntry = {
  count?: number;
  room?: {
    roomTypeName?: string;
    roomTypeDesc?: string;
    roomRate?: {
      netAmount?: number;
      taxes?: TaxItem[];
      currency?: string;
    };
  };
};

type Props = {
  open: boolean;
  onToggleOpen: () => void;
  totalPrice?: number;
  currency?: string;
  selectedRooms?: SelectedRoomEntry[];
};

export default function HotelPriceBreakdown({
  open,
  onToggleOpen,
  totalPrice = 0,
  currency = "AED",
  selectedRooms = [],
}: Props) {
  const aggregatedTaxes = useMemo(
    () => aggregateHotelTaxesFromSelectedRooms(selectedRooms),
    [selectedRooms],
  );

  const roomLines = useMemo(() => {
    return (selectedRooms ?? []).map((sel, idx) => {
      const count =
        typeof sel?.count === "number" && sel.count > 0 ? sel.count : 1;
      const room = sel?.room;
      const netRaw = room?.roomRate?.netAmount;
      const netAmount =
        typeof netRaw === "number" && Number.isFinite(netRaw) ? netRaw : 0;
      const title =
        room?.roomTypeName ||
        room?.roomTypeDesc ||
        `Room ${idx + 1}`;
      const taxes = Array.isArray(room?.roomRate?.taxes)
        ? room!.roomRate!.taxes!
        : [];
      return { idx, count, title, netAmount, taxes };
    });
  }, [selectedRooms]);

  const totalTaxAmount = useMemo(
    () =>
      aggregatedTaxes.reduce(
        (s, t) => s + (typeof t.amount === "number" ? t.amount : 0),
        0,
      ),
    [aggregatedTaxes],
  );

  return (
    <div className="mt-4 rounded-[16px] border-[1.5px] border-[#E4E4E7] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b-[1.5px] border-[#E4E4E7] px-4 py-3">
        <div className="text-[16px] font-semibold text-[#0A0C0F]">
          Price breakdown
        </div>
        <CardCollapseToggle open={open} onClick={onToggleOpen} />
      </div>

      <div
        className={[
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="px-4 py-3 text-[14px] font-normal leading-6">
            {roomLines.length === 0 ? (
              <div className="text-[14px] font-normal text-[#3D495C]">
                No room rate details available.
              </div>
            ) : (
              <>
                <div className="text-[14px] font-semibold text-[#0A0C0F]">
                  Room rates
                </div>
                {roomLines.map((line) => {
                  const roomTotal = line.netAmount * line.count;
                  return (
                    <div className="mt-3" key={line.idx}>
                      <div className="text-[14px] font-normal text-[#0A0C0F]">
                        {line.title}
                        {line.count > 1 ? (
                          <span className="font-normal text-[#3D495C]">
                            {" "}
                            × {line.count}
                          </span>
                        ) : null}
                      </div>
                      <ul className="mt-1 space-y-1 pl-3 text-[14px] font-normal">
                        <li className="flex items-center justify-between">
                          <span className="text-[#3D495C]">Room total</span>
                          <span className="font-normal text-[#0A0C0F]">
                            {formatMoney(roomTotal, currency)}
                          </span>
                        </li>
                        {line.taxes.length > 0 && (
                          <>
                            <li className="pt-0.5 text-[14px] font-normal text-[#3D495C]">
                              Taxes & fees (this room type)
                            </li>
                            {line.taxes.map((tax, ti) => {
                              const amt =
                                (typeof tax.amount === "number"
                                  ? tax.amount
                                  : 0) * line.count;
                              return (
                                <li
                                  key={ti}
                                  className="flex items-center justify-between pl-2"
                                >
                                  <span className="text-[#3D495C]">
                                    {tax.name || "Tax"}
                                    {tax.included ? " (incl.)" : ""}
                                  </span>
                                  <span className="font-normal text-[#0A0C0F]">
                                    {formatMoney(amt, currency)}
                                  </span>
                                </li>
                              );
                            })}
                          </>
                        )}
                      </ul>
                    </div>
                  );
                })}

                {aggregatedTaxes.length > 0 && roomLines.length > 1 && (
                  <div className="mt-4">
                    {/* <div className="mt-4 border-t border-[#E4E4E7] pt-3"> */}
                    <div className="text-[14px] font-semibold text-[#0A0C0F]">
                      Taxes & fees (all rooms)
                    </div>
                    <ul className="mt-2 space-y-1 pl-3 text-[14px] font-normal">
                      {aggregatedTaxes.map((tax, ai) => (
                        <li
                          key={`${tax.name}-${ai}`}
                          className="flex items-center justify-between"
                        >
                          <span className="text-[#3D495C]">
                            {tax.name || "Tax"}
                            {tax.included ? " (incl.)" : ""}
                          </span>
                          <span className="font-normal text-[#0A0C0F]">
                            {formatMoney(tax.amount ?? 0, currency)}
                          </span>
                        </li>
                      ))}
                      <li className="flex items-center justify-between pt-1">
                        <span className="text-[#3D495C]">Taxes subtotal</span>
                        <span className="font-normal text-[#0A0C0F]">
                          {formatMoney(totalTaxAmount, currency)}
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {open && <div className="h-[1.5px] bg-[#E4E4E7]" />}

      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-[14px] font-normal text-[#3D495C]">Total</span>
        <span className="text-[16px] font-normal text-[#0A0C0F]">
          {formatMoney(totalPrice, currency)}
        </span>
      </div>
    </div>
  );
}
