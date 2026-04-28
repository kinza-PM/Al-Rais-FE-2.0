import React from "react";
import EmiratesLogo from "../../assets/images/emirates.png";
import QatarLogo from "../../assets/images/qatar.png";
import Copy from "../../assets/svgs/copy.svg";
import Button from "../atoms/Button";

type Program = {
    id: string;
    name: string;
    available: string;
    redeemed: string;
    tier: string;
    membershipId: string;
    logo?: string;
};

const programs: Program[] = [
    {
        id: "emirates",
        name: "Emirates Skywards",
        available: "13,450 miles",
        redeemed: "2,000 miles",
        tier: "Silver member",
        membershipId: "ES66YTR778",
        logo: EmiratesLogo,
    },
    {
        id: "qatar",
        name: "Qatar Airways Privilege Club",
        available: "9,500 miles",
        redeemed: "3,576 miles",
        tier: "Gold Elite",
        membershipId: "6QRT4281BBN",
        logo: QatarLogo,
    },
];

const LoyaltyPrograms: React.FC = () => {
    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch { }
    };

    return (
        <section className="w-full">
            <h2 className="mb-4 text-lg font-semibold text-[#0A0C0F]">
                Your loyalty programs
            </h2>

            <div className="overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white shadow-sm">
                <div className="max-[625px]:overflow-x-auto">
                    <table className="w-full table-fixed border-collapse max-[625px]:min-w-[780px]">
                        <thead>
                            <tr className="border-b border-[#E4E4E7] text-left">
                                <th className="py-4 pr-6 pl-[80px] text-[15px] font-medium text-[#0A0C0F] w-[25%]">
                                    Program
                                </th>
                                <th className="px-6 py-4 text-[15px] font-medium text-[#0A0C0F]">
                                    Available air miles
                                </th>
                                <th className="px-6 py-4 text-[15px] font-medium text-[#0A0C0F]">
                                    Redeemed air miles
                                </th>
                                <th className="px-6 py-4 text-[15px] font-medium text-[#0A0C0F]">
                                    Current tier
                                </th>
                                <th className="px-6 py-4 text-[15px] font-medium text-[#0A0C0F]">
                                    Membership ID
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#E4E4E7]">
                            {programs.map((p) => (
                                <tr key={p.id} className="align-middle">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-[#E4E4E7]">
                                                {p.logo ? (
                                                    <img
                                                        src={p.logo}
                                                        alt={p.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#0A0C0F]">
                                                        {p.name[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[13px] text-[#0A0C0F]">{p.name}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-[13px] text-[#3D495C]">
                                        {p.available}
                                    </td>
                                    <td className="px-6 py-4 text-[13px] text-[#3D495C]">
                                        {p.redeemed}
                                    </td>
                                    <td className="px-6 py-4 text-[13px] text-[#3D495C]">
                                        {p.tier}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[13px] text-[#0A0C0F]">
                                                {p.membershipId}
                                            </span>
                                            <Button
                                                type="button"
                                                onClick={() => copy(p.membershipId)}
                                                className="rounded p-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2351A3]"
                                                aria-label="Copy membership ID"
                                                overrideClasses
                                            >
                                                <img alt="copy" src={Copy} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                        <tfoot>
                            <tr className="border-t border-[#E4E4E7]">
                                <td colSpan={5} className="py-6"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

            </div>
        </section>
    );
};

export default LoyaltyPrograms;
