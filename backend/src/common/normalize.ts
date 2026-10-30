import { Transform } from 'class-transformer';

// Bỏ khoảng trắng/dấu chấm/gạch trong số điện thoại: "0912 345 678" -> "0912345678".
export const normalizePhone = (v: string) => v.replace(/[\s.\-]/g, '');

export const NormalizePhone = () => Transform(({ value }) => (typeof value === 'string' ? normalizePhone(value) : value));
export const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
export const Lowercase = () => Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));
export const Uppercase = () => Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value));

// Chuỗi tiếng Việt -> slug ASCII: "Tắm spa cao cấp" -> "tam-spa-cao-cap"
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Ngày/giờ theo múi giờ Việt Nam (server có thể chạy UTC).
const VN = 'Asia/Ho_Chi_Minh';
export function vnNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: VN,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

export const addMinutes = (hhmm: string, minutes: number) => {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
