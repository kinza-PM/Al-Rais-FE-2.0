import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import "../assets/css/travel.css";
import { useActivityDetail } from "../hooks/sightseeing/useActivityDetail";
import {
  buildActivitiesPreConfirmBody,
  defaultActivityAvailabilityDateRange,
  postPreConfirmBooking,
} from "../services/api/activitiesSearch";
import type { SightseeingActivity } from "../features/sightseeing/types";

type DetailLocationState = {
  from?: string;
  to?: string;
  preview?: SightseeingActivity;
  context?: {
    country?: string;
    city?: string;
    destinationCode?: string;
  };
};

const SightseeingActivityDetailPage: React.FC = () => {
  const { activityCode: activityCodeParam } = useParams<{
    activityCode: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as DetailLocationState;

  const activityCode = activityCodeParam
    ? decodeURIComponent(activityCodeParam)
    : "";

  const range = useMemo(() => {
    if (state.from && state.to) {
      return { from: state.from, to: state.to };
    }
    return defaultActivityAvailabilityDateRange(30);
  }, [state.from, state.to]);

  const { data: detail, isLoading, isError, error } = useActivityDetail({
    activityCode,
    from: range.from,
    to: range.to,
  });

  const preview = state.preview;

  const [selectedRateKey, setSelectedRateKey] = useState<string>("");
  const [surname, setSurname] = useState("");
  const [givenName, setGivenName] = useState("");
  const [email, setEmail] = useState("");

  const rateOptions = detail?.rateOptions ?? [];

  useEffect(() => {
    if (rateOptions.length > 0 && !selectedRateKey) {
      setSelectedRateKey(rateOptions[0].rateKey);
    }
  }, [rateOptions, selectedRateKey]);

  const preConfirm = useMutation({
    mutationFn: (body: Record<string, unknown>) => postPreConfirmBooking(body),
    onSuccess: (raw) => {
      const o =
        raw && typeof raw === "object" && !Array.isArray(raw)
          ? (raw as Record<string, unknown>)
          : null;
      const booking = o?.booking as Record<string, unknown> | undefined;
      const ref =
        booking && typeof booking.reference === "string"
          ? booking.reference
          : JSON.stringify(raw).slice(0, 120);
      toast.success(`Preconfirm OK — reference: ${ref}`);
    },
    onError: (e: Error) => {
      toast.error(e.message || "Preconfirm failed");
    },
  });

  const onPreConfirm = () => {
    const rk = selectedRateKey || rateOptions[0]?.rateKey;
    if (!rk) {
      toast.error("Select a rate (run detail call with real API if empty).");
      return;
    }
    if (!surname.trim() || !givenName.trim() || !email.trim()) {
      toast.error("Enter holder surname, given name, and email.");
      return;
    }
    const body = buildActivitiesPreConfirmBody({
      clientReference: `WEB-${Date.now()}`,
      rateKey: rk,
      from: range.from,
      to: range.to,
      holder: {
        surname: surname.trim(),
        name: givenName.trim(),
        email: email.trim(),
      },
    });
    preConfirm.mutate(body);
  };

  const displayTitle = detail?.name || preview?.title || activityCode;
  const displayImage = preview?.imageSrc;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      <div className="mx-auto w-full max-w-[960px] px-6 pt-8 sm:px-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 text-[14px] font-medium text-[#2351A3] hover:underline"
        >
          ← Back to results
        </button>

        <div className="overflow-hidden rounded-[16px] border border-[#E4E4E7] bg-white shadow-sm">
          {displayImage ? (
            <div className="h-[220px] w-full overflow-hidden sm:h-[280px]">
              <img
                src={displayImage}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="space-y-6 p-6 sm:p-8">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-[#98A4B3]">
                Sightseeing · Activity detail
              </p>
              <h1 className="mt-2 text-[24px] font-bold tracking-tight text-[#0A0C0F] sm:text-[28px]">
                {displayTitle}
              </h1>
              {detail?.code ? (
                <p className="mt-2 text-[13px] text-[#3D495C]">
                  Code <span className="font-mono">{detail.code}</span>
                  {detail.currency ? (
                    <>
                      {" "}
                      · currency{" "}
                      <span className="font-medium">{detail.currency}</span>
                    </>
                  ) : null}
                </p>
              ) : null}
              {state.context?.destinationCode ? (
                <p className="mt-1 text-[13px] text-[#98A4B3]">
                  Destination {state.context.destinationCode}
                  {state.context.city ? ` · ${state.context.city}` : ""}
                </p>
              ) : null}
            </div>

            {isLoading ? (
              <p className="text-[15px] text-[#3D495C]">Loading detail…</p>
            ) : null}
            {isError ? (
              <p className="text-[15px] text-red-600">
                {(error as Error)?.message || "Could not load activity detail."}
              </p>
            ) : null}

            {!isLoading && !isError && rateOptions.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-[16px] font-semibold text-[#0A0C0F]">
                  Rates (preconfirm uses one rateKey)
                </h2>
                <ul className="space-y-2">
                  {rateOptions.map((r) => (
                    <li key={r.rateKey}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-[#E4E4E7] bg-[#F8FAFC] p-4">
                        <input
                          type="radio"
                          name="rateKey"
                          className="mt-1"
                          checked={selectedRateKey === r.rateKey}
                          onChange={() => setSelectedRateKey(r.rateKey)}
                        />
                        <div>
                          <p className="text-[14px] font-medium text-[#0A0C0F]">
                            {r.label}
                          </p>
                          <p className="mt-1 font-mono text-[12px] text-[#64748B]">
                            {r.rateKey}
                          </p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            ) : !isLoading && !isError ? (
              <p className="text-[14px] text-[#64748B]">
                No rate keys in this response — detail payload may use a
                different shape with your live API.
              </p>
            ) : null}

            <section className="space-y-4 border-t border-[#E4E4E7] pt-6">
              <h2 className="text-[16px] font-semibold text-[#0A0C0F]">
                Lead guest (preconfirm)
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[13px] font-medium text-[#3D495C]">
                  Surname
                  <input
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="mt-1 w-full rounded-[10px] border border-[#C2CAD6] px-3 py-2 text-[14px]"
                    autoComplete="family-name"
                  />
                </label>
                <label className="block text-[13px] font-medium text-[#3D495C]">
                  Given name
                  <input
                    value={givenName}
                    onChange={(e) => setGivenName(e.target.value)}
                    className="mt-1 w-full rounded-[10px] border border-[#C2CAD6] px-3 py-2 text-[14px]"
                    autoComplete="given-name"
                  />
                </label>
                <label className="block text-[13px] font-medium text-[#3D495C] sm:col-span-2">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-[10px] border border-[#C2CAD6] px-3 py-2 text-[14px]"
                    autoComplete="email"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={onPreConfirm}
                disabled={preConfirm.isPending}
                className="rounded-full bg-[#2351A3] px-8 py-3 text-[14px] font-bold text-white disabled:opacity-50"
              >
                {preConfirm.isPending ? "Sending…" : "Preconfirm booking"}
              </button>
              <p className="text-[12px] leading-relaxed text-[#98A4B3]">
                Flow: activitiesDetail → pick rateKey → preConfirmBooking (then
                confirm / reconfirm per your backend and Hotel Beds docs).
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SightseeingActivityDetailPage;
