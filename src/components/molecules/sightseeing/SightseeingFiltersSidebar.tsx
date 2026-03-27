import React, { useState, useRef, useEffect } from "react";
import { Checkbox, Input } from "antd";
import downArrowPng from "../../../assets/images/Down-arrow.png";
import type {
  SightseeingActivityHours,
  SightseeingGroupSize,
} from "../../../features/sightseeing/types";

export type SightseeingSortOption =
  | "recommended"
  | "name"
  | "price_low"
  | "price_high"
  | "rating"
  | "rating_low";

export type SightseeingListFiltersState = {
  sort: SightseeingSortOption;
  groupSizes: SightseeingGroupSize[];
  starRatings: number[];
  hourBuckets: SightseeingActivityHours[];
  ageChildren: boolean;
  ageTeens: boolean;
  ageAdults: boolean;
  priceMin: string;
  priceMax: string;
};

type Props = {
  filters: SightseeingListFiltersState;
  onFiltersChange: (next: SightseeingListFiltersState) => void;
  activeCount: number;
};

const GROUP_OPTIONS: { value: SightseeingGroupSize; label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "small", label: "Small group" },
  { value: "private", label: "Private group" },
  { value: "large", label: "Large group" },
];

const STAR_LEVELS = [1, 2, 3, 4, 5];

const HOUR_OPTIONS: { value: SightseeingActivityHours; label: string }[] = [
  { value: "0-3h", label: "0–3h" },
  { value: "3-6h", label: "3–6h" },
  { value: "6-12h", label: "6–12h" },
  { value: "12h+", label: "12h+" },
  { value: "24h+", label: "24h+" },
];

/** Figma: Sort by menu labels */
const SORT_SELECT_OPTIONS: { value: SightseeingSortOption; label: string }[] =
  [
    { value: "recommended", label: "Recommended" },
    { value: "name", label: "Name" },
    { value: "price_low", label: "Price (Lowest first)" },
    { value: "price_high", label: "Price (Highest first)" },
    { value: "rating", label: "Rating (High to Low)" },
    { value: "rating_low", label: "Rating (Low to High)" },
  ];

function SortCheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="shrink-0"
      aria-hidden
    >
      <path
        d="M3.75 9.75L7.5 13.5L14.25 4.5"
        stroke="#2351A3"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function toggleNum(list: number[], n: number): number[] {
  return list.includes(n) ? list.filter((x) => x !== n) : [...list, n];
}

function toggleHour(
  list: SightseeingActivityHours[],
  h: SightseeingActivityHours,
): SightseeingActivityHours[] {
  return list.includes(h) ? list.filter((x) => x !== h) : [...list, h];
}

