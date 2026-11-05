// Khung giờ hẹn sinh từ giờ mở/đóng cửa; bỏ mốc 12:00 (nghỉ trưa 12:00–13:00).
const LUNCH_BREAK_HOUR = 12;

export function buildTimeSlots(openTime: string, closeTime: string): string[] {
  const hourOf = (t: string) => Number(t.slice(0, 2));
  const slots: string[] = [];
  for (let h = hourOf(openTime); h < hourOf(closeTime); h++) {
    if (h === LUNCH_BREAK_HOUR) continue;
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

// Ngày hôm nay theo giờ máy người dùng, dạng YYYY-MM-DD.
export function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function nowHHmm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
