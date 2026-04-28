import InfoPrimary from "../../assets/svgs/info-primary.svg";

type TaxItem = {
  name?: string;
  amount?: number;
  included?: boolean;
};

type Props = {
  totalPrice?: number;
  currency?: string;
  taxes?: TaxItem[];
  className?: string;
};

export default function HotelPriceSummaryTooltip({
  totalPrice,
  currency = "AED",
  taxes = [],
  className = "ml-auto",
}: Props) {
  const mergedTaxes = taxes.reduce<TaxItem[]>((acc, tax) => {
    const label = (tax.name || "Tax").trim() || "Tax";
    const key = label.toLowerCase();
    const add = typeof tax.amount === "number" ? tax.amount : 0;
    const existing = acc.find(
      (t) => (t.name || "").trim().toLowerCase() === key,
    );
    if (existing) {
      existing.amount = (existing.amount ?? 0) + add;
      if (tax.included) existing.included = true;
    } else {
      acc.push({
        name: label,
        amount: add,
        included: !!tax.included,
      });
    }
    return acc;
  }, []);

  return (
    <div className={`relative group ${className}`}>
      <button>
        <img src={InfoPrimary} alt="icon" />
      </button>
      <div className="absolute bottom-full right-0 pb-2 hidden group-hover:block z-[9999] w-64">
        <div className="bg-[#F2F2F3] rounded-lg px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.15)] relative">
          {/* Triangle arrow at bottom */}
          <div className="absolute -bottom-2 right-2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#F2F2F3]"></div>

          <p className="text-[#000000] text-sm font-semibold mb-3 text-left">
            Price summary
          </p>

          <table className="w-full text-xs" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "60%" }} />
              <col style={{ width: "40%" }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="text-[#3D495C] py-0.5 align-middle text-left">
                  Total price
                </td>
                <td className="font-semibold text-[#0A0C0F] text-right py-0.5 align-middle whitespace-nowrap">
                  {currency} {totalPrice?.toFixed(2)}
                </td>
              </tr>
              {mergedTaxes.map((tax, idx) => (
                <tr key={idx}>
                  <td className="text-[#3D495C] py-0.5 align-middle text-left">
                    {tax.name || "Tax"}
                    {tax.included ? " (incl.)" : ""}
                  </td>
                  <td className="font-semibold text-[#0A0C0F] text-right py-0.5 align-middle whitespace-nowrap">
                    {currency} {(tax.amount ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}