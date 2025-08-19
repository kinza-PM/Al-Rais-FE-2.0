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
