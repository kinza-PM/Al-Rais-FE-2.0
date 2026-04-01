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
};

export default function HotelPriceSummaryTooltip({
  totalPrice,
  currency = "AED",
  taxes = [],
}: Props) {
  const uniqueTaxes = taxes.reduce<TaxItem[]>((acc, tax) => {
    const name = (tax.name || "Tax").trim().toLowerCase();
    if (!acc.some((t) => (t.name || "").trim().toLowerCase() === name)) {
      acc.push(tax);
    }
    return acc;
  }, []);

  return (
    <div className="relative group ml-auto">
      <button>
        <img src={InfoPrimary} alt="icon" />
      </button>
      <div className="absolute right-0 mb-2 hidden group-hover:block z-10 w-64">
        <div className="bg-[#F2F2F3] rounded-lg px-5 py-4 shadow-lg">
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
              {uniqueTaxes.map((tax, idx) => (
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