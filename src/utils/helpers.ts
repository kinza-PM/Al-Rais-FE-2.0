export function calculateFlightDuration(
  startTime: string,
  startDate: string,
  endTime: string,
  endDate: string
): string {
  // Parse into real Date objects
  const start = new Date(`${startDate} ${startTime}`);
  const end = new Date(`${endDate} ${endTime}`);

  // Duration in minutes
  const diffMs = end.getTime() - start.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // Convert into hours + minutes
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return `${hours}h ${minutes}min`;
}


export function formatTime(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short", // Mon
    day: "2-digit", // 16
    month: "long", // June
    year: "numeric", // 2025
  });
}

export function buildFilterPreferenceForFlightSearchRequest(
  selectedPriceId?: string | null,
  selectedMaxConnections?: number | null
) {
  const maxConnections = typeof selectedMaxConnections === "number" ? selectedMaxConnections : 0;

  const preference = selectedPriceId
    ? {
      preference: {
        farePreference: [
          {
            farePreference: selectedPriceId,
          },
        ],
      },
    }
    : undefined;

  return preference ? { ...preference, maxConnections } : { maxConnections };
}