const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function clockTime12(value: string): { hour: number; minute: number; ampm: "AM" | "PM" } {
  const match = TIME.exec(value);
  const hour24 = match ? Number(match[1]) : 9;
  const minute = match ? Number(match[2]) : 0;
  return { hour: hour24 % 12 || 12, minute, ampm: hour24 >= 12 ? "PM" : "AM" };
}

export function clockTime24(hour: number, minute: number, ampm: string): string | null {
  if (!Number.isInteger(hour) || hour < 1 || hour > 12
    || !Number.isInteger(minute) || minute < 0 || minute > 59
    || (ampm !== "AM" && ampm !== "PM")) return null;
  const hour24 = (hour % 12) + (ampm === "PM" ? 12 : 0);
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