function toggleGroupSize(
  list: SightseeingGroupSize[],
  v: SightseeingGroupSize,
): SightseeingGroupSize[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

/** Figma sidebar column */
const W = "w-full max-w-[280px] lg:mx-0";

const priceInputClass =
  "h-[44px] rounded-[12px] border-[1.5px] border-[#C2CAD6] bg-white";

type CollapsibleKey = "group" | "star" | "hours" | "age" | "price";

function CollapsibleFilterCard({
  title,
  open,
  onToggle,
  borderClass,
  headerClass,
  bodyClass,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  borderClass: string;
  headerClass: string;
  bodyClass: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${W} mb-3 overflow-hidden rounded-[16px] border-[1.5px] ${borderClass}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between border-none px-3 py-2.5 text-left ${headerClass}`}
      >
        <span className="text-[13px] font-semibold text-[#0A0C0F]">
          {title}
        </span>
        <img
          src={downArrowPng}
          alt=""
          className={`h-3.5 w-3.5 shrink-0 object-contain transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      {open ? <div className={bodyClass}>{children}</div> : null}
    </div>
  );
}

const SightseeingFiltersSidebar: React.FC<Props> = ({
  filters,
  onFiltersChange,
  activeCount,
}) => {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [openSections, setOpenSections] = useState<
    Record<CollapsibleKey, boolean>
  >({
    group: true,
    star: true,
    hours: true,
    age: true,
    price: true,
  });

  useEffect(() => {
    if (!sortMenuOpen) return;
    const close = (e: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target as Node)
      ) {
        setSortMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSortMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [sortMenuOpen]);

  const toggleSection = (key: CollapsibleKey) => {
    setOpenSections((o) => ({ ...o, [key]: !o[key] }));
  };

  const patch = (partial: Partial<SightseeingListFiltersState>) =>
    onFiltersChange({ ...filters, ...partial });

  const resetAll = () =>
    onFiltersChange({
      sort: filters.sort,
      groupSizes: [],
      starRatings: [],
      hourBuckets: [],
      ageChildren: false,
      ageTeens: false,
      ageAdults: false,
      priceMin: "",
      priceMax: "",
    });

  const sortLabel =
    SORT_SELECT_OPTIONS.find((o) => o.value === filters.sort)?.label ??
    "Recommended";

  return (
    <aside
      className="sightseeing-filters-sidebar w-full shrink-0 bg-transparent"
      style={{ maxWidth: 280 }}
    >
      {/* Sort by — trigger Figma card; menu 307×240, rounded-md */}
      <div ref={sortDropdownRef} className={`${W} relative mb-3 max-w-[280px]`}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={sortMenuOpen}
          aria-label="Sort by"
          onClick={() => setSortMenuOpen((v) => !v)}
          className="box-border flex h-[70px] w-full max-w-[280px] items-center justify-between gap-3 rounded-[16px] border-[1.5px] border-[#3D495C] bg-[#F2F2F3] px-4 text-left"
        >
          <div className="flex min-w-0 flex-col justify-center gap-0.5">
            <span className="text-[11px] font-medium leading-tight text-[#3D495C]">
              Sort by
            </span>
            <span className="truncate text-[14px] font-semibold leading-tight text-[#0A0C0F]">
              {sortLabel}
            </span>
          </div>
          <img
            src={downArrowPng}
            alt=""
            className={`h-4 w-4 shrink-0 object-contain transition-transform duration-200 ${
              sortMenuOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>

        {sortMenuOpen ? (
          <div
            className="absolute left-0 top-full z-[100] mt-1 box-border flex h-[240px] w-[307px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-md border border-[#C2CAD6] bg-[#F2F2F3] shadow-[0_8px_24px_rgba(12,40,86,0.12)]"
            role="listbox"
            aria-label="Sort options"
          >
            <div className="min-h-0 flex-1 overflow-y-auto py-0">
              {SORT_SELECT_OPTIONS.map((o) => {
                const selected = filters.sort === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      patch({ sort: o.value });
                      setSortMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-3 border-b border-[#E4E4E7] px-4 py-3.5 text-left text-[14px] font-medium transition-colors last:border-b-0 ${
                      selected
                        ? "bg-[#EBEDF0] text-[#3D495C]"
                        : "text-[#3D495C] hover:bg-[#E8EAED]"
                    }`}
                  >
                    <span className="min-w-0 flex-1">{o.label}</span>
                    {selected ? <SortCheckIcon /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className={`${W} mb-3 flex h-[22px] shrink-0 items-center justify-between gap-2`}>
        <span className="text-[14px] font-semibold text-[#0A0C0F]">
          Filters{" "}
          <span className="font-normal text-[#3D495C]">
            • {activeCount} Active
          </span>
        </span>
        <button
          type="button"
          onClick={resetAll}
          disabled={activeCount === 0}
          className="shrink-0 text-[13px] font-medium text-[#98A4B3] hover:text-[#3D495C] hover:underline disabled:opacity-40 disabled:hover:no-underline"
        >
          Reset all
        </button>
      </div>

      <CollapsibleFilterCard
        title="Group size"
        open={openSections.group}
        onToggle={() => toggleSection("group")}
        borderClass="border-[#C2CAD6] bg-[#F2F2F3]"
        headerClass="bg-[#F2F2F3]"
        bodyClass="px-3 py-3 bg-[#F2F2F3]"
      >
        <div className="flex flex-col gap-2">
          {GROUP_OPTIONS.map((o) => (
            <Checkbox
              key={o.value}
              checked={filters.groupSizes.includes(o.value)}
              onChange={() =>
                patch({
                  groupSizes: toggleGroupSize(filters.groupSizes, o.value),
                })
              }
              className="text-[13px] text-[#0A0C0F]"
            >
              {o.label}
            </Checkbox>
          ))}
        </div>
      </CollapsibleFilterCard>

      <CollapsibleFilterCard
        title="Star ratings"
        open={openSections.star}
        onToggle={() => toggleSection("star")}
        borderClass="border-[#E4E4E7] bg-white"
        headerClass="bg-white"
        bodyClass="bg-white px-3 py-3"
      >
        <div className="flex flex-col gap-2">
          {STAR_LEVELS.map((n) => (
            <Checkbox
              key={n}
              checked={filters.starRatings.includes(n)}
              onChange={() =>
                patch({
                  starRatings: toggleNum(filters.starRatings, n),
                })
              }
              className="text-[13px]"
            >
              {n} Star{n > 1 ? "s" : ""}
            </Checkbox>
          ))}
        </div>
      </CollapsibleFilterCard>

      <CollapsibleFilterCard
        title="Activity hours"
        open={openSections.hours}
        onToggle={() => toggleSection("hours")}
        borderClass="border-[#C2CAD6] bg-[#F2F2F3]"
        headerClass="bg-[#F2F2F3]"
        bodyClass="bg-[#F2F2F3] px-3 py-3"
      >
        <div className="flex flex-wrap gap-2">
          {HOUR_OPTIONS.map((o) => {
            const on = filters.hourBuckets.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() =>
                  patch({
                    hourBuckets: toggleHour(filters.hourBuckets, o.value),
                  })
                }
                className={`rounded-full border-[1.5px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  on
                    ? "border-[#2351A3] bg-[#EEF4FF] text-[#2351A3]"
                    : "border-[#C2CAD6] bg-white text-[#3D495C] hover:border-[#2351A3]/50"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </CollapsibleFilterCard>

      <CollapsibleFilterCard
        title="Allowed age"
        open={openSections.age}
        onToggle={() => toggleSection("age")}
        borderClass="border-[#E4E4E7] bg-white"
        headerClass="bg-white"
        bodyClass="bg-white px-3 py-3"
      >
        <div className="flex flex-col gap-2">
          <Checkbox
            checked={filters.ageChildren}
            onChange={(e) => patch({ ageChildren: e.target.checked })}
            className="text-[13px]"
          >
            Children (6–12)
          </Checkbox>
          <Checkbox
            checked={filters.ageTeens}
            onChange={(e) => patch({ ageTeens: e.target.checked })}
            className="text-[13px]"
          >
            Teens (13–17)
          </Checkbox>
          <Checkbox
            checked={filters.ageAdults}
            onChange={(e) => patch({ ageAdults: e.target.checked })}
            className="text-[13px]"
          >
            Adults (18+)
          </Checkbox>
        </div>
      </CollapsibleFilterCard>

      <CollapsibleFilterCard
        title="Price range"
        open={openSections.price}
        onToggle={() => toggleSection("price")}
        borderClass="border-[#C2CAD6] bg-[#F2F2F3]"
        headerClass="bg-[#F2F2F3]"
        bodyClass="bg-[#F2F2F3] px-3 py-3"
      >
        <div className="flex items-center gap-2">
          <Input
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => patch({ priceMin: e.target.value })}
            className={priceInputClass}
          />
          <span className="text-[#98A4B3]">—</span>
          <Input
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => patch({ priceMax: e.target.value })}
            className={priceInputClass}
          />
        </div>
      </CollapsibleFilterCard>
    </aside>
  );
};

export default SightseeingFiltersSidebar;
